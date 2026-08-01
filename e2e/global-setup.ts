import { execSync } from 'child_process';
import { TEST_DATABASE_URL } from './test-env';

function runPrismaCommand(
    command: string,
    databaseUrl: string = TEST_DATABASE_URL,
): void {
    execSync(command, {
        stdio: 'inherit',
        env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
        },
    });
}

function runMigrations(databaseUrl: string): void {
    try {
        console.log('🔄 Running database migrations...');
        runPrismaCommand('npx prisma migrate deploy', databaseUrl);
        console.log('✅ Database migrations completed');
    } catch (error) {
        console.log('⚠️  Migration deploy failed — resetting test database...');
        runPrismaCommand(
            'npx prisma migrate reset --force --skip-seed',
            databaseUrl,
        );
        console.log('✅ Test database reset and migrations applied');
    }
}

/**
 * Global setup for E2E tests
 * Starts the test DB in Docker and runs migrations
 */
async function globalSetup() {
    console.log('🚀 Starting E2E test environment setup...');

    const composeFile = 'docker-compose.test.yml';
    const containerName = 'flashcards-db-test';

    try {
        // Check if container is already running
        try {
            const status = execSync(
                `docker ps -a --filter "name=${containerName}" --format "{{.Status}}"`,
                { encoding: 'utf-8', stdio: 'pipe' },
            );

            if (status.includes('Up')) {
                console.log('✅ Test database container is already running');
            } else if (status.trim()) {
                console.log('🔄 Starting existing test database container...');
                execSync(`docker start ${containerName}`, { stdio: 'inherit' });
            } else {
                console.log(
                    '📦 Creating and starting test database container...',
                );
                execSync(`docker compose -f ${composeFile} up -d`, {
                    stdio: 'inherit',
                });
            }
        } catch (error) {
            // Container does not exist — create a new one
            console.log('📦 Creating new test database container...');
            execSync(`docker compose -f ${composeFile} up -d`, {
                stdio: 'inherit',
            });
        }

        // Wait until the database is ready
        console.log('⏳ Waiting for database to be ready...');
        const maxAttempts = 30;
        let attempts = 0;

        while (attempts < maxAttempts) {
            try {
                execSync(
                    `docker exec ${containerName} pg_isready -U flashcards_test`,
                    { stdio: 'pipe' },
                );
                console.log('✅ Database is ready!');
                break;
            } catch (error) {
                attempts++;
                if (attempts >= maxAttempts) {
                    throw new Error('Database did not become ready in time');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        runMigrations(TEST_DATABASE_URL);

        // Generate Prisma Client for the test database
        console.log('🔧 Generating Prisma Client...');
        runPrismaCommand('npx prisma generate');

        // Seed reference data (roles, statuses, languages)
        console.log('🌱 Seeding reference data...');
        runPrismaCommand('npx tsx e2e/seed-reference-data.ts');

        console.log('✅ E2E test environment setup completed!');
    } catch (error) {
        console.error('❌ Error during global setup:', error);
        throw error;
    }
}

export default globalSetup;
