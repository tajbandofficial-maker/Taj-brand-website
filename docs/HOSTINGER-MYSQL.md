# Hostinger MySQL database

The API stores everything in MySQL through Prisma 7 (`@prisma/adapter-mariadb`). The same
code runs on MySQL 8 (local Docker, VPS) and MariaDB 10.6+ (Hostinger's "MySQL Databases").

## 1. Create the database

hPanel → **Websites → Manage → Databases → MySQL Databases**: create a database, a user and a
strong password. Hostinger prefixes both names, e.g. `u123456789_tajband` / `u123456789_taj`.

## 2. Set `DATABASE_URL`

```
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

- **HOST** — `localhost` when the API runs on the same Hostinger account. From anywhere else
  (your PC, a VPS) use the host name shown under _MySQL Databases_, and allow your IP in
  hPanel → **Databases → Remote MySQL**.
- **PASSWORD** — URL-encode special characters: `@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`.
- Optional: `?connection_limit=5` (shared hosting limits connections per user; 5 is the default).

## 3. Create the tables and move the data

From your PC, in `apps/api`, with the old PostgreSQL running
(`docker compose -f infra/docker-compose.dev.yml --profile legacy up -d legacy-postgres`):

```bash
# Windows PowerShell: $env:DATABASE_URL="mysql://…"; $env:PG_DATABASE_URL="postgresql://…"
export DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"          # Hostinger
export PG_DATABASE_URL="postgresql://taj:taj@localhost:5432/tajband"      # old data

pnpm prisma migrate deploy      # creates the empty tables
pnpm db:copy-from-postgres      # copies every row in one transaction, compares counts
pnpm db:verify-copy             # compares every field of every row
```

The copy refuses to run if the target already has data, never modifies PostgreSQL, and either
copies everything or nothing. Remove the Remote MySQL rule afterwards.

**Alternative (no Remote MySQL):** copy into the local MySQL first (same three commands with
`DATABASE_URL=mysql://taj:taj@localhost:3306/tajband`), then export and import it with
hPanel → **phpMyAdmin → Import**:

```bash
docker exec taj-band-dev-db-1 mysqldump -utaj -ptaj --single-transaction --no-tablespaces \
  --set-gtid-purged=OFF tajband > tajband.sql
```

The dump includes `_prisma_migrations`, so `prisma migrate deploy` later knows the schema is current.

## Backups

- Before the switch: `backups/postgres-before-mysql-2026-11-03.sql` (full `pg_dump`, git-ignored).
  The old Docker volume `taj-band-dev_pg_data_dev` is also kept — delete it only once the live
  site has been checked.
- Hostinger: hPanel → **Files → Backups** (daily), or phpMyAdmin → Export.
- VPS: `bash infra/backup.sh` (`mysqldump` + uploaded images).

## What changed from PostgreSQL

| PostgreSQL                   | MySQL                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------- |
| `String[]` lists             | `Json` arrays, read through `toStringList()` (`src/prisma/json.ts`)               |
| `Json @default(...)`         | No JSON defaults in MySQL — every create path passes the value                    |
| `String` = unlimited `TEXT`  | `String` = `VARCHAR(191)`; free text is `@db.Text`                                |
| `mode: "insensitive"` search | Not needed: `utf8mb4_unicode_ci` is case-insensitive                              |
| Old migrations               | Archived in `prisma/migrations-postgres-archive/`, one new `init_mysql` migration |
