#!/usr/bin/env bash
# Back up the database and uploaded images to infra/backups/ (keeps 14 days).
# Run by hand, or nightly via cron (see DEPLOY.md):  bash infra/backup.sh
set -euo pipefail
cd "$(dirname "$0")"

COMPOSE=(docker compose -f docker-compose.prod.yml)
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p backups

# --single-transaction: consistent snapshot without locking the site.
"${COMPOSE[@]}" exec -T db sh -c 'exec mysqldump -utaj -p"$MYSQL_PASSWORD" \
  --single-transaction --default-character-set=utf8mb4 --add-drop-table tajband' \
  | gzip > "backups/db_$STAMP.sql.gz"

# Uploaded images live in the storage volume.
docker run --rm \
  -v taj-band_storage_data:/data:ro \
  -v "$PWD/backups":/backup \
  alpine tar czf "/backup/images_$STAMP.tar.gz" -C /data .

find backups -type f -mtime +14 -delete
echo "✓ Backup saved: infra/backups/db_$STAMP.sql.gz, images_$STAMP.tar.gz"
