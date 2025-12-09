# E2E тесты с Playwright

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Установите только Chromium браузер:

```bash
npx playwright install chromium
```

**Важно:** Устанавливается только Chromium, Firefox и WebKit не используются.

3. Убедитесь, что Docker запущен (для тестовой БД):

```bash
docker --version
```

## Тестовая база данных

E2E тесты используют изолированную тестовую БД, которая автоматически запускается перед тестами.

### Автоматический запуск

Тестовая БД автоматически запускается через `global-setup.ts` при запуске тестов. Не нужно запускать её вручную.

### Ручное управление (опционально)

```bash
# Запустить тестовую БД
docker compose -f docker-compose.test.yml up -d

# Остановить тестовую БД
docker compose -f docker-compose.test.yml down

# Просмотреть логи
docker compose -f docker-compose.test.yml logs -f

# Очистить данные тестовой БД (удалить volume)
docker compose -f docker-compose.test.yml down -v
```

**Параметры тестовой БД:**

- Порт: `5434` (не конфликтует с основной БД на порту 5433)
- Пользователь: `flashcards_test`
- Пароль: `flashcards_test_password`
- База данных: `flashcards_test`

## Запуск тестов

### Локальная разработка

```bash
# Запустить все тесты
npm run test:e2e

# Запустить тесты с UI режимом (интерактивный)
npm run test:e2e:ui

# Запустить тесты в headed режиме (с видимым браузером)
npm run test:e2e:headed

# Запустить тесты в debug режиме
npm run test:e2e:debug

# Показать HTML отчет
npm run test:e2e:report
```

### Переменные окружения

**Базовый URL приложения:**
По умолчанию тесты используют `http://localhost:8001` как базовый URL (отдельный порт для изоляции от основного приложения на 8000). Вы можете изменить это через переменную окружения:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

**Важно:** Приложение для тестов автоматически запускается на порту 8001 с подключением к тестовой БД. Это изолирует тесты от основного приложения на порту 8000.

**Тестовая БД:**
По умолчанию используется `postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test`. Можно переопределить:

```bash
TEST_DATABASE_URL="postgresql://..." npm run test:e2e
```

**Очистка БД после тестов:**
По умолчанию тестовая БД остается запущенной для ускорения последующих тестов. Чтобы остановить её после тестов:

```bash
CLEANUP_TEST_DB=true npm run test:e2e
```

## Структура тестов

```
e2e/
├── fixtures/              # Тестовые фикстуры и утилиты
│   ├── auth.ts           # Хелперы для авторизации
│   ├── db.ts             # Утилиты для работы с БД
│   ├── test-data.ts      # Генераторы тестовых данных
│   └── api-helpers.ts    # Хелперы для API запросов
├── page-objects/          # Page Object Model
│   ├── BasePage.ts        # Базовый класс
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── WordsPage.ts
│   ├── TrainingSetupPage.ts
│   ├── TrainingPage.ts
│   ├── SettingsPage.ts
│   ├── Header.ts          # Компонент Header
│   └── index.ts           # Экспорт всех Page Objects
└── tests/                 # Тесты
    ├── auth/
    ├── words/
    ├── training/
    └── settings/
```

## Написание тестов

### Использование Page Object Model

Все Page Objects находятся в `e2e/page-objects/` и наследуются от `BasePage`.

**Доступные Page Objects:**

- `BasePage` - базовый класс с общими методами
- `LoginPage` - страница входа
- `RegisterPage` - страница регистрации
- `HomePage` - главная страница
- `WordsPage` - страница управления словами
- `TrainingSetupPage` - страница настройки тренировки
- `TrainingPage` - страница тренировки
- `SettingsPage` - страница настроек
- `HeaderPage` - компонент Header (используется на всех страницах)

### Использование фикстур

Все фикстуры экспортируются из `e2e/fixtures/index.ts` для удобного импорта.

**Доступные фикстуры:**

- **Database utilities** (`db.ts`):
    - `createTestPrismaClient()` - создание Prisma Client для тестовой БД
    - `cleanupTestDatabase()` - очистка тестовой БД
    - `withTransaction()` - выполнение операций в транзакции

