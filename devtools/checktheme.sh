#!/usr/bin/env bash
# Render our LIVE pages (with ?theme=) and the original captures on the same GitHub runner, then compare.
# usage: devtools/checktheme.sh THEME OUTDIR "our/path|REFERENCE" ...
#   our/path is relative to the site root, e.g. "app/adium/" or "item/?id=wlm-45"
#   REFERENCE is a Wayback URL (.../web/<ts>if_/<url>, rendered now), a local .png of a known-good
#   render, or "repo:<theme>/<page>.html" (a clean copy of the original page committed to the "refs" branch,
#   served on the runner itself: no Wayback dependency, same fonts as our side, never published).
# Push theme changes first: our side is rendered from the live GitHub Pages site.
set -euo pipefail
cd "$(dirname "$0")/.."
SITE=https://melo-foundation.github.io/customization-museum/
theme=$1; out=$2; shift 2
urls=()
for pair in "$@"; do
  ours=${pair%%|*}; ref=${pair#*|}
  sep='?'; [[ $ours == *\?* ]] && sep='&'
  urls+=("$SITE$ours${sep}theme=$theme&warned=1&fidelity=exact")
  [[ $ref == repo:* ]] && ref="http://localhost:8000/${ref#repo:}"
  [[ $ref == *.png ]] || urls+=("$ref")
done
./wbshot.sh "$out" 1024 "${urls[@]}" >/dev/null
n=0
for pair in "$@"; do
  ref=${pair#*|}
  n=$((n + 1)); a=$(printf '%02d' $n)
  if [[ $ref == *.png ]]; then b=; else n=$((n + 1)); b=$(printf '%02d' $n); fi
  name=$(printf '%s' "${pair%%|*}" | tr -c 'a-zA-Z0-9' '_' | cut -c1-40)
  printf '%-42s ' "$name"
  if [[ -n $b ]]; then refpng="$out/$b.png"; else refpng=$ref; fi
  python3 devtools/compare.py "$theme" "$out/$a.png" "$refpng" "$out/$name" | tail -1
done
