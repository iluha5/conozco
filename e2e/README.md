# E2E Tests with Playwright

## Installation

1. Install dependencies:

```bash
npm install
```

2. Install Chromium browser only:

```bash
npx playwright install chromium
```

**Important:** Only Chromium is installed, Firefox and WebKit are not used.

3. Ensure Docker is running (for test database):

```bash
docker --version
```

## Test Database

E2E tests use an isolated test database that automatically launches before tests.

### Automatic Launch

Test database automatically launches via `global-setup.ts` when running tests. No need to launch it manually.

### Manual Control (optional)

```bash
# Launch test database
docker compose -f docker-compose.test.yml up -d

# Stop test database
docker compose -f docker-compose.test.yml down

# View logs
docker compose -f docker-compose.test.yml logs -f

# Clear test database data (remove volume)
docker compose -f docker-compose.test.yml down -v
```

**Test database parameters:**

- Port: `5434` (doesn't conflict with main DB on port 5433)
- User: `flashcards_test`
- Password: `flashcards_test_password`
- Database: `flashcards_test`

## Running Tests

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Show HTML report
npm run test:e2e:report
```

### Environment Variables

**Application Base URL:**
By default, tests use `http://localhost:8001` as base URL (separate port for isolation from main application on 8000). You can change this via environment variable:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

**Important:** Application for tests automatically launches on port 8001 with test database connection. This isolates tests from main application on port 8000.

**Test Database:**
By default uses `postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test`. Can be overridden:

```bash
TEST_DATABASE_URL="postgresql://..." npm run test:e2e
```

**Database cleanup after tests:**
By default, test database stays running to speed up subsequent tests. To stop it after tests:

```bash
CLEANUP_TEST_DB=true npm run test:e2e
```

## Test Structure

```
e2e/
├── fixtures/              # Test fixtures and utilities
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database utilities
│   ├── test-data.ts      # Test data generators
│   └── api-helpers.ts    # API helpers
├── page-objects/          # Page Object Model
│   ├── BasePage.ts        # Base class
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── WordsPage.ts
│   ├── TrainingSetupPage.ts
│   ├── TrainingPage.ts
│   ├── SettingsPage.ts
│   ├── Header.ts          # Header component
│   └── index.ts           # Export all Page Objects
└── tests/                 # Tests
    ├── auth/
    ├── words/
    ├── training/
    └── settings/
```

## Writing Tests

### Using Page Object Model

All Page Objects are located in `e2e/page-objects/` and inherit from `BasePage`.

**Available Page Objects:**

- `BasePage` - base class with common methods
- `LoginPage` - login page
- `RegisterPage` - registration page
- `HomePage` - home page
- `WordsPage` - word management page
- `TrainingSetupPage` - training setup page
- `TrainingPage` - training page
- `SettingsPage` - settings page
- `HeaderPage` - Header component (used on all pages)

### Using Fixtures

All fixtures are exported from `e2e/fixtures/index.ts` for convenient import.

**Available fixtures:**

- **Database utilities** (`db.ts`):
    - `createTestPrismaClient()` - create Prisma Client for test DB
    - `cleanupTestDatabase()` - clean test database
    - `withTransaction()` - execute operations in transaction

- **Test data generators** (`test-data.ts`):
    - `createTestUser()` - create test user in DB
    - `createTestWord()` - create test word
    - `createTestWords()` - create multiple words
    - `createTestWordGroup()` - create word group
    - `createTestBaseWord()` - create base word with translation
    - `getRoleId()`, `getWordStatusId()`, `getLanguageId()` - get reference data IDs

- **Authentication helpers** (`auth.ts`):
    - `createAndLoginUser()` - create user in DB and login via UI
    - `registerAndLoginUser()` - register via API and login via UI
    - `loginViaUI()` - login via UI
    - `logoutViaUI()` - logout via UI

- **API helpers** (`api-helpers.ts`):
    - `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()` - basic HTTP methods
    - `getWordsViaAPI()`, `createWordViaAPI()`, `updateWordViaAPI()`, `deleteWordViaAPI()` - work with words
    - `getWordGroupsViaAPI()`, `createWordGroupViaAPI()` - work with word groups

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, HomePage } from '../page-objects';
import { createAndLoginUser, cleanupTestDatabase } from '../fixtures';

test.beforeEach(async () => {
    // Clean DB before each test (optional)
    await cleanupTestDatabase();
});

test('successful login', async ({ page }) => {
    // Create user and login via UI (convenient function)
    const user = await createAndLoginUser(page, {
        email: 'test@example.com',
        password: 'password123',
    });

    // Check successful login
    const homePage = new HomePage(page);
    await homePage.expectPageLoaded();

    // Use user.id for further operations
    expect(user.id).toBeGreaterThan(0);
});
```

### Test Example Using API Helpers

```typescript
import { test, expect } from '@playwright/test';
import { WordsPage } from '../page-objects';
import { createAndLoginUser } from '../fixtures';
import { createWordViaAPI, getWordsViaAPI } from '../fixtures';

test('create word via API and check in UI', async ({ page, request }) => {
    // Create user and authorize
    const user = await createAndLoginUser(page);

    // Create word via API
    const word = await createWordViaAPI(request, {
        customWord: 'hello',
        languageId: 1, // English
        statusId: 1, // NOT_LEARNED
    });

    // Check via API
    const words = await getWordsViaAPI(request, user.id);
    expect(words.length).toBeGreaterThan(0);

    // Check in UI
    const wordsPage = new WordsPage(page);
    await wordsPage.goto();
    await wordsPage.expectWordVisible('hello');
});
```

### Test Example with Multiple Pages

```typescript
import { test } from '@playwright/test';
import { LoginPage, WordsPage, HeaderPage } from '../page-objects';
import { createTestUser, createTestWord } from '../fixtures';

test('navigate to words after login', async ({ page }) => {
    // Create user and word
    const user = await createTestUser();
    await createTestWord(user.id, { customWord: 'hello' });

    // Login via UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, 'testpassword123');

    // Use Header for navigation
    const header = new HeaderPage(page);
    await header.expectHeaderVisible();
    await header.goToWords();

    // Work with words page
    const wordsPage = new WordsPage(page);
    await wordsPage.expectPageLoaded();
    await wordsPage.expectWordInList('hello');
});
```

### Working with Test Database

```typescript
import {
    createTestPrismaClient,
    cleanupTestDatabase,
    createTestUser,
    createTestWord,
} from '../fixtures';

test('database work example', async ({ page }) => {
    // Create user
    const user = await createTestUser();

    // Create word for user
    const word = await createTestWord(user.id, {
        customWord: 'hello',
        languageId: 1, // English
    });

    // Work with Prisma directly
    const prisma = createTestPrismaClient();
    const words = await prisma.word.findMany({
        where: { userId: user.id },
    });
    await prisma.$disconnect();
});
```

## Configuration

Configuration is located in `playwright.config.ts` in project root.

Main settings:

- Browser: Chromium only
- Timeout: 30s for tests, 5s for assertions
- Retry: 2 attempts in CI, 0 locally
- Workers: 4 parallel workers
- Screenshots and video: only on test failures
