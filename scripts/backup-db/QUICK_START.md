# Quick Start: Database Backups

## Create Manual Backup

```bash
./scripts/backup-db.sh
# or
npm run db:backup
```

Backups are saved to `backups/` directory with timestamp in filename.

## Safe Database Migrations

**⚠️ Always backup before migrations!**

### Option 1: Automated Safe Migration (Recommended)

```bash
# Automatically creates backup, then runs migration
npm run db:migrate:safe

# Or use the script directly
./scripts/safe-migrate.sh "npm run prisma:migrate"
./scripts/safe-migrate.sh "prisma db push"
```

### Option 2: Manual Migration

```bash
# 1. Create backup
npm run db:backup

# 2. Run migration
npm run prisma:migrate
```

See [MIGRATION_WORKFLOW.md](./MIGRATION_WORKFLOW.md) for full details.

## Setup Automated Backups (macOS)

Run backups automatically twice daily (9 AM and 9 PM):

```bash
# Install schedule
./scripts/backup-db/setup-schedule.sh install

# Check status
./scripts/backup-db/setup-schedule.sh status

# View logs
./scripts/backup-db/setup-schedule.sh logs
```

## Important Notes

- **Docker Required**: Database must be running in `flashcards-db` container
- **Start Database**: `docker compose up -d postgres`
- **Backup Format**: Custom compressed format (`.sql` files)
- **Backup Location**: `backups/flashcards_backup_YYYY-MM-DDTHH-MM-SS.sql`

## Troubleshooting

**Database container not running:**

```bash
docker compose up -d postgres
```

**Check if schedule is active:**

```bash
launchctl list | grep flashcards
```

**View recent backups:**

```bash
ls -lth backups/ | head
```

**Manual test of scheduled backup:**

```bash
# Run the same command that launchd will execute
./scripts/backup-db.sh
```

## Full Documentation

See [README.md](./README.md) for complete documentation including:

- Backup restoration
- Customizing schedule times
- Manual launchd configuration
- Additional troubleshooting
