# Systemd units

Operational units for the self-hosted Lumora deployment.

## Data backup (lumora-backup)

Runs `scripts/backup-data.sh` on a daily timer to snapshot `web/.data/` (token
metadata, comments, and uploaded images), which lives only on this VPS and is
not covered by git.

Install:

```bash
sudo cp scripts/systemd/lumora-backup.service /etc/systemd/system/
sudo cp scripts/systemd/lumora-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now lumora-backup.timer
```

Verify and operate:

```bash
systemctl list-timers lumora-backup.timer   # next scheduled run
sudo systemctl start lumora-backup.service   # run a backup now
journalctl -u lumora-backup.service -n 20    # last run output
```

Snapshots are written to `/root/lumora-backups` by default, keeping the newest
14. Override with `BACKUP_DIR` and `KEEP` in the service file.

Restore a snapshot:

```bash
systemctl stop lumora-web.service
tar -xzf /root/lumora-backups/lumora-data-YYYYMMDD-HHMMSS.tar.gz -C web
systemctl start lumora-web.service
```
