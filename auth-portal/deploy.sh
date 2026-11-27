#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
npx --yes wrangler@latest pages deploy public \
  --project-name auth-portal \
  --branch main \
  --commit-dirty=true
echo ""
echo "Publicado en: https://auth-portal-px1.pages.dev"
