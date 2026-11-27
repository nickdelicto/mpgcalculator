#!/usr/bin/env bash
# Weekly gas price alert emails. Cron (VPS), 30 min after the Tuesday EIA price update:
#   45 11 * * 2 /home/delicto/apps/mpgcalculator/scripts/send-gas-alerts.sh >> /home/delicto/apps/mpgcalculator/logs/gas-alerts-send.log 2>&1
# Test without sending:  scripts/send-gas-alerts.sh --dry-run
# The secret is read from .env.local so it never appears in the crontab.
set -euo pipefail
cd "$(dirname "$0")/.."

SECRET=$(grep -E '^GAS_ALERTS_CRON_SECRET=' .env.local | head -1 | cut -d= -f2- | tr -d '"')
if [ -z "$SECRET" ]; then echo "$(date -u +%FT%TZ) GAS_ALERTS_CRON_SECRET not set in .env.local"; exit 1; fi

QS=""
[ "${1:-}" = "--dry-run" ] && QS="?dryRun=1"

echo "$(date -u +%FT%TZ) $(curl -sS -m 900 -X POST -H "Authorization: Bearer $SECRET" "http://127.0.0.1:3001/api/gas-alerts/send-weekly$QS")"
