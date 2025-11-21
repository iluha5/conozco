# Database Migration Workflow with Backup

This document describes the mandatory backup workflow before running database migrations.

## ⚠️ Important Rule

**ALWAYS create a database backup BEFORE running any migration!**

This is enforced in `.cursorrules` and AI assistants will automatically follow this workflow.

## 📋 Standard Migration Workflow

### Step 1: Create Backup

```bash
./scripts/backup-db.sh
# or
npm run db:backup
```

**Expected output:**

```
✅ Database backup completed successfully: /path/to/backup/flashcards_backup_2025-11-21T21-14-28.sql
```

### Step 2: Verify Backup

- Check that backup file was created
- Note the backup file path (you'll need it for rollback if something goes wrong)
- Confirm you see the ✅ success message

### Step 3: Run Migration

```bash
npm run prisma:migrate
# or
prisma migrate dev
```

### Step 4: Verify Migration

- Check that migration completed successfully
- Test the application to ensure everything works

## 🔄 Commands That Require Backup

All these commands MUST be preceded by a backup:

| Command                   | Description                | Requires Backup   |
| ------------------------- | -------------------------- | ----------------- |
| `npm run prisma:migrate`  | Run Prisma migrations      | ✅ Yes            |
| `prisma migrate dev`      | Development migrations     | ✅ Yes            |
| `prisma migrate deploy`   | Production migrations      | ✅ Yes            |
| `prisma db push`          | Push schema changes        | ✅ Yes            |
| `npm run prisma:seed`     | Seed database (production) | ✅ Yes            |
| `npm run prisma:generate` | Generate Prisma Client     | ❌ No (safe)      |
| `npm run prisma:studio`   | Open Prisma Studio         | ❌ No (read-only) |

## 🔙 Rollback Procedure

If migration fails or causes issues:

### 1. Stop the Application

```bash
docker compose down
```

### 2. Restore from Backup

```bash
# For custom format backups
docker exec -i flashcards-db pg_restore \
  --host=localhost --port=5432 \
  --username=flashcards --dbname=flashcards \
  --clean --no-owner \
  < backups/flashcards_backup_2025-11-21T21-14-28.sql

# For plain SQL format backups
docker exec -i flashcards-db psql \
  --host=localhost --port=5432 \
  --username=flashcards --dbname=flashcards \
  < backups/flashcards_backup_2025-11-21T21-14-28_plain.sql
```

### 3. Restart Application

```bash
docker compose up -d
```

## 📝 Example: Complete Migration Process

```bash
# 1. Create backup
echo "Creating database backup..."
./scripts/backup-db.sh

# Output should show:
# ✅ Database backup completed successfully: backups/flashcards_backup_2025-11-21T22-30-15.sql

# 2. Save backup path
BACKUP_PATH="backups/flashcards_backup_2025-11-21T22-30-15.sql"
echo "Backup saved to: $BACKUP_PATH"

# 3. Run migration
echo "Running migration..."
npm run prisma:migrate

# 4. If migration succeeds
echo "✅ Migration completed successfully!"
echo "Backup is available at: $BACKUP_PATH"

# 5. If migration fails
echo "❌ Migration failed!"
echo "To rollback, use backup at: $BACKUP_PATH"
```

## 🤖 AI Assistant Behavior

When you ask an AI assistant to run migrations, it will:

1. ✅ **Automatically run backup first**: `./scripts/backup-db.sh`
2. ✅ **Wait for confirmation**: Verify backup succeeded
3. ✅ **Save backup path**: Display it for potential rollback
4. ✅ **Run migration**: Execute the requested migration command
5. ✅ **Report status**: Inform you of success/failure with backup location

### Example AI Response

> "I'll run the migration, but first let me create a database backup as required..."
>
> ```bash
> ./scripts/backup-db.sh
> ```
>
> ✅ Backup created successfully: `backups/flashcards_backup_2025-11-21T22-30-15.sql`
>
> Now proceeding with the migration...
>
> ```bash
> npm run prisma:migrate
> ```

## 🔒 Safety Features

- **Automatic backup enforcement**: AI assistants won't run migrations without backup
- **Backup verification**: Process stops if backup fails
- **Rollback capability**: Every backup is timestamped and ready for restore
- **Scheduled backups**: Automated backups run twice daily (9 AM, 9 PM)

## 📚 Additional Resources

- **Backup Documentation**: [README.md](./README.md)
- **Quick Start Guide**: [QUICK_START.md](./QUICK_START.md)
- **Cursor Rules**: [.cursorrules](../../.cursorrules)
- **Backup Script**: [backup-db.sh](../backup-db.sh)

## ⚡ Quick Commands Reference

```bash
# Create manual backup
./scripts/backup-db.sh

# Run migration with backup
./scripts/backup-db.sh && npm run prisma:migrate

# Check backup status
./scripts/backup-db/setup-schedule.sh status

# View recent backups
ls -lth backups/ | head -10
```
