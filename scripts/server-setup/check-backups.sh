#!/bin/bash
set -e

LOG_FILE="/var/log/flashcards-backup-check.log"
ALERT_EMAIL="your-email@example.com"
SPACES_PATH="s3://conozco/database-backups/"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verify s3cmd is configured
if ! command -v s3cmd &> /dev/null; then
    log "ERROR: s3cmd is not installed"
    exit 1
fi

# Check latest backup in Spaces
log "Checking latest backup in Spaces..."
LATEST_BACKUP=$(s3cmd ls "$SPACES_PATH" | tail -n 1 | awk '{print $1" "$2}')

if [ -z "$LATEST_BACKUP" ]; then
    log "ERROR: No backups found in Spaces!"
    # Optional: send email alert
    # echo "No backups found in Spaces" | mail -s "CRITICAL: Backup Alert" "$ALERT_EMAIL"
    exit 1
fi

log "Latest backup date: $LATEST_BACKUP"

# Calculate backup age
LATEST_TIMESTAMP=$(date -d "$LATEST_BACKUP" +%s 2>/dev/null || echo 0)

if [ "$LATEST_TIMESTAMP" -eq 0 ]; then
    log "ERROR: Failed to parse backup timestamp"
    exit 1
fi

CURRENT_TIMESTAMP=$(date +%s)
AGE_HOURS=$(( ($CURRENT_TIMESTAMP - $LATEST_TIMESTAMP) / 3600 ))

# Fail if backup is older than 24 hours
if [ "$AGE_HOURS" -gt 24 ]; then
    log "WARNING: Latest backup is ${AGE_HOURS} hours old!"
    # Optional: send email alert
    # echo "Latest backup is ${AGE_HOURS} hours old" | mail -s "WARNING: Backup Alert" "$ALERT_EMAIL"
    exit 1
else
    log "OK: Latest backup is ${AGE_HOURS} hours old"
fi

# Check backup count
BACKUP_COUNT=$(s3cmd ls "$SPACES_PATH" | wc -l)
log "Total backups in Spaces: $BACKUP_COUNT"

if [ "$BACKUP_COUNT" -lt 5 ]; then
    log "WARNING: Only $BACKUP_COUNT backups found (expected at least 5)"
fi

log "Backup check completed successfully"
