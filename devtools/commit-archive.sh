#!/usr/bin/env bash
# CI: merge this run's archive_state.json into the latest main, rebuild, and push (retrying on push races).
set -u
cp data/archive_state.json /tmp/state.json
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
for attempt in 1 2 3 4 5; do
  git fetch -q origin main && git reset -q --hard origin/main
  python3 archive.py merge /tmp/state.json && python3 build.py
  git add data/archive_state.json idx themes/index.json site app type item
  git diff --cached --quiet && exit 0
  git commit -q -m "Archive progress" && git push -q origin HEAD:main && exit 0
  sleep $((attempt * 10))
done
exit 1
