#!/usr/bin/env bash
# Publica el segundo cerebro (Quartz) en Cloudflare Pages.
# Requiere: npx wrangler login (una sola vez)
set -euo pipefail
cd "$(dirname "$0")"

npx quartz build
npx --yes wrangler@latest pages deploy public \
  --project-name segundo-cerebro \
  --branch main \
  --commit-dirty=true

echo ""
echo "Publicado en: https://segundo-cerebro-e4v.pages.dev"
