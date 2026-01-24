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
    console.log(`📁 Looking for migrations in: ${migrationsDir}`);
    try {
        const entries = await fs.readdir(migrationsDir, {
            withFileTypes: true,
        });
        const directories = entries
            .filter(entry => entry.isDirectory())
            .map(entry => path.join(migrationsDir, entry.name))
            .sort(); // Sort alphabetically (timestamp ensures chronological order)
        console.log(`   Found ${directories.length} migration directory(ies)`);
        return directories;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.log(`   Migration directory does not exist, skipping`);
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
        const metadata = JSON.parse(content);
        console.log(
            `   ✓ Metadata loaded: ${metadata.description || metadata.name}`,
        );
        return metadata;
    } catch (error) {
        // If metadata.json doesn't exist, try to infer from directory name
        const dirName = path.basename(migrationDir);
        const match = dirName.match(/^(\d+)_(.+)$/);
        if (match) {
            console.log(
                `   ⚠️  No metadata.json found, inferring from directory name`,
            );
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
        console.log(`   ✗ Could not infer metadata from directory name`);
        return null;
    }
}

/**
 * Check if migration is already applied
 */
async function isMigrationApplied(migrationName: string): Promise<boolean> {
    try {
        const migration = await prisma.dataMigration.findUnique({
            where: { name: migrationName },
        });
        const isApplied = migration !== null && migration.status === 'SUCCESS';
        if (migration) {
            console.log(
                `   Status: ${migration.status} (applied at: ${migration.appliedAt.toISOString()})`,
            );
        }
        return isApplied;
    } catch (error) {
        console.error(`   ⚠️  Error checking migration status: ${error}`);
        throw error;
    }
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
    console.log(`   Description: ${metadata.description || 'N/A'}`);
    console.log(`   Language: ${metadata.language || 'N/A'}`);
    console.log(`   Words count: ${metadata.wordsCount || 0}`);
    console.log(`   Timestamp: ${metadata.timestamp || 'N/A'}`);

    // Read migration SQL
    console.log(`   Reading SQL file: ${migrationSQLPath}`);
    const migrationSQL = await fs.readFile(migrationSQLPath, 'utf8');
    const sqlSize = migrationSQL.length;
    const sqlLines = migrationSQL.split('\n').length;
    console.log(`   SQL file size: ${sqlSize} bytes, ${sqlLines} lines`);

    // Verify checksum
    console.log(`   Calculating checksum...`);
    const calculatedChecksum = calculateChecksum(migrationSQL);
    console.log(`   Calculated checksum: ${calculatedChecksum}`);
    if (metadata.checksum) {
        console.log(`   Expected checksum: ${metadata.checksum}`);
        if (metadata.checksum !== calculatedChecksum) {
            throw new Error(
                `Checksum mismatch for migration ${migrationName}. Expected: ${metadata.checksum}, Got: ${calculatedChecksum}`,
            );
        }
        console.log(`   ✓ Checksum verified`);
    } else {
        console.log(`   ⚠️  No checksum in metadata, skipping verification`);
    }

    const startTime = Date.now();

    try {
        // Execute migration SQL using psql directly
        // This is more reliable for complex transactions with multiple statements
        console.log(`   Checking database connection...`);
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
        const password = dbUrl.password ? '***' : 'not set';

        console.log(`   Database connection details:`);
        console.log(`     Host: ${host}`);
        console.log(`     Port: ${port}`);
        console.log(`     Database: ${database}`);
        console.log(`     Username: ${username}`);
        console.log(`     Password: ${password}`);

        // Use psql to execute the migration SQL
        // Check if we can use docker exec (only when running on host, not inside container)
        // Inside container, we can connect directly via docker network
        const isInsideContainer = existsSync('/.dockerenv');
        console.log(`   Running inside container: ${isInsideContainer}`);
        const canUseDockerExec =
            !isInsideContainer &&
            (process.env.DOCKER_CONTAINER === 'true' ||
                host === 'postgres' ||
                host === 'flashcards-db' ||
                (host === 'localhost' &&
                    process.env.DATABASE_URL?.includes('flashcards-db')));

        console.log(
            `   Execution method: ${canUseDockerExec ? 'docker exec' : 'direct psql'}`,
        );

        // Use /tmp for temporary files (always writable)
        const tempSqlFile = `/tmp/migration_${migrationName}_${Date.now()}.sql`;
        console.log(`   Temporary SQL file: ${tempSqlFile}`);

        if (canUseDockerExec) {
            // On host, use docker exec to run psql inside container
            // Write SQL to temporary file first
            console.log(`   Writing SQL to temporary file...`);
            await fs.writeFile(tempSqlFile, migrationSQL, 'utf8');

            const containerTempFile = `/tmp/migration_${migrationName}_${Date.now()}.sql`;
            console.log(`   Container temp file: ${containerTempFile}`);

            try {
                // Copy file to container
                console.log(`   Copying SQL file to container...`);
                execSync(
                    `docker cp ${tempSqlFile} flashcards-db:${containerTempFile}`,
                    {
                        stdio: 'inherit',
                    },
                );
                console.log(`   ✓ File copied to container`);

                // Execute SQL in container
                console.log(`   Executing SQL migration in container...`);
                execSync(
                    `docker exec flashcards-db psql -U ${username} -d ${database} -f ${containerTempFile}`,
                    {
                        stdio: 'inherit',
                        env: { ...process.env, PGPASSWORD: password },
                    },
                );
                console.log(`   ✓ SQL executed successfully`);

                // Clean up container temp file
                console.log(`   Cleaning up container temp file...`);
                execSync(
                    `docker exec flashcards-db rm -f ${containerTempFile}`,
                    {
                        stdio: 'pipe',
                    },
                );
            } finally {
                // Clean up host temp file
                console.log(`   Cleaning up host temp file...`);
                try {
                    await fs.unlink(tempSqlFile);
                } catch (e) {
                    console.log(`   ⚠️  Could not remove temp file: ${e}`);
                }
            }
        } else {
            // Direct psql connection (for containers or local development)
            // Write SQL to temporary file first
            console.log(`   Writing SQL to temporary file...`);
            await fs.writeFile(tempSqlFile, migrationSQL, 'utf8');

            try {
                const psqlCommand = `psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${tempSqlFile}`;
                console.log(`   Executing psql command...`);
                console.log(
                    `   Command: psql -h ${host} -p ${port} -U ${username} -d ${database} -f ${tempSqlFile}`,
                );
                execSync(psqlCommand, {
                    stdio: 'inherit',
                    env: { ...process.env, PGPASSWORD: password },
                });
                console.log(`   ✓ SQL executed successfully`);
            } finally {
                // Clean up temp file
                console.log(`   Cleaning up temp file...`);
                try {
                    await fs.unlink(tempSqlFile);
                } catch (e) {
                    console.log(`   ⚠️  Could not remove temp file: ${e}`);
                }
            }
        }

        const durationMs = Date.now() - startTime;
        const durationSeconds = (durationMs / 1000).toFixed(2);

        // Record migration in DataMigration table
        console.log(`   Recording migration in database...`);
        await prisma.dataMigration.upsert({
            where: { name: migrationName },
            update: {
                appliedBy: appliedBy || process.env.USER || 'unknown',
                gitSha: gitSha || process.env.GIT_SHA || null,
                checksum: calculatedChecksum,
                durationMs,
                status: 'SUCCESS',
            },
            create: {
                name: migrationName,
                appliedBy: appliedBy || process.env.USER || 'unknown',
                gitSha: gitSha || process.env.GIT_SHA || null,
                checksum: calculatedChecksum,
                durationMs,
                status: 'SUCCESS',
            },
        });
        console.log(`   ✓ Migration recorded in database`);

        console.log(`✅ Successfully applied migration: ${migrationName}`);
        console.log(`   Duration: ${durationMs}ms (${durationSeconds}s)`);
        console.log(`   Checksum: ${calculatedChecksum}`);
    } catch (error) {
        const durationMs = Date.now() - startTime;
        const durationSeconds = (durationMs / 1000).toFixed(2);
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        console.error(`\n❌ Error applying migration ${migrationName}:`);
        console.error(`   Error: ${errorMessage}`);
        if (errorStack) {
            console.error(`   Stack trace:`);
            errorStack.split('\n').forEach(line => {
                console.error(`     ${line}`);
            });
        }
        console.error(
            `   Duration before failure: ${durationMs}ms (${durationSeconds}s)`,
        );

        // Record failed migration
        console.log(`   Recording failed migration in database...`);
        try {
            await prisma.dataMigration.upsert({
                where: { name: migrationName },
                update: {
                    appliedBy: appliedBy || process.env.USER || 'unknown',
                    gitSha: gitSha || process.env.GIT_SHA || null,
                    checksum: calculatedChecksum,
                    durationMs,
                    status: 'FAILED',
                },
                create: {
                    name: migrationName,
                    appliedBy: appliedBy || process.env.USER || 'unknown',
                    gitSha: gitSha || process.env.GIT_SHA || null,
                    checksum: calculatedChecksum,
                    durationMs,
                    status: 'FAILED',
                },
            });
            console.log(`   ✓ Failed migration recorded in database`);
        } catch (recordError) {
            console.error(
                `   ✗ Failed to record failed migration: ${recordError}`,
            );
            if (recordError instanceof Error && recordError.stack) {
                console.error(`   Stack trace:`);
                recordError.stack.split('\n').forEach(line => {
                    console.error(`     ${line}`);
                });
            }
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
    console.log(`   Node version: ${process.version}`);
    console.log(`   Working directory: ${process.cwd()}`);
    console.log(`   Script location: ${__dirname}`);

    // Test database connection
    console.log(`\n🔌 Testing database connection...`);
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log(`   ✓ Database connection successful`);
    } catch (error) {
        console.error(`   ✗ Database connection failed: ${error}`);
        throw new Error(`Cannot connect to database: ${error}`);
    }

    try {
        // Get all migration directories
        console.log(`\n📂 Scanning for migration directories...`);
        const migrationDirs = await getMigrationDirectories();

        if (migrationDirs.length === 0) {
            console.log('📭 No data migrations found');
            return;
        }

        console.log(`\n📋 Found ${migrationDirs.length} migration(s)`);
        if (migrationDirs.length > 0) {
            console.log(`   Migration directories:`);
            migrationDirs.forEach((dir, index) => {
                console.log(`     ${index + 1}. ${getMigrationName(dir)}`);
            });
        }

        // Filter out already applied migrations
        console.log(`\n🔍 Checking migration status...`);
        const pendingMigrations: Array<{
            dir: string;
            metadata: MigrationMetadata;
        }> = [];

        for (const migrationDir of migrationDirs) {
            const migrationName = getMigrationName(migrationDir);
            console.log(`\n   Checking: ${migrationName}`);
            const metadata = await readMigrationMetadata(migrationDir);

            if (!metadata) {
                console.warn(
                    `   ⚠️  Skipping ${migrationName}: no metadata found`,
                );
                continue;
            }

            const isApplied = await isMigrationApplied(migrationName);

            if (isApplied) {
                console.log(
                    `   ⏭️  Skipping ${migrationName}: already applied`,
                );
            } else {
                console.log(`   ➡️  Will apply: ${migrationName}`);
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

        for (let i = 0; i < pendingMigrations.length; i++) {
            const { dir, metadata } = pendingMigrations[i];
            const migrationName = getMigrationName(dir);
            console.log(
                `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            );
            console.log(
                `Migration ${i + 1}/${pendingMigrations.length}: ${migrationName}`,
            );
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            try {
                await applyMigration(dir, metadata, gitSha, appliedBy);
                appliedCount++;
                console.log(
                    `✓ Migration ${i + 1}/${pendingMigrations.length} completed successfully`,
                );
            } catch (error) {
                failedCount++;
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                console.error(
                    `\n✗ Migration ${i + 1}/${pendingMigrations.length} failed`,
                );
                console.error(`   Migration: ${migrationName}`);
                console.error(`   Error: ${errorMessage}`);
                console.error(`\n🛑 Stopping migration process after failure`);
                break; // Stop on first failure
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Migration Summary:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Total found: ${migrationDirs.length}`);
        console.log(`   Applied: ${appliedCount}`);
        console.log(`   Failed: ${failedCount}`);
        console.log(
            `   Skipped: ${migrationDirs.length - appliedCount - failedCount}`,
        );
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (failedCount > 0) {
            console.error(
                `❌ Migration process completed with ${failedCount} failure(s)`,
            );
            process.exit(1);
        } else {
            console.log(`✅ All migrations completed successfully!`);
        }
    } catch (error) {
        console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ Fatal error applying data migrations:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error(`   Error: ${errorMessage}`);
        if (errorStack) {
            console.error(`   Stack trace:`);
            errorStack.split('\n').forEach(line => {
                console.error(`     ${line}`);
            });
        }
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        process.exit(1);
    }
}

main()
    .catch(error => {
        console.error('\n❌ Unhandled fatal error:', error);
        if (error instanceof Error && error.stack) {
            console.error('Stack trace:');
            error.stack.split('\n').forEach(line => {
                console.error(`  ${line}`);
            });
        }
        process.exit(1);
    })
    .finally(async () => {
        console.log('\n🔌 Disconnecting from database...');
        try {
            await prisma.$disconnect();
            console.log('✓ Database disconnected');
        } catch (error) {
            console.error(`⚠️  Error disconnecting from database: ${error}`);
        }
    });
