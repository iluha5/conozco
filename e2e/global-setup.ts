import { execSync } from 'child_process';

/**
 * Global setup для E2E тестов
 * Запускает тестовую БД в Docker и выполняет миграции
 */
async function globalSetup() {
    console.log('🚀 Starting E2E test environment setup...');

    const composeFile = 'docker-compose.test.yml';
    const containerName = 'flashcards-db-test';

    try {
        // Проверяем, запущен ли уже контейнер
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
            // Контейнер не существует, создаем новый
            console.log('📦 Creating new test database container...');
            execSync(`docker compose -f ${composeFile} up -d`, {
                stdio: 'inherit',
            });
        }

        // Ждем, пока БД станет доступной
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

        // Выполняем миграции
        console.log('🔄 Running database migrations...');
        const testDatabaseUrl =
            'postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test';

        execSync(
            `DATABASE_URL="${testDatabaseUrl}" npx prisma migrate deploy`,
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    DATABASE_URL: testDatabaseUrl,
                },
            },
        );

        console.log('✅ Database migrations completed');

        // Синхронизируем схему с БД (на случай если миграции не полностью применились)
        console.log('🔄 Syncing database schema...');
        execSync(
            `DATABASE_URL="${testDatabaseUrl}" npx prisma db push --accept-data-loss --skip-generate`,
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    DATABASE_URL: testDatabaseUrl,
                },
            },
        );

        // Генерируем Prisma Client для тестовой БД
        console.log('🔧 Generating Prisma Client...');
        execSync(`DATABASE_URL="${testDatabaseUrl}" npx prisma generate`, {
            stdio: 'inherit',
            env: {
                ...process.env,
                DATABASE_URL: testDatabaseUrl,
            },
        });

        // Заполняем справочные данные (роли, статусы, языки)
        console.log('🌱 Seeding reference data...');
        execSync(
            `DATABASE_URL="${testDatabaseUrl}" npx tsx e2e/seed-reference-data.ts`,
            {
                stdio: 'inherit',
                env: {
                    ...process.env,
                    DATABASE_URL: testDatabaseUrl,
                },
            },
        );

        console.log('✅ E2E test environment setup completed!');
    } catch (error) {
        console.error('❌ Error during global setup:', error);
        throw error;
    }
}

export default globalSetup;
