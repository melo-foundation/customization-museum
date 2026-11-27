#!/usr/bin/env bash
# Mirror Wayback pages with everything they load (HTML, CSS, images), via GitHub Actions.
# usage: devtools/grab.sh OUTDIR "https://web.archive.org/web/<ts>if_/<url>" ...  -> OUTDIR/pageNN/...
set -euo pipefail
cd "$(dirname "$0")/.."
R=melo-foundation/customization-museum
out=$1; shift
tag="grab-$(date +%s)-$RANDOM"
gh workflow run grab.yml --repo $R -f urls="$*" -f tag="$tag" >/dev/null
for _ in $(seq 1 360); do
  sleep 10
  for id in $(gh run list --repo $R --workflow grab.yml --limit 15 --json databaseId,status --jq '.[] | select(.status=="completed") | .databaseId'); do
    if gh api "repos/$R/actions/runs/$id/artifacts" --jq '.artifacts[].name' | grep -qx "$tag"; then
      mkdir -p "$out" && gh run download "$id" --repo $R -n "$tag" -D "$out"
      cat "$out/index.tsv"
      exit 0
    fi
  done
done
echo "timed out waiting for $tag" >&2
exit 1
