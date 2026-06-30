#!/usr/bin/env bash
#
# Back up the off-chain data store.
#
# The app keeps token metadata, comments, and uploaded images under web/.data/.
# That directory is gitignored and lives only on this VPS, so it is not covered
# by git or by scripts/deploy.sh. This script snapshots it into a timestamped
# tar.gz and keeps the most recent ones, deleting older snapshots.
#
# Usage:  scripts/backup-data.sh
#
# Environment:
#   BACKUP_DIR   Where snapshots are written. Default: /root/lumora-backups
#   KEEP         How many snapshots to retain. Default: 14
#
# Schedule it with the systemd timer in scripts/systemd/ (see the README there),
# or from cron, for example a daily run at 03:30:
#   30 3 * * *  /root/lumora-launchpad/scripts/backup-data.sh >> /var/log/lumora-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="$REPO_ROOT/web/.data"

BACKUP_DIR="${BACKUP_DIR:-/root/lumora-backups}"
KEEP="${KEEP:-14}"

if [ ! -d "$DATA_DIR" ]; then
  echo "==> Nothing to back up: $DATA_DIR does not exist"
  exit 0
fi

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$BACKUP_DIR/lumora-data-$STAMP.tar.gz"

echo "==> Backing up $DATA_DIR"
# -C so the archive holds a clean ".data" path without the full repo prefix.
tar -czf "$ARCHIVE" -C "$REPO_ROOT/web" .data
echo "    wrote $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"

echo "==> Pruning old snapshots, keeping the newest $KEEP"
# List newest first, skip the ones we keep, delete the rest.
mapfile -t OLD < <(ls -1t "$BACKUP_DIR"/lumora-data-*.tar.gz 2>/dev/null | tail -n +"$((KEEP + 1))")
if [ "${#OLD[@]}" -gt 0 ]; then
  for f in "${OLD[@]}"; do
    rm -f "$f"
    echo "    removed $f"
  done
else
  echo "    nothing to prune"
fi

echo "==> Backup complete"
