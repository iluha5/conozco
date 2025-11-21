#!/bin/bash

# Safe Migration Script
# This script ensures a backup is created before running database migrations

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 Safe Migration Script${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if migration command is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No migration command provided${NC}"
    echo ""
    echo "Usage: $0 <migration-command>"
    echo ""
    echo "Examples:"
    echo "  $0 \"npm run prisma:migrate\""
    echo "  $0 \"prisma migrate dev\""
    echo "  $0 \"prisma db push\""
    echo ""
    exit 1
fi

MIGRATION_COMMAND="$1"

echo -e "${YELLOW}📋 Migration command:${NC} $MIGRATION_COMMAND"
echo ""

# Step 1: Create backup
echo -e "${BLUE}Step 1: Creating database backup...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$PROJECT_ROOT"
BACKUP_OUTPUT=$("$SCRIPT_DIR/backup-db.sh" 2>&1)
BACKUP_STATUS=$?

if [ $BACKUP_STATUS -ne 0 ]; then
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "$BACKUP_OUTPUT"
    echo ""
    echo -e "${RED}Migration aborted. Fix backup issues first.${NC}"
    exit 1
fi

# Extract backup file path from output
BACKUP_PATH=$(echo "$BACKUP_OUTPUT" | grep -o 'backups/flashcards_backup_[^[:space:]]*\.sql' | tail -1)

if [ -z "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Could not determine backup file path!${NC}"
    echo "$BACKUP_OUTPUT"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Backup created successfully!${NC}"
echo -e "${GREEN}📦 Backup location:${NC} $BACKUP_PATH"
echo ""

# Step 2: Confirm before proceeding
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 2: Ready to run migration${NC}"
echo ""
echo -e "Migration command: ${YELLOW}$MIGRATION_COMMAND${NC}"
echo -e "Backup available at: ${GREEN}$BACKUP_PATH${NC}"
echo ""
read -p "Continue with migration? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸️  Migration cancelled by user${NC}"
    echo -e "${GREEN}Backup is available at: $BACKUP_PATH${NC}"
    exit 0
fi

# Step 3: Run migration
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Step 3: Running migration...${NC}"
echo ""

cd "$PROJECT_ROOT"
if eval "$MIGRATION_COMMAND"; then
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo -e "${GREEN}Backup is available for rollback if needed:${NC}"
    echo -e "  $BACKUP_PATH"
    echo ""
    echo -e "${BLUE}To rollback, see:${NC} scripts/backup-db/MIGRATION_WORKFLOW.md"
else
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Migration failed!${NC}"
    echo ""
    echo -e "${YELLOW}Backup is available for rollback:${NC}"
    echo -e "  $BACKUP_PATH"
    echo ""
    echo -e "${BLUE}To rollback, see:${NC} scripts/backup-db/MIGRATION_WORKFLOW.md"
    exit 1
fi

