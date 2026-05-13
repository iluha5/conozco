#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, '../..');
const BACKUP_DIR = join(PROJECT_ROOT, 'backups');

interface DatabaseConfig {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
}

function parseDatabaseUrl(databaseUrl: string): DatabaseConfig {
    try {
        const url = new URL(databaseUrl);
        return {
            host: url.hostname,
            port: url.port || '5432',
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1),
        };
    } catch (error) {
        throw new Error(
            `Invalid DATABASE_URL format: ${(error as Error).message}`,
        );
    }
}

function generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

function ensureBackupDir(): void {
    if (!existsSync(BACKUP_DIR)) {
        mkdirSync(BACKUP_DIR, { recursive: true });
    }
}

// pg_dump runs inside the container, then docker cp moves the dump to the host.
function createBackup(_config: DatabaseConfig): string {
    const timestamp = generateTimestamp();
    const backupFileName = `flashcards_backup_${timestamp}.sql`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);
    const containerTempPath = `/tmp/${backupFileName}`;

    try {
        const pgDumpCommand = `docker exec flashcards-db pg_dump --host=localhost --port=5432 --username=flashcards --dbname=flashcards --no-password --format=custom --compress=9 --file="${containerTempPath}"`;
        execSync(pgDumpCommand, { stdio: 'inherit' });

        execSync(
            `docker cp flashcards-db:"${containerTempPath}" "${backupFilePath}"`,
            { stdio: 'inherit' },
        );

        execSync(`docker exec flashcards-db rm "${containerTempPath}"`, {
            stdio: 'pipe',
        });

        return backupFilePath;
    } catch (error) {
        try {
            execSync(`docker exec flashcards-db rm -f "${containerTempPath}"`, {
                stdio: 'pipe',
            });
        } catch {
            // best-effort cleanup
        }
        throw error;
    }
}

// Plain-SQL fallback when the custom format fails (e.g. version skew of pg_dump vs server).
function createSqlBackup(_config: DatabaseConfig): string {
    const timestamp = generateTimestamp();
    const backupFileName = `flashcards_backup_${timestamp}_plain.sql`;
    const backupFilePath = join(BACKUP_DIR, backupFileName);
    const containerTempPath = `/tmp/${backupFileName}`;

    try {
        const pgDumpCommand = `docker exec flashcards-db pg_dump --host=localhost --port=5432 --username=flashcards --dbname=flashcards --no-password --format=plain --file="${containerTempPath}"`;
        execSync(pgDumpCommand, { stdio: 'inherit' });

        execSync(
            `docker cp flashcards-db:"${containerTempPath}" "${backupFilePath}"`,
            { stdio: 'inherit' },
        );

        execSync(`docker exec flashcards-db rm "${containerTempPath}"`, {
            stdio: 'pipe',
        });

        return backupFilePath;
    } catch (error) {
        try {
            execSync(`docker exec flashcards-db rm -f "${containerTempPath}"`, {
                stdio: 'pipe',
            });
        } catch {
            // best-effort cleanup
        }
        throw error;
    }
}

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
    } catch (error) {
        console.warn(
            `Failed to write backup info file: ${(error as Error).message}`,
        );
    }
}

function checkDockerAndContainer(): void {
    try {
        execSync('which docker', { stdio: 'pipe' });
    } catch {
        console.error(
            'Docker not found in PATH. See https://docs.docker.com/get-docker/',
        );
        throw new Error('Docker is required for database backup');
    }

    try {
        const result = execSync(
            'docker ps --filter "name=flashcards-db" --filter "status=running" --format "{{.Names}}"',
            { encoding: 'utf8', stdio: 'pipe' },
        );

        if (!result.trim().includes('flashcards-db')) {
            console.error(
                'flashcards-db container is not running. Start it with: docker compose up -d postgres',
            );
            throw new Error('flashcards-db container must be running');
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('container')) {
            throw error;
        }
        throw new Error('Unable to verify container status');
    }
}

async function main() {
    try {
        checkDockerAndContainer();

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        const config = parseDatabaseUrl(databaseUrl);
        ensureBackupDir();

        let backupPath: string;
        try {
            backupPath = createBackup(config);
        } catch {
            console.warn(
                'Custom-format backup failed, falling back to plain SQL.',
            );
            backupPath = createSqlBackup(config);
        }

        createBackupInfo(backupPath, config);
        console.log(`Backup saved: ${backupPath}`);
    } catch (error) {
        console.error(`Backup failed: ${(error as Error).message}`);
        process.exit(1);
    }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(
        `Usage: npm run db:backup\n\n` +
            `Runs pg_dump inside the flashcards-db container and writes the dump to ./backups/.\n` +
            `Requires Docker and the flashcards-db container running ` +
            `(docker compose up -d postgres). DATABASE_URL is loaded from .env.\n`,
    );
    process.exit(0);
}

main();
