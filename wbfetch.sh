#!/usr/bin/env bash
# Fetch URLs (e.g. Wayback captures) on GitHub Actions and download them here.
# usage: ./wbfetch.sh OUTDIR URL [URL...]   -> OUTDIR/index.tsv (file, http code, url) + files
set -euo pipefail
R=melo-foundation/customization-museum
out=$1; shift
tag="pages-$(date +%s)-$RANDOM"
gh workflow run fetch.yml --repo $R -f urls="$*" -f tag="$tag" >/dev/null
for _ in $(seq 1 360); do
  sleep 10
  for id in $(gh run list --repo $R --workflow fetch.yml --limit 15 --json databaseId,status --jq '.[] | select(.status=="completed") | .databaseId'); do
    if gh api "repos/$R/actions/runs/$id/artifacts" --jq '.artifacts[].name' | grep -qx "$tag"; then
      mkdir -p "$out" && gh run download "$id" --repo $R -n "$tag" -D "$out"
      echo "$out/index.tsv"
      exit 0
    fi
  done
done
echo "timed out waiting for $tag" >&2
exit 1
