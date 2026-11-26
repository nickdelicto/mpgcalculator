#!/usr/bin/env bash
# Zero-downtime deploy for the VPS.
#
# Building in place (`npm run build` into .next) deletes the JS chunks the running
# server is still handing out, so visitors get "Application error: a client-side
# exception" for the 2-3 minutes the build takes. Instead we build into .next-new
# while the live site keeps serving .next, then swap the folders and restart.
# If the build fails, set -e stops the script and the live site is untouched.
#
# Usage (on the VPS):  bash scripts/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

git pull --ff-only origin main

rm -rf ./.next-new
NEXT_DIST_DIR=.next-new npm run build

rm -rf ./.next-prev
mv ./.next ./.next-prev
mv ./.next-new ./.next
pm2 restart mpgcalculator

echo "Deployed: $(git log --oneline -1)"
