# Server Setup

Scripts run on the production host.

| Script | Purpose |
|---|---|
| `setup-server.sh` | First-time provisioning: Docker, Certbot, s3cmd, UFW, 2 GB swap, cron jobs, `deploy` user. |
| `backup-db-prod.sh` | Daily DB backup; uploads to DigitalOcean Spaces; rotates (14 days local, 30 days remote); logs to `/var/log/flashcards-backup.log`. |
| `check-backups.sh` | Verifies the latest Spaces backup is < 24h old. |

```bash
sudo ./scripts/server-setup/setup-server.sh   # one-time
/opt/flashcards/scripts/server-setup/backup-db-prod.sh
/opt/flashcards/scripts/server-setup/check-backups.sh
```

`setup-server.sh` registers the backup and check scripts in cron automatically. Requires `s3cmd` configured for DO Spaces and the `flashcards-db` container running.
