import { execSync } from 'child_process';

/**
 * Global teardown для E2E тестов
 * Останавливает тестовую БД (опционально - можно оставить запущенной для ускорения)
 */
async function globalTeardown() {
    console.log('🧹 Starting E2E test environment teardown...');

    const composeFile = 'docker-compose.test.yml';

    try {
        // Проверяем, нужно ли останавливать контейнер
        // По умолчанию оставляем запущенным для ускорения последующих тестов
        // Можно остановить через переменную окружения CLEANUP_TEST_DB=true
        const shouldCleanup = process.env.CLEANUP_TEST_DB === 'true';

        if (shouldCleanup) {
            console.log('🛑 Stopping test database container...');
            execSync(`docker compose -f ${composeFile} down`, {
                stdio: 'inherit',
            });
            console.log('✅ Test database container stopped');
        } else {
            console.log(
                'ℹ️  Test database container left running (set CLEANUP_TEST_DB=true to stop it)',
            );
        }

        console.log('✅ E2E test environment teardown completed!');
    } catch (error) {
        console.error('❌ Error during global teardown:', error);
        // Не бросаем ошибку, чтобы не блокировать завершение тестов
    }
}

export default globalTeardown;
