# E2E Tests для Authentication

## Тестовое окружение

### e2e/fixtures/auth-helpers.ts

```typescript
import { Page } from '@playwright/test';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function createVerifiedUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const role = await prisma.userRole.findUnique({
    where: { code: 'USER' },
  });

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId: role!.id,
      emailVerified: new Date(),
      registrationMethod: 'EMAIL_PASSWORD',
      passwordChangedAt: new Date(),
    },
  });
}

export async function createUnverifiedUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const role = await prisma.userRole.findUnique({
    where: { code: 'USER' },
  });

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId: role!.id,
      emailVerified: null,
      registrationMethod: 'EMAIL_PASSWORD',
      passwordChangedAt: new Date(),
    },
  });
}

export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}
```

## 1. e2e/tests/auth/public-registration.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

test.describe('Public Registration', () => {
  test.beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: 'test-register@example.com' },
    });
  });

  test('should register successfully with valid data', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('input[type="email"]', 'test-register@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.fill('input[name="name"]', 'Test User');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Check your email')).toBeVisible();

    const user = await prisma.user.findUnique({
      where: { email: 'test-register@example.com' },
    });

    expect(user).toBeTruthy();
    expect(user?.emailVerified).toBeNull();
    expect(user?.registrationMethod).toBe('EMAIL_PASSWORD');
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '12345');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=/at least 8 characters/i')).toBeVisible();
  });
});
```

## 2. e2e/tests/auth/rate-limiting.spec.ts

```typescript
import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

test.describe('Rate Limiting', () => {
  const testEmail = 'test-ratelimit@example.com';

  test.beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.rateLimitLog.deleteMany({ where: { email: testEmail } });
  });

  test('should rate limit registration attempts', async ({ page }) => {
    await page.goto('/auth/register');

    for (let i = 0; i < 6; i++) {
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[type="password"]', 'Test@123456');
      await page.click('button[type="submit"]');

      if (i < 5) {
        await expect(page.locator('text=Check your email')).toBeVisible({
          timeout: 3000,
        });
        await page.goto('/auth/register');
      } else {
        await expect(
          page.locator('text=/too many.*attempts/i')
        ).toBeVisible();
      }
    }
  });
});
```

## Запуск тестов

```bash
# Все auth тесты
npm run test:e2e -- tests/auth/

# Конкретный тест
npm run test:e2e -- tests/auth/public-registration.spec.ts

# В UI mode
npm run test:e2e:ui -- tests/auth/
```
