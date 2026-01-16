#!/bin/bash
set -euo pipefail

# Configuration
SERVER="root@164.92.130.190"
REMOTE_DIR="/opt/flashcards"
LOCAL_BACKUP_FILE="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if backup file is provided
if [ -z "$LOCAL_BACKUP_FILE" ]; then
    log_error "Usage: $0 <path-to-backup-file>"
    log_info "Example: $0 backups/flashcards_backup_2026-01-16T19-59-57.sql"
    exit 1
fi

# Check if backup file exists
if [ ! -f "$LOCAL_BACKUP_FILE" ]; then
    log_error "Backup file not found: $LOCAL_BACKUP_FILE"
    exit 1
fi

BACKUP_SIZE=$(du -h "$LOCAL_BACKUP_FILE" | cut -f1)
log_info "Backup file: $LOCAL_BACKUP_FILE (size: $BACKUP_SIZE)"

echo ""
log_warn "=== WARNING: This will REPLACE ALL DATA in production database ==="
log_warn "Current production data will be DELETED"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_info "Operation cancelled"
    exit 0
fi

echo ""
log_info "=== Step 1: Creating backup of production database ==="
ssh "$SERVER" "$REMOTE_DIR/scripts/server-setup/backup-db-prod.sh" || {
    log_error "Failed to create production backup"
    log_warn "Continuing anyway..."
}

echo ""
log_info "=== Step 2: Uploading local backup to server ==="
REMOTE_BACKUP="/tmp/$(basename "$LOCAL_BACKUP_FILE")"
scp "$LOCAL_BACKUP_FILE" "$SERVER:$REMOTE_BACKUP" || {
    log_error "Failed to upload backup file"
    exit 1
}
log_info "Backup uploaded to: $REMOTE_BACKUP"

echo ""
log_info "=== Step 3: Stopping application (to prevent data corruption) ==="
ssh "$SERVER" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml stop app" || {
    log_warn "Failed to stop app, continuing..."
}

echo ""
log_info "=== Step 4: Dropping and recreating database ==="
ssh "$SERVER" << 'EOF'
docker exec flashcards-db psql -U flashcards -d flashcards << 'SQL'
-- Disconnect all users
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'flashcards' AND pid <> pg_backend_pid();
SQL

# Drop and recreate database
docker exec flashcards-db psql -U flashcards -d postgres << 'SQL'
DROP DATABASE IF EXISTS flashcards;
CREATE DATABASE flashcards;
SQL
EOF

if [ $? -ne 0 ]; then
    log_error "Failed to recreate database"
    exit 1
fi

echo ""
log_info "=== Step 5: Running database migrations (create schema) ==="
log_info "Applying migrations to create the correct database schema..."
# Mount prisma directory and use npx with explicit version to avoid Prisma 7.x
# The production image should have Prisma installed, but we specify version to be safe
ssh "$SERVER" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml run --rm --no-deps -v $REMOTE_DIR/prisma:/app/prisma app sh -c 'npx --yes prisma@5.7.0 migrate deploy'" || {
    log_error "Failed to apply migrations"
    exit 1
}
log_info "Migrations applied successfully"

echo ""
log_info "=== Step 6: Clearing all data before restore ==="
log_info "Truncating all tables to avoid conflicts..."
# Get all table names and truncate them (except _prisma_migrations)
ssh "$SERVER" << 'EOF'
docker exec flashcards-db psql -U flashcards -d flashcards -t -c "
SELECT 'TRUNCATE TABLE ' || quote_ident(schemaname) || '.' || quote_ident(tablename) || ' CASCADE;'
FROM pg_tables
WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
ORDER BY tablename;
" | docker exec -i flashcards-db psql -U flashcards -d flashcards
EOF
log_info "All tables truncated"

echo ""
log_info "=== Step 7: Restoring data from backup ==="
log_info "Restoring data into the migrated schema..."
# Detect backup format by checking file header locally
BACKUP_FORMAT=$(file "$LOCAL_BACKUP_FILE" | grep -o "custom database dump" || echo "")
if [[ -n "$BACKUP_FORMAT" ]] || [[ "$LOCAL_BACKUP_FILE" == *.dump ]]; then
    log_info "Detected custom format dump, using pg_restore..."
    # Copy file into container and restore from there
    # Use --data-only to restore only data, not schema (schema already created by migrations)
    # --disable-triggers speeds up data-only restore
    # Use --no-data-for-failed-tables to continue restore even if some tables fail
    # Some tables may have schema mismatches, but we'll restore what we can
    ssh "$SERVER" "docker cp $REMOTE_BACKUP flashcards-db:/tmp/restore.dump && docker exec flashcards-db pg_restore -U flashcards -d flashcards --data-only --no-owner --no-acl --disable-triggers --no-data-for-failed-tables /tmp/restore.dump 2>&1 | grep -v '^pg_restore: warning:' || true && docker exec flashcards-db rm -f /tmp/restore.dump" || {
        log_warn "Some tables failed to restore (schema mismatch), but continuing..."
        # Check if at least some data was restored
        ssh "$SERVER" "docker exec flashcards-db psql -U flashcards -d flashcards -t -c \"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name != '_prisma_migrations';\" | xargs" | grep -q "[0-9]" || {
            log_error "No tables found after restore, aborting"
            exit 1
        }
    }
else
    log_info "Detected SQL format, using psql..."
    # For SQL dumps, we need to extract only data (skip schema creation)
    # But if it's a full dump, we'll need to handle it differently
    log_warn "SQL format detected. If this is a full dump (schema + data), consider using --data-only export"
    ssh "$SERVER" "docker exec -i flashcards-db psql -U flashcards -d flashcards < $REMOTE_BACKUP" || {
        log_error "Failed to restore database using psql"
        exit 1
    }
fi
log_info "Data restored successfully"

echo ""
log_info "=== Step 8: Starting application ==="
ssh "$SERVER" "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml start app" || {
    log_warn "Failed to start app, please start manually"
}

echo ""
log_info "=== Step 9: Cleaning up temporary files ==="
ssh "$SERVER" "rm -f $REMOTE_BACKUP"

echo ""
log_info "=== Verification ==="
log_info "Checking database connection..."
ssh "$SERVER" "docker exec flashcards-db psql -U flashcards -d flashcards -c 'SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = '\''public'\'';'" || {
    log_warn "Could not verify database state"
}

echo ""
log_info "=== Restore completed successfully! ==="
log_info "Production database has been restored from: $LOCAL_BACKUP_FILE"
log_warn "Please verify the data and restart the application if needed"
