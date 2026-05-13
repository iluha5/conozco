# Database Backup

Runs `pg_dump` inside the `flashcards-db` container and copies the dump to `backups/` on the host. Custom format with a plain-SQL fallback. Each dump comes with a `.sql.info` sidecar containing metadata.

```bash
npm run db:backup            # recommended
./scripts/backup-db.sh
npx tsx scripts/backup-db/backup-database.ts
```

The DB container must be running (`docker compose up -d postgres`); `DATABASE_URL` is loaded from `.env`.

## Scheduled (macOS, launchd)

```bash
./scripts/backup-db/setup-schedule.sh install     # twice daily, 09:00 and 21:00
./scripts/backup-db/setup-schedule.sh status
./scripts/backup-db/setup-schedule.sh logs
./scripts/backup-db/setup-schedule.sh uninstall
```

Schedule lives in `com.flashcards.db-backup.plist`; reinstall after editing it.

## Restore

```bash
pg_restore -h <host> -p <port> -U <user> -d <db> backup_file.sql      # custom format
psql       -h <host> -p <port> -U <user> -d <db> < backup_file.sql    # plain SQL
```

Always back up before any migration (`npm run prisma:migrate`, `prisma migrate deploy`, `prisma db push`, `npm run prisma:seed`) — see `.cursorrules`.
