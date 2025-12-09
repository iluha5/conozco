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

По умолчанию тесты используют `http://localhost:8000` как базовый URL. Вы можете изменить это через переменную окружения:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
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

test('успешный вход', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL('/');
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
