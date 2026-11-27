#!/usr/bin/env bash
# Screenshot pages (e.g. Wayback captures, use .../web/<ts>if_/<url> to hide the toolbar) on GitHub Actions.
# usage: ./wbshot.sh OUTDIR WIDTH URL [URL...]   -> OUTDIR/NN.png, OUTDIR/NN.html (rendered DOM), OUTDIR/index.tsv
set -euo pipefail
R=melo-foundation/customization-museum
out=$1; width=$2; shift 2
tag="shots-$(date +%s)-$RANDOM"
gh workflow run shot.yml --repo $R -f urls="$*" -f width="$width" -f tag="$tag" >/dev/null
for _ in $(seq 1 360); do
  sleep 10
  for id in $(gh run list --repo $R --workflow shot.yml --limit 15 --json databaseId,status --jq '.[] | select(.status=="completed") | .databaseId'); do
    if gh api "repos/$R/actions/runs/$id/artifacts" --jq '.artifacts[].name' | grep -qx "$tag"; then
      mkdir -p "$out" && gh run download "$id" --repo $R -n "$tag" -D "$out"
      echo "$out/index.tsv"
      exit 0
    fi
  done
done
echo "timed out waiting for $tag" >&2
exit 1
