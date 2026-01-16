#!/bin/bash
set -euo pipefail

# Local backup settings
BACKUP_DIR="/opt/flashcards/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_BASE="$BACKUP_DIR/flashcards_$TIMESTAMP"
RETENTION_DAYS=14
LOG_FILE="/var/log/flashcards-backup.log"

# DigitalOcean Spaces settings
SPACES_BUCKET="conozco"
SPACES_REGION="sfo3"
SPACES_ENDPOINT="sfo3.digitaloceanspaces.com"
SPACES_PATH="s3://${SPACES_BUCKET}/database-backups/"
SPACES_RETENTION_DAYS=30

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

if ! docker ps --format "{{.Names}}" | grep -q "^flashcards-db$"; then
  log "ERROR: flashcards-db container is not running"; exit 1; fi

mkdir -p "$BACKUP_DIR"
log "Starting backup process..."

# Try custom format first
CONTAINER_TMP_DUMP="/tmp/flashcards_${TIMESTAMP}.dump"
FINAL_BACKUP_FILE=""

if docker exec flashcards-db pg_dump -U flashcards -d flashcards \
  --format=custom --compress=9 --file="$CONTAINER_TMP_DUMP" 2>>"$LOG_FILE"; then

  HOST_DUMP_FILE="${BACKUP_BASE}.dump"
  if docker cp "flashcards-db:${CONTAINER_TMP_DUMP}" "$HOST_DUMP_FILE" 2>>"$LOG_FILE"; then
    docker exec flashcards-db rm -f "$CONTAINER_TMP_DUMP" 2>/dev/null || true
    if [ -s "$HOST_DUMP_FILE" ]; then
      FINAL_BACKUP_FILE="$HOST_DUMP_FILE"
      SIZE=$(du -h "$FINAL_BACKUP_FILE" | cut -f1)
      log "SUCCESS: Backup created: $FINAL_BACKUP_FILE (size: $SIZE)"
    else
      log "ERROR: Dump file is empty"; exit 1
    fi
  else
    log "ERROR: Failed to copy dump from container"; exit 1
  fi
else
  log "WARNING: Custom dump failed, fallback to plain SQL gzip..."
  HOST_SQL_FILE="${BACKUP_BASE}.sql.gz"
  if docker exec flashcards-db pg_dump -U flashcards -d flashcards --format=plain 2>>"$LOG_FILE" \
    | gzip > "$HOST_SQL_FILE"; then
    if [ -s "$HOST_SQL_FILE" ]; then
      FINAL_BACKUP_FILE="$HOST_SQL_FILE"
      SIZE=$(du -h "$FINAL_BACKUP_FILE" | cut -f1)
      log "SUCCESS: Backup created (plain): $FINAL_BACKUP_FILE (size: $SIZE)"
    else
      log "ERROR: Plain SQL gzip file is empty"; exit 1
    fi
  else
    log "ERROR: Both backup methods failed"; exit 1
  fi
fi

# Функция загрузки в DigitalOcean Spaces
upload_to_spaces() {
  local FILE="$1"
  log "Uploading backup to DigitalOcean Spaces..."
  s3cmd put "$FILE" "${SPACES_PATH}$(basename "$FILE")" \
    --host="${SPACES_ENDPOINT}" \
    --host-bucket="${SPACES_BUCKET}.${SPACES_ENDPOINT}" \
    --region="${SPACES_REGION}" 2>>"$LOG_FILE"
}

cleanup_old_spaces_backups() {
  log "Cleaning old backups from Spaces (older than ${SPACES_RETENTION_DAYS} days)..."
  CUTOFF_TIMESTAMP=$(date -d "${SPACES_RETENTION_DAYS} days ago" +%s)
  s3cmd ls "${SPACES_PATH}" 2>/dev/null | while read -r line; do
    FILE_DATE=$(echo "$line" | awk '{print $1" "$2}')
    FILE_PATH=$(echo "$line" | awk '{print $4}')
    FILE_TS=$(date -d "$FILE_DATE" +%s 2>/dev/null || echo 0)
    if [ "$FILE_TS" -gt 0 ] && [ "$FILE_TS" -lt "$CUTOFF_TIMESTAMP" ]; then
      s3cmd del "$FILE_PATH" 2>>"$LOG_FILE" && log "Deleted old backup: $(basename "$FILE_PATH")"
    fi
  done
}

if command -v s3cmd &>/dev/null; then
  if upload_to_spaces "$FINAL_BACKUP_FILE"; then
    log "SUCCESS: Uploaded to Spaces"
    cleanup_old_spaces_backups
  else
    log "WARNING: Spaces upload failed, local backup retained"
  fi
else
  log "WARNING: s3cmd not found, skipping Spaces upload"
fi

# Local retention
log "Cleaning old local backups (older than ${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "flashcards_*.*" -mtime +$RETENTION_DAYS -delete -print 2>/dev/null \
  | wc -l | xargs -I{} echo "Deleted {} old local backup(s)" | tee -a "$LOG_FILE"

log "Backup process completed successfully"
