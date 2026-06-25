#!/usr/bin/env bash
#
# Deploy the latest main to this VPS.
#
# Pulls the newest code, installs deps, builds the Next.js app, and restarts
# the systemd service that serves it. Caddy keeps running and proxies to the
# fresh build. Local files like web/.env.local are untracked and stay in place
# across deploys.
#
# Usage:  scripts/deploy.sh [branch]   (defaults to main)

set -euo pipefail

BRANCH="${1:-main}"
SERVICE="lumora-web.service"

# Resolve the repo root from this script's own location, so it works no matter
# where it is called from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_DIR="$REPO_ROOT/web"

echo "==> Repo:    $REPO_ROOT"
echo "==> Branch:  $BRANCH"

echo "==> Pulling latest code"
git -C "$REPO_ROOT" fetch --quiet origin "$BRANCH"
git -C "$REPO_ROOT" checkout --quiet "$BRANCH"
git -C "$REPO_ROOT" pull --quiet --ff-only origin "$BRANCH"
echo "    now at $(git -C "$REPO_ROOT" rev-parse --short HEAD) $(git -C "$REPO_ROOT" log -1 --pretty=%s)"

echo "==> Installing dependencies"
cd "$WEB_DIR"
npm install --no-audit --no-fund

echo "==> Building"
npm run build

echo "==> Restarting $SERVICE"
systemctl restart "$SERVICE"

# Wait for the app to answer on its local port before declaring success.
echo "==> Health check"
for i in $(seq 1 20); do
  code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000 2>/dev/null || true)"
  if [ "$code" = "200" ]; then
    echo "    OK: app is serving (HTTP 200)"
    echo "==> Deploy complete"
    exit 0
  fi
  sleep 1
done

echo "    WARNING: app did not return 200 in time. Check: journalctl -u $SERVICE -n 50"
exit 1
