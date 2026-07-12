#!/bin/bash
# Wait for the in-flight scrape run(s) to finish, pull the deepened data,
# and redeploy to Vercel so the corrected city counts go live. Runs a few
# cycles to catch back-to-back deep runs, then stops.
set -u
cd "$(dirname "$0")/.." || exit 1

active() {
  gh run list --workflow=scrape.yml --limit 6 --json status --jq '.[].status' \
    | grep -qE 'in_progress|pending|queued'
}

for cycle in 1 2 3; do
  echo "[watch] cycle $cycle: waiting for scrape run to finish..."
  # give it a moment to be queued, then wait for it to drain
  sleep 30
  while active; do sleep 90; done
  git pull --rebase --autostash -q origin main || true
  COUNT=$(python -c "import sys;sys.path.insert(0,'scraper');import db;print(db.count(db.connect()))" 2>/dev/null)
  echo "[watch] scrape idle. total=$COUNT -> redeploying"
  vercel deploy --prod --yes >/dev/null 2>&1 && echo "[watch] redeployed."
done
echo "[watch] done."
