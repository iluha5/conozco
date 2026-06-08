import { execSync } from 'child_process';

/**
 * Global teardown for E2E tests
 * Optionally stops the test DB (can be left running for faster reruns)
 */
async function globalTeardown() {
    console.log('🧹 Starting E2E test environment teardown...');

    const composeFile = 'docker-compose.test.yml';

    try {
        // Check whether to stop the container
        // By default leave it running for faster subsequent test runs
        // Set CLEANUP_TEST_DB=true to stop it
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
        // Do not throw — avoid blocking test runner shutdown
    }
}

export default globalTeardown;
