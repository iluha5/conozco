# Database Backup Scripts

This directory contains scripts for backing up the PostgreSQL database used by the Flash Cards application.

**Note:** This script uses Docker containers to perform backups. It runs `pg_dump` inside the `flashcards-db` container and copies the backup files to the host machine.

## Files

- `backup-database.ts` - Main TypeScript script that creates database backups
- `README.md` - This documentation file

## Usage

### Using npm script (recommended)

```bash
npm run db:backup
```

### Using shell script

```bash
./scripts/backup-db.sh
```

### Direct execution

```bash
npx tsx scripts/backup-db/backup-database.ts
```

## Setup

### 1. Ensure Docker is Available

Make sure Docker is installed and running on your system:

```bash
# Check if Docker is installed
docker --version

# Check if Docker daemon is running
docker ps
```

### 2. Start Database Container

Make sure the `flashcards-db` container is running:

```bash
# Start the database container
docker compose up -d postgres

# Or with docker-compose (older versions)
docker-compose up -d postgres

# Check if container is running
docker ps | grep flashcards-db
```

### 3. Environment Variables

The script automatically loads environment variables from the `.env` file in the project root. The `DATABASE_URL` is used for logging purposes but the actual backup is performed inside the container using the container's internal connection parameters.

## Requirements

- Docker must be installed and running
- `flashcards-db` container must be running (PostgreSQL 16 alpine)
- Node.js and npm must be installed
- `.env` file with `DATABASE_URL` (loaded automatically)

## Backup Format

The script creates backups in PostgreSQL's custom format (compressed) by default. If that fails, it falls back to plain SQL format.

Backup files are saved in the `backups/` directory in the project root with the following naming convention:

- `flashcards_backup_YYYY-MM-DDTHH-MM-SS.sql` (custom format)
- `flashcards_backup_YYYY-MM-DDTHH-MM-SS_plain.sql` (fallback plain SQL format)

Each backup includes:

- Main backup file (.sql)
- Info file (.sql.info) with metadata (timestamp, database info, file size)

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (required)
    - Format: `postgresql://user:password@host:port/database`

## Examples

### Local Development (using Docker)

If you're using the Docker setup from `docker-compose.yml`, make sure the database container is running:

```bash
docker-compose up -d postgres
npm run db:backup
```

### Production Environment

Make sure `DATABASE_URL` is set in your environment:

```bash
export DATABASE_URL="postgresql://flashcards:flashcards_password@localhost:5433/flashcards"
npm run db:backup
```

## Troubleshooting

### pg_dump not found

Install PostgreSQL client tools:

**macOS:**

```bash
brew install postgresql
```

**Ubuntu/Debian:**

```bash
sudo apt-get install postgresql-client
```

**CentOS/RHEL:**

```bash
sudo yum install postgresql
```

### Connection refused

- Check if the database server is running
- Verify DATABASE_URL is correct
- Ensure firewall allows connections to the database port

### Permission denied

- Check database user permissions
- Ensure the user can connect and dump the database

## Backup Restoration

To restore from a backup:

```bash
# For custom format backups
pg_restore -h host -p port -U user -d database backup_file.sql

# For plain SQL format backups
psql -h host -p port -U user -d database < backup_file.sql
```

Replace `host`, `port`, `user`, `database`, and `backup_file.sql` with your actual values.
