#!/usr/bin/env bash
# Render our LIVE pages (with ?theme=) and the original captures on the same GitHub runner, then compare.
# usage: devtools/checktheme.sh THEME OUTDIR "our/path|https://web.archive.org/web/<ts>if_/<url>" ...
#   our/path is relative to the site root, e.g. "app/adium/" or "item/?id=wlm-45"
# Push theme changes first: our side is rendered from the live GitHub Pages site.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=https://melo-foundation.github.io/customization-museum/
theme=$1; out=$2; shift 2
urls=()
for pair in "$@"; do
  ours=${pair%%|*}; ref=${pair#*|}
  sep='?'; [[ $ours == *\?* ]] && sep='&'
  urls+=("$SITE$ours${sep}theme=$theme&warned=1" "$ref")
done
./wbshot.sh "$out" 1024 "${urls[@]}" >/dev/null
n=0
for pair in "$@"; do
  a=$(printf '%02d' $((n * 2 + 1))); b=$(printf '%02d' $((n * 2 + 2))); n=$((n + 1))
  name=$(printf '%s' "${pair%%|*}" | tr -c 'a-zA-Z0-9' '_' | cut -c1-40)
  printf '%-42s ' "$name"
  python3 devtools/compare.py "$theme" "$out/$a.png" "$out/$b.png" "$out/$name" | tail -1
done
