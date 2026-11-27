#!/usr/bin/env bash
# Publica la instantánea estática en Cloudflare Pages.
# Requiere una sola vez:  npx wrangler login
set -euo pipefail
cd "$(dirname "$0")"

python3 build_static.py
npx --yes wrangler@latest pages deploy dist \
  --project-name github-access-console \
  --commit-dirty=true
