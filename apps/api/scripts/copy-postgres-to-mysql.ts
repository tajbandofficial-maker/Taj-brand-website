/**
 * One-time copy of every row from the old PostgreSQL database into the new MySQL one.
 *
 * Safe by design:
 * - PostgreSQL is only read (SELECT), never changed. Keep it until you've checked the site.
 * - Refuses to run if the MySQL database already contains data (no overwrites, no duplicates).
 * - Everything is written in one MySQL transaction: either all rows land, or none do.
 * - Row counts are compared table by table at the end.
 *
 * Usage (from apps/api, DATABASE_URL in .env = the MySQL target):
 *   pnpm prisma migrate deploy                               # create the empty MySQL tables
 *   PG_DATABASE_URL=postgresql://taj:taj@localhost:5432/tajband pnpm db:copy-from-postgres
 */
import "dotenv/config";

import pg from "pg";

import { type Prisma, PrismaClient } from "../src/generated/prisma/client.js";
import { createMariaDbAdapter } from "../src/prisma/mariadb.js";

const PG_URL = process.env.PG_DATABASE_URL;
const MYSQL_URL = process.env.DATABASE_URL;
if (!PG_URL || !MYSQL_URL) {
  console.error("Set PG_DATABASE_URL (old PostgreSQL) and DATABASE_URL (new MySQL).");
  process.exit(1);
}

// Prisma kept PostgreSQL timestamps in UTC as TIMESTAMP(3) without a time zone. Read them
// as UTC — by default `pg` would use the machine's local time and shift every date (+5:30 in India).
const TIMESTAMP_OID = 1114;
pg.types.setTypeParser(TIMESTAMP_OID, (v) => new Date(`${v.replace(" ", "T")}Z`));

const source = new pg.Client({ connectionString: PG_URL });
const target = new PrismaClient({ adapter: createMariaDbAdapter(MYSQL_URL) });

type Row = Record<string, unknown>;
type Tx = Prisma.TransactionClient;

/** Tables in foreign-key order (parents first). */
const tables: { name: string; insert: (tx: Tx, rows: Row[]) => Promise<unknown> }[] = [
  { name: "AdminUser", insert: (tx, d) => tx.adminUser.createMany({ data: d as never }) },
  { name: "Media", insert: (tx, d) => tx.media.createMany({ data: d as never }) },
  { name: "Service", insert: (tx, d) => tx.service.createMany({ data: d as never }) },
  { name: "Package", insert: (tx, d) => tx.package.createMany({ data: d as never }) },
  { name: "AddOn", insert: (tx, d) => tx.addOn.createMany({ data: d as never }) },
  {
    name: "PackageComparisonRow",
    insert: (tx, d) => tx.packageComparisonRow.createMany({ data: d as never }),
  },
  { name: "GalleryItem", insert: (tx, d) => tx.galleryItem.createMany({ data: d as never }) },
  { name: "Review", insert: (tx, d) => tx.review.createMany({ data: d as never }) },
  { name: "Faq", insert: (tx, d) => tx.faq.createMany({ data: d as never }) },
  { name: "Inquiry", insert: (tx, d) => tx.inquiry.createMany({ data: d as never }) },
  { name: "SiteSettings", insert: (tx, d) => tx.siteSettings.createMany({ data: d as never }) },
  { name: "PageContent", insert: (tx, d) => tx.pageContent.createMany({ data: d as never }) },
  {
    // Implicit many-to-many Service ↔ Package: A = Package.id, B = Service.id.
    name: "_ServicePackages",
    insert: async (tx, rows) => {
      for (const r of rows) {
        await tx.$executeRaw`INSERT INTO \`_ServicePackages\` (\`A\`, \`B\`) VALUES (${r.A}, ${r.B})`;
      }
    },
  },
];

/** PostgreSQL text[] columns that are JSON arrays in MySQL (pg returns them as JS arrays). */
const listColumns: Record<string, string[]> = {
  Service: ["inclusions"],
  Package: ["inclusions"],
  PackageComparisonRow: ["values"],
  Inquiry: ["services"],
  SiteSettings: ["serviceAreas", "ticker"],
};
const jsonDefaults: Record<string, Record<string, unknown>> = {
  Service: { sections: [] },
  SiteSettings: { hours: [], socials: {} },
  PageContent: { fields: {} },
};

function prepare(table: string, row: Row): Row {
  const out: Row = { ...row };
  for (const col of listColumns[table] ?? []) out[col] = (row[col] as string[] | null) ?? [];
  for (const [col, fallback] of Object.entries(jsonDefaults[table] ?? {})) {
    out[col] = row[col] ?? fallback;
  }
  return out;
}

async function count(table: string, via: "pg" | "mysql"): Promise<number> {
  if (via === "pg") {
    const r = await source.query<{ n: string }>(`SELECT COUNT(*)::text AS n FROM "${table}"`);
    return Number(r.rows[0]!.n);
  }
  const r = await target.$queryRawUnsafe<{ n: bigint | number }[]>(
    `SELECT COUNT(*) AS n FROM \`${table}\``,
  );
  return Number(r[0]!.n);
}

async function main() {
  await source.connect();

  // Never write into a database that already has content.
  for (const { name } of tables) {
    const n = await count(name, "mysql");
    if (n > 0) {
      throw new Error(
        `MySQL table ${name} already has ${n} row(s). This script only fills an empty database — ` +
          "nothing was changed.",
      );
    }
  }

  const data: Record<string, Row[]> = {};
  for (const { name } of tables) {
    const r = await source.query<Row>(`SELECT * FROM "${name}"`);
    data[name] = r.rows.map((row) => prepare(name, row));
    console.log(`  read ${String(r.rowCount).padStart(5)}  ${name}`);
  }

  await target.$transaction(
    async (tx) => {
      for (const { name, insert } of tables) {
        const rows = data[name]!;
        for (let i = 0; i < rows.length; i += 200) await insert(tx, rows.slice(i, i + 200));
      }
    },
    { timeout: 300_000, maxWait: 30_000 },
  );

  console.log("\nTable                    PostgreSQL   MySQL");
  let ok = true;
  for (const { name } of tables) {
    const [a, b] = [await count(name, "pg"), await count(name, "mysql")];
    if (a !== b) ok = false;
    console.log(
      `${name.padEnd(24)} ${String(a).padStart(10)} ${String(b).padStart(7)}${a === b ? "" : "  ✗"}`,
    );
  }
  if (!ok) throw new Error("Row counts differ — check the table(s) marked ✗.");
  console.log("\n✓ All data copied. PostgreSQL was not modified.");
}

main()
  .catch((err: unknown) => {
    console.error(`\n✗ ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.end().catch(() => undefined);
    await target.$disconnect();
  });
