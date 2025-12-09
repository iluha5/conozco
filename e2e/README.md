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
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── WordsPage.ts
│   ├── TrainingSetupPage.ts
│   ├── TrainingPage.ts
│   └── SettingsPage.ts
└── tests/                 # Тесты
    ├── auth/
    ├── words/
    ├── training/
    └── settings/
```

## Написание тестов

### Пример базового теста

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { createTestUser, cleanupTestDatabase } from '../fixtures/test-data';

test.beforeEach(async () => {
    // Очистка БД перед каждым тестом (опционально)
    await cleanupTestDatabase();
});

test('успешный вход', async ({ page }) => {
    // Создание тестового пользователя
    const user = await createTestUser('test@example.com', 'password123');

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(user.email, 'password123');
    await expect(page).toHaveURL('/');
});
```

### Работа с тестовой БД

```typescript
import { createTestPrismaClient, cleanupTestDatabase } from '../fixtures/db';
import { createTestUser, createTestWord } from '../fixtures/test-data';

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
