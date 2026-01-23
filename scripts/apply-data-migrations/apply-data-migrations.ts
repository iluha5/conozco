#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { calculateChecksum } from '../generate-word-migration.js';
import { URL } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface MigrationMetadata {
    name: string;
    description: string;
    timestamp: string;
    wordsCount: number;
    language: string;
    checksum: string;
    generatedAt: string;
}

/**
 * Get all data migration directories
 */
async function getMigrationDirectories(): Promise<string[]> {
    const migrationsDir = path.join(
        __dirname,
        '..',
        '..',
        'prisma',
        'data-migrations',
    );
    try {
        const entries = await fs.readdir(migrationsDir, {
            withFileTypes: true,
        });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => path.join(migrationsDir, entry.name))
            .sort(); // Sort alphabetically (timestamp ensures chronological order)
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Read migration metadata
 */
async function readMigrationMetadata(
    migrationDir: string,
): Promise<MigrationMetadata | null> {
    const metadataPath = path.join(migrationDir, 'metadata.json');
    try {
        const content = await fs.readFile(metadataPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        // If metadata.json doesn't exist, try to infer from directory name
        const dirName = path.basename(migrationDir);
        const match = dirName.match(/^(\d+)_(.+)$/);
        if (match) {
            return {
                name: match[2],
                description: `Data migration ${match[2]}`,
                timestamp: match[1],
                wordsCount: 0,
                language: 'en',
                checksum: '',
                generatedAt: new Date().toISOString(),
            };
        }
        return null;
    }
}

/**
 * Check if migration is already applied
 */
async function isMigrationApplied(migrationName: string): Promise<boolean> {
    const migration = await prisma.dataMigration.findUnique({
        where: { name: migrationName },
    });
    return migration !== null && migration.status === 'SUCCESS';
}

/**
 * Get migration name from directory path
 */
function getMigrationName(migrationDir: string): string {
    return path.basename(migrationDir);
}

/**
 * Apply a single migration
 */
async function applyMigration(
    migrationDir: string,
    metadata: MigrationMetadata,
    gitSha?: string,
    appliedBy?: string,
): Promise<void> {
    const migrationName = getMigrationName(migrationDir);
    const migrationSQLPath = path.join(migrationDir, 'migration.sql');

    console.log(`\n📦 Applying migration: ${migrationName}`);

    // Read migration SQL
    const migrationSQL = await fs.readFile(migrationSQLPath, 'utf8');

    // Verify checksum
    const calculatedChecksum = calculateChecksum(migrationSQL);
    if (metadata.checksum && metadata.checksum !== calculatedChecksum) {
        throw new Error(
            `Checksum mismatch for migration ${migrationName}. Expected: ${metadata.checksum}, Got: ${calculatedChecksum}`,
        );
    }

    const startTime = Date.now();

    try {
        // Execute migration SQL using psql directly
        // This is more reliable for complex transactions with multiple statements
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        // Parse DATABASE_URL to extract connection details
        const dbUrl = new URL(databaseUrl);
        const host = dbUrl.hostname;
        const port = dbUrl.port || '5432';
        const database = dbUrl.pathname.slice(1); // Remove leading /
        const username = dbUrl.username;
        const password = dbUrl.password;

        // Use psql to execute the migration SQL
        // Check if we're in Docker environment
        // In docker-compose, database host is usually the service name (e.g., 'postgres', 'flashcards-db')
        // or 'localhost' when connecting from host to container
        const isDocker =
            process.env.DOCKER_CONTAINER === 'true' ||
            existsSync('/.dockerenv') ||
            host === 'postgres' ||
            host === 'flashcards-db' ||
            (host === 'localhost' &&
                process.env.DATABASE_URL?.includes('flashcards-db'));

        if (isDocker) {
            // In Docker environment, use docker exec to run psql
            // Write SQL to temporary file inside container
            const containerTempFile = `/tmp/migration_${migrationName}_${Date.now()}.sql`;
            const hostTempFile = path.join(
                __dirname,
                'temp',
                `migration_${migrationName}_${Date.now()}.sql`,
            );
            await fs.mkdir(path.dirname(hostTempFile), { recursive: true });
            await fs.writeFile(hostTempFile, migrationSQL, 'utf8');

            try {
                // Copy file to container
                execSync(
                    `docker cp ${hostTempFile} flashcards-db:${containerTempFile}`,
                    {
                        stdio: 'inherit',
                    },
                );

                // Execute SQL in container
                execSync(
                    `docker exec flashcards-db psql -U ${username} -d ${database} -f ${containerTempFile}`,
                    {
                        stdio: 'inherit',
                        env: { ...process.env, PGPASSWORD: password },
                    },
                );

                // Clean up container temp file
                execSync(
                    `docker exec flashcards-db rm -f ${containerTempFile}`,
                    {
                        stdio: 'pipe',
                    },
                );
            } finally {
                // Clean up host temp file
                try {
                    await fs.unlink(hostTempFile);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        } else {
            // Direct psql connection (for local development)
            // Write SQL to temporary file first
            const tempSqlFile = path.join(
                __dirname,
                'temp',
                `migration_${migrationName}_${Date.now()}.sql`,
            );
            await fs.mkdir(path.dirname(tempSqlFile), { recursive: true });
            await fs.writeFile(tempSqlFile, migrationSQL, 'utf8');

            try {
                const psqlCommand = `psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${tempSqlFile}`;
                execSync(psqlCommand, {
                    stdio: 'inherit',
                    env: { ...process.env, PGPASSWORD: password },
                });
            } finally {
                // Clean up temp file
                try {
                    await fs.unlink(tempSqlFile);
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        }

        const durationMs = Date.now() - startTime;

        // Record migration in DataMigration table
        await prisma.dataMigration.create({
            data: {
                name: migrationName,
                appliedBy: appliedBy || process.env.USER || 'unknown',
                gitSha: gitSha || process.env.GIT_SHA || null,
                checksum: calculatedChecksum,
                durationMs,
                status: 'SUCCESS',
            },
        });

        console.log(`✅ Successfully applied migration: ${migrationName}`);
        console.log(`   Duration: ${durationMs}ms`);
        console.log(`   Checksum: ${calculatedChecksum}`);
    } catch (error) {
        const durationMs = Date.now() - startTime;

        // Record failed migration
        try {
            await prisma.dataMigration.create({
                data: {
                    name: migrationName,
                    appliedBy: appliedBy || process.env.USER || 'unknown',
                    gitSha: gitSha || process.env.GIT_SHA || null,
                    checksum: calculatedChecksum,
                    durationMs,
                    status: 'FAILED',
                },
            });
        } catch (recordError) {
            console.error(`Failed to record failed migration: ${recordError}`);
        }

        throw error;
    }
}

/**
 * Main function
 */
async function main() {
    const gitSha = process.env.GIT_SHA;
    const appliedBy = process.env.APPLIED_BY || process.env.USER || 'unknown';

    console.log('🚀 Starting data migrations application');
    console.log(`   Applied by: ${appliedBy}`);
    if (gitSha) {
        console.log(`   Git SHA: ${gitSha}`);
    }

    try {
        // Get all migration directories
        const migrationDirs = await getMigrationDirectories();

        if (migrationDirs.length === 0) {
            console.log('📭 No data migrations found');
            return;
        }

        console.log(`\n📋 Found ${migrationDirs.length} migration(s)`);

        // Filter out already applied migrations
        const pendingMigrations: Array<{
            dir: string;
            metadata: MigrationMetadata;
        }> = [];

        for (const migrationDir of migrationDirs) {
            const migrationName = getMigrationName(migrationDir);
            const metadata = await readMigrationMetadata(migrationDir);

            if (!metadata) {
                console.warn(
                    `⚠️  Skipping ${migrationName}: no metadata found`,
                );
                continue;
            }

            const isApplied = await isMigrationApplied(migrationName);

            if (isApplied) {
                console.log(`⏭️  Skipping ${migrationName}: already applied`);
            } else {
                pendingMigrations.push({ dir: migrationDir, metadata });
            }
        }

        if (pendingMigrations.length === 0) {
            console.log('\n✅ All migrations are already applied');
            return;
        }

        console.log(
            `\n📦 Applying ${pendingMigrations.length} pending migration(s)...`,
        );

        // Apply migrations sequentially
        let appliedCount = 0;
        let failedCount = 0;

        for (const { dir, metadata } of pendingMigrations) {
            try {
                await applyMigration(dir, metadata, gitSha, appliedBy);
                appliedCount++;
            } catch (error) {
                failedCount++;
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    `❌ Failed to apply migration ${getMigrationName(dir)}: ${errorMessage}`,
                );
                console.error('Stopping migration process');
                break; // Stop on first failure
            }
        }

        console.log('\n📊 Migration Summary:');
        console.log(`   Applied: ${appliedCount}`);
        console.log(`   Failed: ${failedCount}`);

        if (failedCount > 0) {
            process.exit(1);
        }
    } catch (error) {
        console.error(
            '❌ Error applying data migrations:',
            error instanceof Error ? error.message : error,
        );
        process.exit(1);
    }
}

main()
    .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
