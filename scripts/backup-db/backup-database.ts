#!/usr/bin/env node

/**
 * Database Backup Script
 * Creates a backup of the PostgreSQL database using pg_dump
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root directory
const PROJECT_ROOT = join(__dirname, '../..');

// Backup directory
const BACKUP_DIR = join(PROJECT_ROOT, 'backups');

interface DatabaseConfig {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
}

/**
 * Parse DATABASE_URL and extract connection parameters
 */
function parseDatabaseUrl(databaseUrl: string): DatabaseConfig {
    try {
        const url = new URL(databaseUrl);

        return {
            host: url.hostname,
            port: url.port || '5432',
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
        };
    } catch (error) {
        throw new Error(
            `Invalid DATABASE_URL format: ${(error as Error).message}`,
        );
    }
}

/**
 * Generate timestamp for backup filename
 */
function generateTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Ensure backup directory exists
 */
function ensureBackupDir(): void {
    if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
        console.log(`Created backup directory: ${BACKUP_DIR}`);
    }
}

/**
 * Create database backup using pg_dump
 */
function createBackup(config: DatabaseConfig): string {
    const timestamp = generateTimestamp();
    const backupFileName = `flashcards_backup_${timestamp}.sql`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);

    // Temporary path inside container
    const containerTempPath = `/tmp/${backupFileName}`;

    console.log(`Starting database backup...`);
    console.log(`Backup file: ${backupFilePath}`);

    try {
        // Build pg_dump command to run inside container
        // Inside container, database is accessible at localhost:5432
        const pgDumpCommand = `docker exec flashcards-db pg_dump --host=localhost --port=5432 --username=flashcards --dbname=flashcards --no-password --format=custom --compress=9 --file="${containerTempPath}"`;

        console.log(`Executing: docker exec pg_dump inside container`);

        execSync(pgDumpCommand, {
            stdio: 'inherit',
        });

        // Copy backup file from container to host
        console.log(`Copying backup file from container to host...`);
        const copyCommand = `docker cp flashcards-db:"${containerTempPath}" "${backupFilePath}"`;
        execSync(copyCommand, {
            stdio: 'inherit',
        });

        // Clean up temporary file in container
        console.log(`Cleaning up temporary file in container...`);
        execSync(`docker exec flashcards-db rm "${containerTempPath}"`, {
            stdio: 'pipe', // Don't show output for cleanup
        });

        console.log(
            `✅ Database backup completed successfully: ${backupFilePath}`,
        );
        return backupFilePath;
    } catch (error) {
        console.error(`❌ Database backup failed: ${(error as Error).message}`);
        // Try to clean up temporary file in case of error
        try {
            execSync(`docker exec flashcards-db rm -f "${containerTempPath}"`, {
                stdio: 'pipe',
            });
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        throw error;
    }
}

/**
 * Create a simple SQL dump backup as fallback (plain text format)
 */
function createSqlBackup(config: DatabaseConfig): string {
    const timestamp = generateTimestamp();
    const backupFileName = `flashcards_backup_${timestamp}_plain.sql`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);

    // Temporary path inside container
    const containerTempPath = `/tmp/${backupFileName}`;

    console.log(`Creating SQL dump backup as fallback...`);

    try {
        // Create plain SQL dump inside container
        const pgDumpCommand = `docker exec flashcards-db pg_dump --host=localhost --port=5432 --username=flashcards --dbname=flashcards --no-password --format=plain --file="${containerTempPath}"`;

        execSync(pgDumpCommand, {
            stdio: 'inherit',
        });

        // Copy backup file from container to host
        console.log(`Copying SQL backup file from container to host...`);
        const copyCommand = `docker cp flashcards-db:"${containerTempPath}" "${backupFilePath}"`;
        execSync(copyCommand, {
            stdio: 'inherit',
        });

        // Clean up temporary file in container
        execSync(`docker exec flashcards-db rm "${containerTempPath}"`, {
            stdio: 'pipe',
        });

        console.log(`✅ SQL dump backup created: ${backupFilePath}`);
        return backupFilePath;
    } catch (error) {
        console.error(`❌ SQL dump backup failed: ${(error as Error).message}`);
        // Try to clean up temporary file in case of error
        try {
            execSync(`docker exec flashcards-db rm -f "${containerTempPath}"`, {
                stdio: 'pipe',
            });
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        throw error;
    }
}

