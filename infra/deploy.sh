#!/usr/bin/env bash
# Build and (re)start the whole site, then load the starter content.
# First install and every update:  bash infra/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[[ -f infra/.env ]] || { echo "Missing infra/.env — run: bash infra/setup.sh"; exit 1; }
command -v docker >/dev/null || { echo "Docker is not installed — see DEPLOY.md, step 2."; exit 1; }

COMPOSE=(docker compose -f infra/docker-compose.prod.yml)
DOMAIN=$(grep -E '^DOMAIN=' infra/.env | cut -d= -f2-)

echo "▸ Building images (first time takes 5–10 minutes)…"
"${COMPOSE[@]}" build --pull

echo "▸ Starting services and waiting until they're healthy…"
"${COMPOSE[@]}" up -d --remove-orphans --wait --wait-timeout 300

# Safe to repeat: creates the admin and starter content only where missing.
echo "▸ Loading starter content…"
"${COMPOSE[@]}" exec -T api ./node_modules/.bin/tsx prisma/seed.ts

"${COMPOSE[@]}" ps
echo
echo "✓ Live at https://$DOMAIN  ·  admin: https://$DOMAIN/admin"
echo "  The first visit can take ~30 s while HTTPS certificates are issued."
