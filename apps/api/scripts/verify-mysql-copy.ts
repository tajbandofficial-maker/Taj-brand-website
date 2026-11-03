/**
 * Field-by-field check that MySQL holds exactly the same data as the old PostgreSQL database
 * (after `pnpm db:copy-from-postgres`). Read-only on both sides.
 *
 *   PG_DATABASE_URL=postgresql://… pnpm db:verify-copy      (DATABASE_URL = MySQL)
 */
import "dotenv/config";

import pg from "pg";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { createMariaDbAdapter } from "../src/prisma/mariadb.js";

pg.types.setTypeParser(1114, (v) => new Date(`${v.replace(" ", "T")}Z`));

const source = new pg.Client({ connectionString: process.env.PG_DATABASE_URL });
const target = new PrismaClient({ adapter: createMariaDbAdapter(process.env.DATABASE_URL!) });

/** Stable string form: dates as ISO, object keys sorted. */
function norm(v: unknown): string {
  return JSON.stringify(v, function (_k, val: unknown) {
    const raw = (this as Record<string, unknown>)[_k];
    if (raw instanceof Date) return raw.toISOString();
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.fromEntries(Object.entries(val).sort(([a], [b]) => a.localeCompare(b)));
    }
    return val;
  });
}

const models = {
  AdminUser: () => target.adminUser.findMany(),
  Media: () => target.media.findMany(),
  Service: () => target.service.findMany(),
  Package: () => target.package.findMany(),
  AddOn: () => target.addOn.findMany(),
  PackageComparisonRow: () => target.packageComparisonRow.findMany(),
  GalleryItem: () => target.galleryItem.findMany(),
  Review: () => target.review.findMany(),
  Faq: () => target.faq.findMany(),
  Inquiry: () => target.inquiry.findMany(),
  SiteSettings: () => target.siteSettings.findMany(),
  PageContent: () => target.pageContent.findMany(),
} as const;

async function main() {
  await source.connect();
  let problems = 0;
  for (const [table, read] of Object.entries(models)) {
    const pgRows = (await source.query<Record<string, unknown>>(`SELECT * FROM "${table}"`)).rows;
    const myRows = (await read()) as Record<string, unknown>[];
    const idKey = table === "PageContent" ? "key" : "id";
    const byId = new Map(myRows.map((r) => [String(r[idKey]), r]));
    let diffs = 0;
    for (const a of pgRows) {
      const b = byId.get(String(a[idKey]));
      if (!b) {
        diffs++;
        console.log(`  ✗ ${table} ${String(a[idKey])}: missing in MySQL`);
        continue;
      }
      for (const col of Object.keys(a)) {
        if (norm(a[col]) !== norm(b[col])) {
          diffs++;
          console.log(
            `  ✗ ${table}.${col} (${String(a[idKey])}): ${norm(a[col])} ≠ ${norm(b[col])}`,
          );
        }
      }
    }
    problems += diffs;
    console.log(
      `${diffs ? "✗" : "✓"} ${table.padEnd(22)} ${pgRows.length} rows, ${diffs} differences`,
    );
  }
  if (problems) throw new Error(`${problems} difference(s) found`);
  console.log("\n✓ Every field of every row matches.");
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
