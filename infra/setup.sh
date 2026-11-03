#!/usr/bin/env bash
# One-time setup on the server: asks a few questions and writes infra/.env with
# strong random secrets. Run from the project folder:  bash infra/setup.sh
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE=".env"
if [[ -f "$ENV_FILE" && "${1:-}" != "--force" ]]; then
  echo "infra/.env already exists — keeping it (new secrets would lock you out of the database)."
  echo "Edit it directly, or run 'bash infra/setup.sh --force' on a brand-new server only."
  exit 1
fi
command -v openssl >/dev/null || { echo "openssl is required (sudo apt install openssl)"; exit 1; }

rand() { openssl rand -hex "$1"; }
ask() { # ask <prompt> <default> → answer
  local reply
  read -r -p "$1${2:+ [$2]}: " reply
  echo "${reply:-$2}"
}

echo "── Taj Band production setup ──────────────────────────────"
DOMAIN=$(ask "Domain (e.g. tajbandofficial.com)" "")
DOMAIN=${DOMAIN#http://}; DOMAIN=${DOMAIN#https://}; DOMAIN=${DOMAIN#www.}; DOMAIN=${DOMAIN%%/*}
[[ -n "$DOMAIN" ]] || { echo "A domain is required."; exit 1; }

BUSINESS_EMAIL=$(ask "Business email (gets enquiries and client replies)" "")
[[ "$BUSINESS_EMAIL" == *@* ]] || { echo "A valid email is required."; exit 1; }

ADMIN_EMAIL=$(ask "Admin panel login email" "$BUSINESS_EMAIL")
read -r -s -p "Admin panel password (12+ characters, Enter = generate one): " ADMIN_PASSWORD; echo
GENERATED_PASSWORD=""
if [[ -z "$ADMIN_PASSWORD" ]]; then
  ADMIN_PASSWORD=$(rand 9)
  GENERATED_PASSWORD=1
elif (( ${#ADMIN_PASSWORD} < 12 )); then
  echo "The admin password must be at least 12 characters."; exit 1
fi

echo
echo "Email sending via Gmail needs an App Password: https://myaccount.google.com/apppasswords"
SMTP_USER=$(ask "Gmail address that sends the emails" "$BUSINESS_EMAIL")
read -r -s -p "Gmail App Password (Enter = add later in infra/.env): " SMTP_PASS; echo

umask 077
cat > "$ENV_FILE" <<EOF
# Created by infra/setup.sh on $(date -u +%Y-%m-%dT%H:%MZ). Keep private; never commit.
DOMAIN=$DOMAIN
ACME_EMAIL=$BUSINESS_EMAIL

POSTGRES_PASSWORD=$(rand 24)
JWT_SECRET=$(rand 48)
INTERNAL_API_TOKEN=$(rand 32)
REVALIDATE_SECRET=$(rand 32)
STORAGE_ACCESS_KEY=taj$(rand 8)
STORAGE_SECRET_KEY=$(rand 24)

SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD

BUSINESS_EMAIL=$BUSINESS_EMAIL
INQUIRY_NOTIFY_EMAILS=
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
RESEND_API_KEY=
MAIL_FROM=

TURNSTILE_SECRET_KEY=
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
EOF

echo
echo "✓ Wrote infra/.env"
echo "  Website:  https://$DOMAIN"
echo "  Admin:    https://$DOMAIN/admin  (login: $ADMIN_EMAIL)"
if [[ -n "$GENERATED_PASSWORD" ]]; then
  echo "  Admin password: $ADMIN_PASSWORD   ← save it now (also in infra/.env)"
fi
[[ -n "$SMTP_PASS" ]] || echo "  ! No Gmail App Password yet — add SMTP_PASS to infra/.env, then run deploy again."
echo
echo "Next: make sure $DOMAIN, www.$DOMAIN and s3.$DOMAIN point to this server, then run:"
echo "  bash infra/deploy.sh"
