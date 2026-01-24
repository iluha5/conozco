#!/bin/bash

# Data Migrations Application Script
# This script applies data migrations to the production database
# It ensures a backup is created before applying migrations

set -euo pipefail  # Exit on error, undefined vars, pipe failures

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting data migrations application"
echo "📁 Project root: $PROJECT_ROOT"

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Check if we're running inside a Docker container
IS_DOCKER_CONTAINER=false
if [ -f "/.dockerenv" ] || [ -n "${container:-}" ]; then
    IS_DOCKER_CONTAINER=true
fi

# Check if we're on production server (check for backup script)
# Skip backup if running inside Docker container (backup script requires docker command from host)
BACKUP_SCRIPT="$PROJECT_ROOT/scripts/server-setup/backup-db-prod.sh"
if [ "$IS_DOCKER_CONTAINER" = "true" ]; then
    echo "ℹ️  Running inside Docker container - backup should have been created on host before deployment"
    echo "ℹ️  If backup was not created, migration will proceed without backup (NOT RECOMMENDED)"
    echo "ℹ️  In production, backup is created automatically by deployment workflow before migrations"
elif [ -f "$BACKUP_SCRIPT" ]; then
    echo "📦 Creating database backup before applying migrations..."
    echo "   Backup script: $BACKUP_SCRIPT"
    
    # Create backup (this must succeed or script will exit due to set -e)
    bash "$BACKUP_SCRIPT"
    
    if [ $? -ne 0 ]; then
        echo "❌ ERROR: Database backup failed. Aborting migration application."
        echo "   Migration application aborted for safety."
        exit 1
    fi
    
    echo "✅ Database backup created successfully"
else
    echo "⚠️  WARNING: Production backup script not found: $BACKUP_SCRIPT"
    echo "   Skipping backup (this is OK for local development)"
fi

# Check if compiled migration script exists
if [ ! -f "$PROJECT_ROOT/scripts/apply-data-migrations/apply-data-migrations.mjs" ]; then
    echo "❌ Compiled migration script not found. Please build the project first."
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📄 Loading environment variables from .env"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Get git SHA if available
if [ -n "${GIT_SHA:-}" ]; then
    export GIT_SHA="$GIT_SHA"
elif command -v git &> /dev/null; then
    export GIT_SHA="$(git rev-parse HEAD 2>/dev/null || echo '')"
fi

# Get applied by user
export APPLIED_BY="${APPLIED_BY:-${USER:-unknown}}"

# Run the compiled JavaScript migration script
cd "$PROJECT_ROOT"
echo ""
echo "📦 Applying data migrations..."
node scripts/apply-data-migrations/apply-data-migrations.mjs

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Data migrations applied successfully!"
else
    echo ""
    echo "❌ ERROR: Data migrations application failed"
    exit 1
fi