- **Test data generators** (`test-data.ts`):
    - `createTestUser()` - создание тестового пользователя в БД
    - `createTestWord()` - создание тестового слова
    - `createTestWords()` - создание нескольких слов
    - `createTestWordGroup()` - создание группы слов
    - `createTestBaseWord()` - создание базового слова с переводом
    - `getRoleId()`, `getWordStatusId()`, `getLanguageId()` - получение ID справочных данных

- **Authentication helpers** (`auth.ts`):
    - `createAndLoginUser()` - создание пользователя в БД и авторизация через UI
    - `registerAndLoginUser()` - регистрация через API и авторизация через UI
    - `loginViaUI()` - авторизация через UI
    - `logoutViaUI()` - выход из системы через UI

- **API helpers** (`api-helpers.ts`):
    - `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()` - базовые HTTP методы
    - `getWordsViaAPI()`, `createWordViaAPI()`, `updateWordViaAPI()`, `deleteWordViaAPI()` - работа со словами
    - `getWordGroupsViaAPI()`, `createWordGroupViaAPI()` - работа с группами слов

### Пример базового теста

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, HomePage } from '../page-objects';
import { createAndLoginUser, cleanupTestDatabase } from '../fixtures';

test.beforeEach(async () => {
    // Очистка БД перед каждым тестом (опционально)
    await cleanupTestDatabase();
});

test('успешный вход', async ({ page }) => {
    // Создание пользователя и авторизация через UI (удобная функция)
    const user = await createAndLoginUser(page, {
        email: 'test@example.com',
        password: 'password123',
    });

    // Проверка успешного входа
    const homePage = new HomePage(page);
    await homePage.expectPageLoaded();

    // Используем user.id для дальнейших операций
    expect(user.id).toBeGreaterThan(0);
});
```

### Пример теста с использованием API helpers

```typescript
import { test, expect } from '@playwright/test';
import { WordsPage } from '../page-objects';
import { createAndLoginUser } from '../fixtures';
import { createWordViaAPI, getWordsViaAPI } from '../fixtures';

test('создание слова через API и проверка в UI', async ({ page, request }) => {
    // Создаем пользователя и авторизуем
    const user = await createAndLoginUser(page);

    // Создаем слово через API
    const word = await createWordViaAPI(request, {
        customWord: 'hello',
        languageId: 1, // English
        statusId: 1, // NOT_LEARNED
    });

    // Проверяем через API
    const words = await getWordsViaAPI(request, user.id);
    expect(words.length).toBeGreaterThan(0);

    // Проверяем в UI
    const wordsPage = new WordsPage(page);
    await wordsPage.goto();
    await wordsPage.expectWordVisible('hello');
});
```

### Пример теста с несколькими страницами

```typescript
import { test } from '@playwright/test';
import { LoginPage, WordsPage, HeaderPage } from '../page-objects';
import { createTestUser, createTestWord } from '../fixtures';

test('переход к словам после входа', async ({ page }) => {
    // Создание пользователя и слова
    const user = await createTestUser();
    await createTestWord(user.id, { customWord: 'hello' });

    // Вход в систему через UI
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, 'testpassword123');

    // Использование Header для навигации
    const header = new HeaderPage(page);
    await header.expectHeaderVisible();
    await header.goToWords();

    // Работа со страницей слов
    const wordsPage = new WordsPage(page);
    await wordsPage.expectPageLoaded();
    await wordsPage.expectWordInList('hello');
});
```

### Работа с тестовой БД

```typescript
import {
    createTestPrismaClient,
    cleanupTestDatabase,
    createTestUser,
    createTestWord,
} from '../fixtures';

test('пример работы с БД', async ({ page }) => {
    // Создание пользователя
    const user = await createTestUser();

    // Создание слова для пользователя
    const word = await createTestWord(user.id, {
        customWord: 'hello',
        languageId: 1, // English
    });

    // Работа с Prisma напрямую
    const prisma = createTestPrismaClient();
    const words = await prisma.word.findMany({
        where: { userId: user.id },
    });
    await prisma.$disconnect();
});
```

## Конфигурация

Конфигурация находится в `playwright.config.ts` в корне проекта.

Основные настройки:

- Браузер: только Chromium
- Timeout: 30s для тестов, 5s для assertions
- Retry: 2 попытки в CI, 0 локально
- Workers: 4 параллельных воркера
- Скриншоты и видео: только при падении тестов
