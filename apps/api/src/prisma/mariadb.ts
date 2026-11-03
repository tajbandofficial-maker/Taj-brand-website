import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Prisma driver adapter for MySQL 8 / MariaDB (e.g. Hostinger's MySQL databases).
 *
 * DATABASE_URL uses Prisma's format so the CLI (migrate, studio) can read it too:
 *   mysql://USER:PASSWORD@HOST:3306/DATABASE
 * Optional query parameters:
 *   connection_limit=5            pool size (shared hosting caps connections per user)
 *   ssl=true                      require TLS (managed/remote databases)
 *   allowPublicKeyRetrieval=true  MySQL 8 `caching_sha2_password` without TLS
 * Special characters in the password must be URL-encoded (e.g. @ → %40, # → %23).
 */
export function createMariaDbAdapter(databaseUrl: string): PrismaMariaDb {
  const url = new URL(databaseUrl);
  if (!["mysql:", "mariadb:"].includes(url.protocol)) {
    throw new Error(`DATABASE_URL must start with mysql:// (got ${url.protocol}//)`);
  }
  const param = (name: string) => url.searchParams.get(name);
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, "")),
    connectionLimit: Number(param("connection_limit") ?? 5),
    allowPublicKeyRetrieval: param("allowPublicKeyRetrieval") === "true",
    ...(param("ssl") === "true" ? { ssl: true } : {}),
  });
}