/**
 * Create backup info file with metadata
 */
function createBackupInfo(backupPath: string, config: DatabaseConfig): void {
    const infoFilePath = `${backupPath}.info`;
    const info = {
        timestamp: new Date().toISOString(),
        database: config.database,
        host: config.host,
        port: config.port,
        user: config.user,
        backupType: 'pg_dump_custom',
        fileSize: existsSync(backupPath)
            ? require('fs').statSync(backupPath).size
            : 0,
    };

    try {
        writeFileSync(infoFilePath, JSON.stringify(info, null, 2));
        console.log(`📄 Backup info saved: ${infoFilePath}`);
    } catch (error) {
        console.warn(
            `⚠️  Failed to create backup info file: ${(error as Error).message}`,
        );
    }
}

/**
 * Check if Docker is available and container is running
 */
function checkDockerAndContainer(): void {
    try {
        // Check if Docker is available
        execSync('which docker', { stdio: 'pipe' });
    } catch (error) {
        console.error('❌ Docker not found in PATH');
        console.error('');
        console.error('Please install Docker:');
        console.error('https://docs.docker.com/get-docker/');
        console.error('');
        throw new Error('Docker is required for database backup');
    }

    try {
        // Check if flashcards-db container is running
        const result = execSync(
            'docker ps --filter "name=flashcards-db" --filter "status=running" --format "{{.Names}}"',
            {
                encoding: 'utf8',
                stdio: 'pipe',
            },
        );

        if (!result.trim().includes('flashcards-db')) {
            console.error('❌ flashcards-db container is not running');
            console.error('');
            console.error('Please start the database container:');
            console.error('  docker compose up -d postgres');
            console.error('  or');
            console.error('  docker-compose up -d postgres');
            console.error('');
            throw new Error('flashcards-db container must be running');
        }
    } catch (error) {
        console.error('❌ Failed to check Docker containers');
        throw new Error('Unable to verify container status');
    }
}

/**
 * Main function
 */
async function main() {
    try {
        console.log('🚀 Starting database backup process...\n');

        // Check if Docker is available and container is running
        checkDockerAndContainer();

        // Get DATABASE_URL from environment
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        // Parse database configuration
        const config = parseDatabaseUrl(databaseUrl);
        console.log(
            `📍 Database: ${config.database} on ${config.host}:${config.port}\n`,
        );

        // Ensure backup directory exists
        ensureBackupDir();

        // Create backup
        let backupPath: string;
        try {
            backupPath = createBackup(config);
        } catch (error) {
            console.warn(
                '⚠️  Custom format backup failed, trying plain SQL format...',
            );
            backupPath = createSqlBackup(config);
        }

        // Create backup info file
        createBackupInfo(backupPath, config);

        console.log('\n🎉 Database backup process completed successfully!');
        console.log(`📦 Backup saved to: ${backupPath}`);
    } catch (error) {
        console.error(
            `\n💥 Database backup failed: ${(error as Error).message}`,
        );
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Database Backup Script

This script creates PostgreSQL database backups using Docker containers.
It runs pg_dump inside the flashcards-db container and copies the backup to the host.

Usage:
  npm run db:backup
  or
  tsx scripts/backup-db/backup-database.ts

Requirements:
  - Docker must be installed and running
  - flashcards-db container must be running (start with: docker compose up -d postgres)

Environment Variables:
  DATABASE_URL - PostgreSQL connection string (loaded automatically from .env)

The script will create a backup in the 'backups' directory with timestamp in filename.
`);
    process.exit(0);
}

// Run main function
main();
