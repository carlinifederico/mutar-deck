#!/usr/bin/env bash
# Publica el deck en Cloudflare Pages: https://mutar-art.pages.dev
#
# Copia solo lo que el deck sirve (sin tools/, export/ ni los .md) a una
# carpeta temporal y la sube al proyecto "mutar-art". Necesita wrangler
# logueado una vez (`npx wrangler login`, cuenta carlini@3dar.com).
#
#   bash deck/tools/deploy-pages.sh
#
# No pasar --force: el proyecto ya existe como Pages y wrangler lo sabe.
set -euo pipefail

DECK="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

cp -r "$DECK/index.html" "$DECK/css" "$DECK/js" "$DECK/img" "$DECK/media" "$DECK/models" "$OUT/"

# Los PDF (tools/build-pdf.mjs) viajan con el deck: /pdf/MUTAR-deck-{en,es}.pdf
# No estan en git (pesan ~11 MB cada uno): se suben desde la copia local.
if ls "$DECK"/export/*.pdf >/dev/null 2>&1; then
  mkdir -p "$OUT/pdf"
  cp "$DECK"/export/*.pdf "$OUT/pdf/"
fi

cd "$OUT"
npx -y wrangler@latest pages deploy . --project-name=mutar-art --branch=main --commit-dirty=true
