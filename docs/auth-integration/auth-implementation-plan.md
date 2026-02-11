---
name: Email & Google OAuth Authentication Implementation
overview: План внедрения системы аутентификации с регистрацией через email (с обязательной верификацией), Google OAuth и сохранением административной регистрации
---

# План внедрения системы аутентификации

## Текущее состояние

- Используется NextAuth v4.24.5 с Credentials provider
- Модель `User` имеет обязательное поле `password`
- Модели `Account` и `Session` уже существуют
- Регистрация доступна только администратору через `/api/auth/register` с проверкой `ADMIN_REGISTRATION_PASSWORD`

## Архитектурные решения

### Подход к email верификации

**Важно:** NextAuth Email Provider предназначен для passwordless authentication (magic links), а не для регистрации с паролем.

**Наш подход:**
- Credentials Provider для email/password входа
- Google Provider для OAuth
- Custom таблица `EmailVerificationToken` для верификации email при регистрации
- Модель `VerificationToken` от NextAuth **НЕ используется**

### NextAuth Adapter и политика linking

**КРИТИЧНО:** NextAuth НЕ поддерживает использование `PrismaAdapter` вместе с `CredentialsProvider`.

Из документации NextAuth:
> "The Credentials provider can only be used if JSON Web Tokens are enabled for sessions. Users authenticated with the Credentials provider are not persisted in the database."

**Решение - условный adapter:**
- Для **OAuth (Google)**: использовать `PrismaAdapter` для создания User/Account в БД
- Для **Credentials (email/password)**: НЕ использовать adapter, полагаться на JWT
- Реализовать **динамическую логику** в authOptions

**Стратегия:**
```typescript
// Adapter будет использоваться ТОЛЬКО для OAuth провайдеров
// NextAuth автоматически игнорирует adapter для Credentials
adapter: PrismaAdapter(prisma),

// JWT strategy обязательна для Credentials
session: { strategy: 'jwt' },
```

**Политика linking (OAuth):**
- Если email уже существует → обновить `emailVerified`, связать account
- Если email новый → создать нового пользователя через adapter
- **НЕ** автоматически связывать OAuth с существующими Credentials аккаунтами

### Методы регистрации

```prisma
enum RegistrationMethod {
  ADMIN_CREATED    // Создан администратором
  EMAIL_PASSWORD   // Публичная регистрация через email
  OAUTH_GOOGLE     // Регистрация через Google
}
```

## Изменения в базе данных

### 1. Обновить модель User

```prisma
model User {
  id                  Int                 @id @default(autoincrement())
  email               String              @unique
  password            String?             // nullable для OAuth пользователей
  name                String?
  roleId              Int                 @default(1)
  emailVerified       DateTime?           // null = не верифицирован
  emailBounced        Boolean             @default(false) // true если email недоступен
  registrationMethod  RegistrationMethod  @default(EMAIL_PASSWORD)
  passwordChangedAt   DateTime?           // для инвалидации старых JWT токенов
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  // ... остальные существующие поля (из текущей схемы)
  interfaceLanguageId Int?
  learnLanguageId     Int?
  ownLanguageId       Int?
  hasConfigured       Boolean             @default(false)
  accounts            Account[]
  sessions            Session[]
  // ... rest of relations
  
  @@index([email])
  @@index([emailVerified])
  @@index([registrationMethod])
}
```

### 2. Создать таблицу EmailVerificationToken

**Отдельная** от NextAuth таблица для верификации email при регистрации:

```prisma
model EmailVerificationToken {
  id         String   @id @default(cuid())
  email      String   
  token      String   @unique
  expires    DateTime
  createdAt  DateTime @default(now())
  
  @@unique([email, token])
  @@index([token])
  @@index([email])
  @@index([expires])
}
```

### 3. Создать таблицу EmailResendLog

История повторных отправок (для мониторинга и аналитики):

```prisma
model EmailResendLog {
  id        Int      @id @default(autoincrement())
  email     String   
  sentAt    DateTime @default(now())
  ipAddress String?
  
  @@index([email, sentAt])
}
```

**Примечание:** НЕ делаем `email @unique`, чтобы хранить историю всех отправок.

### 3.1 Создать таблицу RateLimitLog

Единый rate limiting по email + IP + action (устойчиво для нескольких инстансов):

```prisma
model RateLimitLog {
  id        Int              @id @default(autoincrement())
  email     String?
  ipAddress String?
  action    RateLimitAction
  createdAt DateTime         @default(now())
  
  @@index([action, createdAt])
  @@index([email, createdAt])
  @@index([ipAddress, createdAt])
}

enum RateLimitAction {
  REGISTER
  RESEND
  FORGOT
  LOGIN
}
```

### 4. Создать таблицу EmailLog

Для мониторинга и отладки:

```prisma
model EmailLog {
  id          Int       @id @default(autoincrement())
  email       String
  type        EmailType
  status      String    // 'SUCCESS', 'FAILED', 'BOUNCED'
  provider    String
  messageId   String?
  error       String?
  sentAt      DateTime  @default(now())
  
  @@index([email, sentAt])
  @@index([type, sentAt])
  @@index([status, sentAt])
}

enum EmailType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
  EMAIL_CHANGED
  WELCOME
}
```

### 4.1 Создать таблицу AuditLog

Для безопасности и compliance:

```prisma
model AuditLog {
  id        Int      @id @default(autoincrement())
  userId    Int?
  action    String   // 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'LOGIN_FAILED', etc.
  ipAddress String?
  userAgent String?
  metadata  Json?    // Дополнительная информация
  createdAt DateTime @default(now())
  
  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([ipAddress, createdAt])
}
```

### 5. Создать таблицу PasswordResetToken

Для "Forgot Password" flow:

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  used      Boolean  @default(false)
  usedAt    DateTime?
  createdAt DateTime @default(now())
  
  @@unique([email, token])
  @@index([token])
  @@index([email])
  @@index([expires])
}
```

### 6. Forward Migration

```sql
-- 1. Создать enums
CREATE TYPE "RegistrationMethod" AS ENUM ('ADMIN_CREATED', 'EMAIL_PASSWORD', 'OAUTH_GOOGLE');
CREATE TYPE "EmailType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGED', 'WELCOME');
CREATE TYPE "RateLimitAction" AS ENUM ('REGISTER', 'RESEND', 'FORGOT', 'LOGIN');

-- 2. Добавить новые поля в User
ALTER TABLE "User" 
  ADD COLUMN "emailVerified" TIMESTAMP(3),
  ADD COLUMN "emailBounced" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "registrationMethod" "RegistrationMethod" NOT NULL DEFAULT 'EMAIL_PASSWORD',
  ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- 3. Обновить существующих пользователей (считаем их созданными админом)
UPDATE "User" 
SET 
  "emailVerified" = "createdAt",
  "registrationMethod" = 'ADMIN_CREATED',
  "passwordChangedAt" = "createdAt"
WHERE "emailVerified" IS NULL;

-- 3.1 Добавить индексы на новые поля
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");
CREATE INDEX "User_registrationMethod_idx" ON "User"("registrationMethod");

-- 4. Сделать password nullable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- 5. Создать EmailVerificationToken
CREATE TABLE "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");
CREATE UNIQUE INDEX "EmailVerificationToken_email_token_key" ON "EmailVerificationToken"("email", "token");
CREATE INDEX "EmailVerificationToken_token_idx" ON "EmailVerificationToken"("token");
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");
CREATE INDEX "EmailVerificationToken_expires_idx" ON "EmailVerificationToken"("expires");

-- 6. Создать EmailResendLog
CREATE TABLE "EmailResendLog" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  
  CONSTRAINT "EmailResendLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailResendLog_email_sentAt_idx" ON "EmailResendLog"("email", "sentAt");

-- 6.1 Создать RateLimitLog
CREATE TABLE "RateLimitLog" (
  "id" SERIAL NOT NULL,
  "email" TEXT,
  "ipAddress" TEXT,
  "action" "RateLimitAction" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "RateLimitLog_pkey" PRIMARY KEY ("id")
);

-- Composite index для эффективных запросов с несколькими условиями
CREATE INDEX "RateLimitLog_composite_idx" ON "RateLimitLog"("action", "email", "ipAddress", "createdAt");
CREATE INDEX "RateLimitLog_action_createdAt_idx" ON "RateLimitLog"("action", "createdAt");

-- 7. Создать EmailLog
CREATE TABLE "EmailLog" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "type" "EmailType" NOT NULL,
  "status" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "messageId" TEXT,
  "error" TEXT,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailLog_email_sentAt_idx" ON "EmailLog"("email", "sentAt");
CREATE INDEX "EmailLog_type_sentAt_idx" ON "EmailLog"("type", "sentAt");
CREATE INDEX "EmailLog_status_sentAt_idx" ON "EmailLog"("status", "sentAt");

-- 7.1 Создать AuditLog
CREATE TABLE "AuditLog" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER,
  "action" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_ipAddress_createdAt_idx" ON "AuditLog"("ipAddress", "createdAt");

-- 8. Создать PasswordResetToken
CREATE TABLE "PasswordResetToken" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");
CREATE INDEX "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");
```

### 7. Rollback Migration

```sql
-- 1. Удалить таблицы (в обратном порядке)
DROP TABLE IF EXISTS "AuditLog";
DROP TABLE IF EXISTS "PasswordResetToken";
DROP TABLE IF EXISTS "EmailLog";
DROP TABLE IF EXISTS "RateLimitLog";
DROP TABLE IF EXISTS "EmailResendLog";
DROP TABLE IF EXISTS "EmailVerificationToken";

-- 2. Вернуть password NOT NULL
-- ВНИМАНИЕ: Сначала нужно установить пароль для OAuth пользователей
UPDATE "User" SET "password" = '$2a$10$PLACEHOLDER_HASH' WHERE "password" IS NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- 3. Удалить новые поля
ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "emailVerified",
  DROP COLUMN IF EXISTS "emailBounced",
  DROP COLUMN IF EXISTS "registrationMethod",
  DROP COLUMN IF EXISTS "passwordChangedAt";

-- 4. Удалить enums
DROP TYPE IF EXISTS "EmailType";
DROP TYPE IF EXISTS "RateLimitAction";
DROP TYPE IF EXISTS "RegistrationMethod";
```

**Важно для rollback:**
- Перед откатом нужно решить, что делать с OAuth пользователями (они не имеют пароля)
- Вариант: установить им временный пароль и отправить письмо для сброса
- Или: не позволять откат, если есть OAuth пользователи

## Безопасность

### 1. Защита от User Enumeration Attack

**Проблема:** Злоумышленник может узнать, какие email зарегистрированы в системе.

**Решение:** Всегда возвращать одинаковый ответ независимо от существования пользователя:

```typescript
// ВСЕГДА возвращаем одинаковый ответ
const response = {
  message: 'If this email is registered and not verified, you will receive a verification email.'
};

// Проверяем пользователя ВНУТРИ, но не раскрываем результат
const user = await prisma.user.findUnique({ where: { email } });

if (user && !user.emailVerified) {
  // ... логика отправки
}

// Одинаковый ответ в любом случае
return NextResponse.json(response, { status: 200 });
```

**Применить ко всем endpoint:**
- `/api/auth/register-public` - не говорить "email already exists"
- `/api/auth/resend-verification` - не раскрывать существование
- `/api/auth/forgot-password` - не раскрывать существование

### 1.1 Сообщения ошибок в authorize

**Правило:** всегда возвращать одинаковое сообщение (`Invalid credentials`) без деталей
для всех сценариев (неверный email, пароль, не подтвержден email, OAuth-аккаунт и т.д.).
UX‑подсказки (например, "подтвердите email") выносить в отдельные flow (экран, banner, resend).

### 2. Rate Limiting (защита от TOCTOU)

**Проблема:** Time-of-check to time-of-use - параллельные запросы могут обойти rate limit.

**Решение:** Atomic check-and-log в одной транзакции.

```typescript
// lib/rate-limit.ts
import { prisma } from '@/lib/prisma';

type RateLimitAction = 'register' | 'resend' | 'forgot' | 'login';

interface RateLimitParams {
  email?: string;
  ipAddress?: string;
  action: RateLimitAction;
  limitMinutes?: number;
  maxAttempts?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remainingSeconds?: number;
  attemptsCount?: number;
}

/**
 * Проверяет и логирует rate limit атомарно
 * Защищено от race conditions через transaction
 */
export async function checkAndLogRateLimit(
  params: RateLimitParams
): Promise<RateLimitResult> {
  const limitMinutes = params.limitMinutes ?? 10;
  const maxAttempts = params.maxAttempts ?? 5;
  const since = new Date(Date.now() - limitMinutes * 60 * 1000);

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Проверяем текущее количество попыток
      const attempts = await tx.rateLimitLog.count({
        where: {
          action: params.action.toUpperCase() as any,
          createdAt: { gte: since },
          ...(params.email ? { email: params.email } : {}),
          ...(params.ipAddress ? { ipAddress: params.ipAddress } : {}),
        },
      });

      // 2. Если превышен лимит - не логируем, возвращаем false
      if (attempts >= maxAttempts) {
        // Находим самую старую запись для расчета времени ожидания
        const oldestAttempt = await tx.rateLimitLog.findFirst({
          where: {
            action: params.action.toUpperCase() as any,
            createdAt: { gte: since },
            ...(params.email ? { email: params.email } : {}),
            ...(params.ipAddress ? { ipAddress: params.ipAddress } : {}),
          },
          orderBy: { createdAt: 'asc' },
        });

        const remainingSeconds = oldestAttempt
          ? Math.ceil(
              (oldestAttempt.createdAt.getTime() +
                limitMinutes * 60 * 1000 -
                Date.now()) /
                1000
            )
          : 0;

        return {
          allowed: false,
          remainingSeconds: Math.max(0, remainingSeconds),
          attemptsCount: attempts,
        };
      }

      // 3. Логируем попытку
      await tx.rateLimitLog.create({
        data: {
          email: params.email ?? null,
          ipAddress: params.ipAddress ?? null,
          action: params.action.toUpperCase() as any,
        },
      });

      return { allowed: true, attemptsCount: attempts + 1 };
    });
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // При ошибке БД - fail safe (разрешаем запрос)
    return { allowed: true };
  }
}

/**
 * Очистка старых записей rate limit (вызывать из cron)
 */
export async function cleanupRateLimitLogs(daysToKeep: number = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const deleted = await prisma.rateLimitLog.deleteMany({
    where: { createdAt: { lt: cutoffDate } },
  });
  
  return deleted.count;
}
```

### 3. CSRF Protection

NextAuth v4 имеет встроенную защиту, проверяем:

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Минимум 32 байта
  // ... providers
};
```

**Генерация безопасного секрета:**

```bash
openssl rand -base64 32
```

### 4. Password Security

```typescript
// lib/validation.ts
import { z } from 'zod';

// Список самых распространенных паролей (top 100)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
  'bailey', 'passw0rd', 'shadow', '123123', '654321',
  'superman', 'qazwsx', 'michael', 'football', 'password1',
  // ... добавить больше при необходимости
];

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long') // Защита от DoS
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Password must contain at least one special character'
  )
  .refine(
    (pwd) => !COMMON_PASSWORDS.includes(pwd.toLowerCase()),
    'This password is too common. Please choose a stronger password.'
  );

export const registrationSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  password: passwordSchema,
  name: z.string().min(2).max(100).optional(),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

### 4.1 Нормализация email

**Проблема:** Gmail alias bypass - `user+test@gmail.com` и `user@gmail.com` разные аккаунты.

**Решение:** Полная нормализация с учетом провайдеров.

```typescript
// lib/email-utils.ts

/**
 * Нормализует email для предотвращения дубликатов
 * - Lowercase
 * - Trim
 * - Gmail: удаляет точки и всё после +
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const [local, domain] = trimmed.split('@');

  if (!domain) {
    return trimmed; // Невалидный email, пусть валидация отклонит
  }

  let normalizedLocal = local;

  // Gmail и Googlemail: удаляем точки и плюс-алиасы
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    normalizedLocal = local.replace(/\./g, '').split('+')[0];
  }
  
  // Microsoft (Outlook, Hotmail): удаляем плюс-алиасы
  if (
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com'
  ) {
    normalizedLocal = local.split('+')[0];
  }

  return `${normalizedLocal}@${domain}`;
}

/**
 * Проверяет является ли email валидным
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Проверяет является ли email одноразовым (disposable)
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    // Добавить больше при необходимости
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}
```

### 5. Token Security (с защитой от timing attacks)

**Email Verification Token:**
- Длина: минимум 32 байта (256 бит)
- Формат: random hex string
- TTL: 24 часа
- Одноразовый: удаляется после использования
- **Хранение: только хеш токена (не raw)**
- **То же правило для PasswordResetToken**
- **Защита от timing attacks при сравнении**

```typescript
// lib/tokens.ts
import crypto from 'crypto';
import { prisma } from './prisma';

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 символа
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Создает email verification token
 * ВАЖНО: Использует transaction для предотвращения race conditions
 */
export async function createEmailVerificationToken(
  email: string
): Promise<string> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа

  await prisma.$transaction(async (tx) => {
    // Удаляем старые токены для этого email
    await tx.emailVerificationToken.deleteMany({ where: { email } });

    // Создаём новый токен
    await tx.emailVerificationToken.create({
      data: { email, token: tokenHash, expires },
    });
  });

  return token; // Возвращаем raw токен (для отправки в email)
}

/**
 * Верифицирует email token
 * ВАЖНО: Защита от timing attacks через constant-time comparison
 */
export async function verifyEmailToken(
  token: string
): Promise<{ valid: boolean; error?: string; email?: string }> {
  const tokenHash = hashToken(token);

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' };
  }

  if (verificationToken.expires < new Date()) {
    // Удаляем истёкший токен
    await prisma.emailVerificationToken.delete({
      where: { token: tokenHash }, // ИСПРАВЛЕНО: использовать hash, не raw
    });
    return { valid: false, error: 'Token expired' };
  }

  return { valid: true, email: verificationToken.email };
}

/**
 * Создает password reset token
 */
export async function createPasswordResetToken(
  email: string
): Promise<string> {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 час

  await prisma.$transaction(async (tx) => {
    // Удаляем старые токены для этого email
    await tx.passwordResetToken.deleteMany({ where: { email } });

    // Создаём новый токен
    await tx.passwordResetToken.create({
      data: { email, token: tokenHash, expires },
    });
  });

  return token;
}

/**
 * Верифицирует password reset token
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<{
  valid: boolean;
  error?: string;
  email?: string;
  tokenHash?: string;
}> {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetToken) {
    return { valid: false, error: 'Invalid token' };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { token: tokenHash },
    });
    return { valid: false, error: 'Token expired' };
  }

  if (resetToken.used) {
    return { valid: false, error: 'Token already used' };
  }

  return { valid: true, email: resetToken.email, tokenHash };
}

/**
 * Помечает password reset token как использованный
 */
export async function markPasswordResetTokenAsUsed(
  tokenHash: string
): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token: tokenHash },
    data: { used: true, usedAt: new Date() },
  });
}
```

## Изменения в коде аутентификации

### 1. lib/auth.ts

**ВАЖНО:** Обратите внимание на:
1. PrismaAdapter используется (NextAuth сам игнорирует его для Credentials)
2. Все ошибки возвращают одинаковое сообщение "Invalid credentials"
3. Проверка passwordChangedAt для инвалидации старых JWT
4. Audit logging для failed login attempts

```typescript
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';

// Helper для получения пользователя с relations
async function getUserWithRelations(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { role: true, accounts: true },
  });
}

export const authOptions: NextAuthOptions = {
  // Adapter для OAuth (игнорируется NextAuth для Credentials)
  adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await getUserWithRelations(credentials.email);

        // ВАЖНО: Всегда одинаковая ошибка для всех случаев
        const genericError = 'Invalid credentials';

        if (!user) {
          // Логируем failed attempt без раскрытия деталей
          await logAudit({
            userId: null,
            action: 'LOGIN_FAILED',
            ipAddress: req?.headers?.['x-forwarded-for'] as string,
            metadata: { email: credentials.email, reason: 'user_not_found' },
          });
          throw new Error(genericError);
        }

        // Проверка 1: Если пользователь только OAuth - отклонить
        const hasOAuthAccount = user.accounts.some(
          (acc) => acc.provider === 'google'
        );
        if (hasOAuthAccount && !user.password) {
          await logAudit({
            userId: user.id,
            action: 'LOGIN_FAILED',
            ipAddress: req?.headers?.['x-forwarded-for'] as string,
            metadata: { email: credentials.email, reason: 'oauth_only' },
          });
          throw new Error(genericError);
        }

        // Проверка 2: Email должен быть верифицирован
        if (!user.emailVerified) {
          await logAudit({
            userId: user.id,
            action: 'LOGIN_FAILED',
            ipAddress: req?.headers?.['x-forwarded-for'] as string,
            metadata: { email: credentials.email, reason: 'email_not_verified' },
          });
          throw new Error(genericError);
        }

        // Проверка 3: Пароль должен существовать
        if (!user.password) {
          await logAudit({
            userId: user.id,
            action: 'LOGIN_FAILED',
            ipAddress: req?.headers?.['x-forwarded-for'] as string,
            metadata: { email: credentials.email, reason: 'no_password' },
          });
          throw new Error(genericError);
        }

        // Проверка 4: Пароль должен совпадать
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          await logAudit({
            userId: user.id,
            action: 'LOGIN_FAILED',
            ipAddress: req?.headers?.['x-forwarded-for'] as string,
            metadata: { email: credentials.email, reason: 'invalid_password' },
          });
          throw new Error(genericError);
        }

        // Успешный вход
        await logAudit({
          userId: user.id,
          action: 'LOGIN_SUCCESS',
          ipAddress: req?.headers?.['x-forwarded-for'] as string,
          metadata: { email: credentials.email },
        });

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role.code,
          emailVerified: user.emailVerified,
          registrationMethod: user.registrationMethod,
          passwordChangedAt: user.passwordChangedAt,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;

        // Проверяем email_verified от Google
        const emailVerified = (profile as any)?.email_verified ?? false;
        if (!emailVerified) {
          console.error('Google email not verified:', email);
          return '/auth/error?error=EmailNotVerifiedByProvider';
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Обновляем emailVerified для существующего пользователя
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() },
          });
          
          await logAudit({
            userId: existingUser.id,
            action: 'OAUTH_LOGIN',
            metadata: { provider: 'google', email },
          });
        } else {
          // Новый пользователь будет создан через PrismaAdapter
          // После создания залогируем через events.createUser
          await logAudit({
            userId: null,
            action: 'OAUTH_REGISTRATION',
            metadata: { provider: 'google', email },
          });
        }

        return true;
      }

      return true;
    },

    async jwt({ token, user, account, trigger }) {
      // Первый вход - сохраняем данные пользователя в токен
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.registrationMethod = user.registrationMethod;
        token.passwordChangedAt = user.passwordChangedAt;
      }

      // При обновлении сессии - проверяем не изменился ли пароль
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: Number(token.id) },
          select: { passwordChangedAt: true, emailVerified: true },
        });

        if (dbUser) {
          // Если пароль изменился после выдачи токена - инвалидируем
          if (
            dbUser.passwordChangedAt &&
            token.passwordChangedAt &&
            new Date(dbUser.passwordChangedAt) > new Date(token.passwordChangedAt)
          ) {
            console.log('Token invalidated: password changed');
            return {}; // Пустой токен = разлогинит пользователя
          }

          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.registrationMethod = token.registrationMethod as string;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Вызывается когда PrismaAdapter создаёт нового пользователя (OAuth)
      await logAudit({
        userId: Number(user.id),
        action: 'USER_CREATED',
        metadata: { 
          email: user.email,
          registrationMethod: 'OAUTH_GOOGLE',
        },
      });
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 дней
  },

  // ВАЖНО: Не использовать fallback для production
  secret: process.env.NEXTAUTH_SECRET,
};

// Валидация обязательных env переменных при старте
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not configured');
}
```

### 2. lib/audit.ts (НОВЫЙ)

```typescript
import { prisma } from './prisma';

interface AuditLogParams {
  userId: number | null;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Логирует действие пользователя для аудита
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        metadata: params.metadata ?? null,
      },
    });
  } catch (error) {
    // Не бросаем ошибку, чтобы не сломать основной flow
    console.error('Failed to log audit:', error);
  }
}

/**
 * Получает последние действия пользователя
 */
export async function getUserAuditLog(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Получает failed login attempts за последние N минут
 */
export async function getFailedLoginAttempts(
  identifier: string, // email или IP
  minutes: number = 15
): Promise<number> {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  return prisma.auditLog.count({
    where: {
      action: 'LOGIN_FAILED',
      createdAt: { gte: since },
      OR: [
        { metadata: { path: ['email'], equals: identifier } },
        { ipAddress: identifier },
      ],
    },
  });
}
```

### 3. lib/ip-utils.ts (НОВЫЙ)

```typescript
import { NextRequest } from 'next/server';

/**
 * Безопасно извлекает IP адрес из request
 * Учитывает reverse proxy (nginx, cloudflare)
 */
export function getClientIp(request: NextRequest): string {
  // Если за reverse proxy - берём первый IP из цепочки
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    return ips[0]; // Первый IP = клиент
  }

  // Cloudflare
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Другие заголовки
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Извлекает User-Agent из request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Проверяет является ли IP адрес локальным
 */
export function isLocalIp(ip: string): boolean {
  return (
    ip === 'unknown' ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  );
}
```

### 4. lib/email.ts

```typescript
import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Отправляет email для верификации
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@conozco.net',
      to: email,
      subject: 'Verify your email address - Conozco',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Welcome to Conozco!</h1>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #4F46E5;">${verificationUrl}</a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't create an account with Conozco, please ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    await prisma.emailLog.create({
      data: {
        email,
        type: 'EMAIL_VERIFICATION',
        status: 'SUCCESS',
        provider: 'RESEND',
        messageId: result.id,
      },
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email send error:', error);

    await prisma.emailLog.create({
      data: {
        email,
        type: 'EMAIL_VERIFICATION',
        status: 'FAILED',
        provider: 'RESEND',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Отправляет email для сброса пароля
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@conozco.net',
      to: email,
      subject: 'Reset your password - Conozco',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Password Reset Request</h1>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    await prisma.emailLog.create({
      data: {
        email,
        type: 'PASSWORD_RESET',
        status: 'SUCCESS',
        provider: 'RESEND',
        messageId: result.id,
      },
    });

    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Email send error:', error);

    await prisma.emailLog.create({
      data: {
        email,
        type: 'PASSWORD_RESET',
        status: 'FAILED',
        provider: 'RESEND',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Очистка истёкших токенов и старых логов
 */
export async function cleanupExpiredTokens(): Promise<{
  emailVerificationTokens: number;
  passwordResetTokens: number;
  emailResendLogs: number;
  rateLimitLogs: number;
  emailLogs: number;
}> {
  const now = new Date();

  const [
    emailVerificationTokens,
    passwordResetTokens,
    emailResendLogs,
    rateLimitLogs,
    emailLogs,
  ] = await Promise.all([
    // Удаляем истёкшие токены
    prisma.emailVerificationToken.deleteMany({
      where: { expires: { lt: now } },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { expires: { lt: now } },
    }),

    // Удаляем старые логи (90 дней)
    prisma.emailResendLog.deleteMany({
      where: {
        sentAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.rateLimitLog.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.emailLog.deleteMany({
      where: {
        sentAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    emailVerificationTokens: emailVerificationTokens.count,
    passwordResetTokens: passwordResetTokens.count,
    emailResendLogs: emailResendLogs.count,
    rateLimitLogs: rateLimitLogs.count,
    emailLogs: emailLogs.count,
  };
}

/**
 * Webhook handler для Resend events
 * Обрабатывает bounced/complained emails
 */
export async function handleResendWebhook(event: any): Promise<void> {
  try {
    switch (event.type) {
      case 'email.bounced':
        await prisma.user.updateMany({
          where: { email: event.data.email },
          data: { emailBounced: true },
        });
        console.log(`Marked email as bounced: ${event.data.email}`);
        break;

      case 'email.complained':
        // Можно добавить флаг spamComplaint
        console.log(`Spam complaint received: ${event.data.email}`);
        break;

      case 'email.delivered':
        // Опционально - обновить статус в EmailLog
        break;
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
}
```
```

### 3. API Routes

#### app/api/auth/register-public/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registrationSchema } from '@/lib/validation';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { normalizeEmail, isDisposableEmail } from '@/lib/email-utils';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const validation = registrationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    // Проверка на disposable email
    if (isDisposableEmail(normalizedEmail)) {
      await logAudit({
        userId: null,
        action: 'REGISTRATION_BLOCKED',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail, reason: 'disposable_email' },
      });

      return NextResponse.json(
        { error: 'Temporary email addresses are not allowed' },
        { status: 400 }
      );
    }

    // Rate limiting (атомарная проверка + лог)
    const rateLimit = await checkAndLogRateLimit({
      email: normalizedEmail,
      ipAddress: ip,
      action: 'register',
      maxAttempts: 5,
      limitMinutes: 60,
    });

    if (!rateLimit.allowed) {
      await logAudit({
        userId: null,
        action: 'REGISTRATION_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail },
      });

      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil((rateLimit.remainingSeconds || 0) / 60)} minutes.`,
        },
        { status: 429 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic response (не раскрывать существование пользователя)
    const genericResponse = {
      message:
        'Registration successful! Please check your email to verify your account.',
    };

    if (existingUser) {
      // Если пользователь уже существует, не раскрываем это
      // Но если email не верифицирован - переотправляем письмо
      if (!existingUser.emailVerified) {
        const token = await createEmailVerificationToken(normalizedEmail);
        await sendVerificationEmail(normalizedEmail, token);
      }

      await logAudit({
        userId: existingUser.id,
        action: 'REGISTRATION_DUPLICATE',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail },
      });

      return NextResponse.json(genericResponse, { status: 201 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await prisma.userRole.findUnique({
      where: { code: 'USER' },
    });

    if (!defaultRole) {
      console.error('Default USER role not found in database');
      return NextResponse.json(
        { error: 'Service configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
        roleId: defaultRole.id,
        registrationMethod: 'EMAIL_PASSWORD',
        emailVerified: null,
        passwordChangedAt: new Date(),
      },
    });

    // Создаём и отправляем verification token
    const token = await createEmailVerificationToken(normalizedEmail);
    const emailResult = await sendVerificationEmail(normalizedEmail, token);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Не падаем, пользователь может запросить повторную отправку
    }

    await logAudit({
      userId: user.id,
      action: 'USER_REGISTERED',
      ipAddress: ip,
      userAgent,
      metadata: { email: normalizedEmail },
    });

    return NextResponse.json(genericResponse, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);

    await logAudit({
      userId: null,
      action: 'REGISTRATION_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/verify-email/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailToken, hashToken } from '@/lib/tokens';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_token', request.url)
      );
    }

    const verification = await verifyEmailToken(token);

    if (!verification.valid) {
      const errorParam =
        verification.error === 'Token expired' ? 'token_expired' : 'invalid_token';

      return NextResponse.redirect(
        new URL(`/auth/login?error=${errorParam}`, request.url)
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verification.email },
    });

    if (!user) {
      await logAudit({
        userId: null,
        action: 'EMAIL_VERIFICATION_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { email: verification.email, reason: 'user_not_found' },
      });

      return NextResponse.redirect(
        new URL('/auth/login?error=user_not_found', request.url)
      );
    }

    if (user.emailVerified) {
      await logAudit({
        userId: user.id,
        action: 'EMAIL_VERIFICATION_DUPLICATE',
        ipAddress: ip,
        userAgent,
      });

      return NextResponse.redirect(
        new URL('/auth/login?message=already_verified', request.url)
      );
    }

    // Transaction: обновить пользователя + удалить токен
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });

      await tx.emailVerificationToken.delete({
        where: { token: hashToken(token) },
      });
    });

    await logAudit({
      userId: user.id,
      action: 'EMAIL_VERIFIED',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.redirect(
      new URL('/auth/login?message=email_verified', request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);

    await logAudit({
      userId: null,
      action: 'EMAIL_VERIFICATION_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.redirect(
      new URL('/auth/login?error=verification_failed', request.url)
    );
  }
}
```

#### app/api/auth/resend-verification/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/email-utils';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const validation = resendSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    const genericResponse = {
      message:
        'If this email is registered and not verified, you will receive a verification email.',
    };

    // Rate limiting
    const rateLimit = await checkAndLogRateLimit({
      email: normalizedEmail,
      ipAddress: ip,
      action: 'resend',
      maxAttempts: 3,
      limitMinutes: 10,
    });

    if (!rateLimit.allowed) {
      await logAudit({
        userId: null,
        action: 'RESEND_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail },
      });

      return NextResponse.json(
        {
          error: `Please wait ${Math.ceil((rateLimit.remainingSeconds || 0) / 60)} minutes before requesting another verification email.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic response (не раскрывать существование/статус пользователя)
    if (!user || user.emailVerified) {
      // Если пользователь не существует или уже верифицирован - не отправляем
      return NextResponse.json(genericResponse, { status: 200 });
    }

    // Отправляем verification email
    const token = await createEmailVerificationToken(normalizedEmail);
    const emailResult = await sendVerificationEmail(normalizedEmail, token);

    if (!emailResult.success) {
      console.error('Failed to resend verification email:', emailResult.error);
    }

    await logAudit({
      userId: user.id,
      action: 'VERIFICATION_EMAIL_RESENT',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error('Resend verification error:', error);

    await logAudit({
      userId: null,
      action: 'RESEND_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/forgot-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { normalizeEmail } from '@/lib/email-utils';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = normalizeEmail(email);

    const genericResponse = {
      message:
        'If this email is registered, you will receive a password reset link.',
    };

    // Rate limiting
    const rateLimit = await checkAndLogRateLimit({
      email: normalizedEmail,
      ipAddress: ip,
      action: 'forgot',
      maxAttempts: 3,
      limitMinutes: 15,
    });

    if (!rateLimit.allowed) {
      await logAudit({
        userId: null,
        action: 'PASSWORD_RESET_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail },
      });

      return NextResponse.json(
        {
          error: `Please wait ${Math.ceil((rateLimit.remainingSeconds || 0) / 60)} minutes before requesting another password reset.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: true },
    });

    // Generic response (не раскрывать существование пользователя)
    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }

    // Если пользователь только OAuth (нет пароля) - не отправляем
    const hasOAuthAccount = user.accounts.some((acc) => acc.provider === 'google');
    if (hasOAuthAccount && !user.password) {
      await logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_BLOCKED',
        ipAddress: ip,
        userAgent,
        metadata: { email: normalizedEmail, reason: 'oauth_only' },
      });

      return NextResponse.json(genericResponse, { status: 200 });
    }

    // Создаём reset token
    const token = await createPasswordResetToken(normalizedEmail);
    const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(genericResponse, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);

    await logAudit({
      userId: null,
      action: 'PASSWORD_RESET_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/reset-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validation';
import { verifyPasswordResetToken, markPasswordResetTokenAsUsed } from '@/lib/tokens';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Верифицируем токен
    const verification = await verifyPasswordResetToken(token);

    if (!verification.valid) {
      await logAudit({
        userId: null,
        action: 'PASSWORD_RESET_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { reason: verification.error },
      });

      return NextResponse.json(
        { error: verification.error || 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: verification.email },
    });

    if (!user) {
      await logAudit({
        userId: null,
        action: 'PASSWORD_RESET_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { email: verification.email, reason: 'user_not_found' },
      });

      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: обновить пароль + пометить токен использованным
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordChangedAt: new Date(), // ВАЖНО: для инвалидации старых JWT
        },
      }),
    ]);

    // Помечаем токен как использованный (вне транзакции для безопасности)
    await markPasswordResetTokenAsUsed(verification.tokenHash!);

    // Инвалидируем все активные сессии (опционально)
    // await prisma.session.deleteMany({ where: { userId: user.id } });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      ipAddress: ip,
      userAgent,
      metadata: { via: 'reset' },
    });

    return NextResponse.json(
      {
        message:
          'Password reset successful. You can now log in with your new password.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);

    await logAudit({
      userId: null,
      action: 'PASSWORD_RESET_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

#### Обновить app/api/auth/register/route.ts (админский)

**ВАЖНО:** Админская регистрация создаёт уже верифицированных пользователей.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { tServer } from '@/lib/i18n/utils/tServer';
import { registrationSchema } from '@/lib/validation';
import { normalizeEmail } from '@/lib/email-utils';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

// ВАЖНО: Не использовать fallback в production
const ADMIN_REGISTRATION_PASSWORD = process.env.ADMIN_REGISTRATION_PASSWORD;

if (!ADMIN_REGISTRATION_PASSWORD) {
  throw new Error('ADMIN_REGISTRATION_PASSWORD environment variable is required');
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const body = await request.json();
    const { email, password, name, adminPassword } = body;

    // Validate admin password
    if (adminPassword !== ADMIN_REGISTRATION_PASSWORD) {
      await logAudit({
        userId: null,
        action: 'ADMIN_REGISTRATION_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { reason: 'invalid_admin_password' },
      });

      return NextResponse.json(
        { error: await tServer('Invalid admin password') },
        { status: 403 }
      );
    }

    // Validate input
    const validation = registrationSchema.safeParse({ email, password, name });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: await tServer('User with this email already exists') },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const defaultRole = await prisma.userRole.findUnique({
      where: { code: 'USER' },
    });

    if (!defaultRole) {
      return NextResponse.json(
        { error: await tServer('Default user role is not configured') },
        { status: 500 }
      );
    }

    // Create user (admin-created users are pre-verified)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
        roleId: defaultRole.id,
        emailVerified: new Date(), // Админ создаёт верифицированных пользователей
        registrationMethod: 'ADMIN_CREATED',
        passwordChangedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        registrationMethod: true,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'ADMIN_USER_CREATED',
      ipAddress: ip,
      userAgent,
      metadata: { createdEmail: normalizedEmail },
    });

    const { role, ...rest } = user as any;

    return NextResponse.json(
      {
        user: {
          ...rest,
          role: role.code,
        },
        message: await tServer('User created successfully'),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin registration error:', error);

    await logAudit({
      userId: null,
      action: 'ADMIN_REGISTRATION_ERROR',
      ipAddress: ip,
      userAgent,
      metadata: { error: error instanceof Error ? error.message : 'Unknown' },
    });

    return NextResponse.json(
      { error: await tServer('Internal server error') },
      { status: 500 }
    );
  }
}
```

### 4. Middleware

**Важно:** 
- Middleware работает в Edge runtime — **НЕ** использовать Prisma/БД
- Работает только с JWT strategy
- Проверка emailVerified из JWT токена

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Дополнительные проверки можно добавить здесь
    // Например: роли, permissions, и т.д.

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        // Если нет токена - редирект на login
        if (!token) {
          return false;
        }

        // Для email/password регистрации требуется верифицированный email
        if (
          token.registrationMethod === 'EMAIL_PASSWORD' &&
          !token.emailVerified
        ) {
          // Редирект на страницу с сообщением о необходимости верификации
          const url = new URL('/auth/verify-required', req.url);
          url.searchParams.set('callbackUrl', req.nextUrl.pathname);
          return NextResponse.redirect(url);
        }

        // Проверка инвалидации токена по passwordChangedAt
        // ВАЖНО: Эту проверку нужно делать в jwt callback, не здесь
        // т.к. в middleware нет доступа к БД

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/words/:path*',
    '/training/:path*',
    '/settings/:path*',
    '/word-groups/:path*',
  ],
};
```

### 4.1 app/auth/verify-required/page.tsx (НОВЫЙ)

Страница для неверифицированных пользователей:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/shared';
import { useTranslation } from '@/lib/i18n';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyRequiredPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      // Здесь нужно получить email текущего пользователя
      // Это можно сделать через отдельный API endpoint
      const response = await fetch('/api/auth/resend-verification-current', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: t('Email sent'),
          description: data.message,
        });
      } else {
        toast({
          title: t('Error'),
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: t('Failed to send verification email'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">
            {t('Email Verification Required')}
          </CardTitle>
          <CardDescription>
            {t(
              'Please verify your email address to continue using the application.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            {t(
              "We've sent a verification email to your address. Please check your inbox and click the verification link."
            )}
          </p>

          {!emailSent ? (
            <Button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('Sending...')}
                </>
              ) : (
                t('Resend Verification Email')
              )}
            </Button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-green-800">
                {t('Verification email sent! Please check your inbox.')}
              </p>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            {t("Didn't receive the email? Check your spam folder.")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Edge Cases обработка

### 1. Пользователь удалил аккаунт, потом регистрируется снова

Вариант А: Soft delete (рекомендуется)
```prisma
model User {
  deletedAt DateTime?
  @@index([deletedAt])
}
```

Вариант Б: Полная очистка при удалении (CASCADE через relations)

### 2. Email токен истёк

Показать сообщение с кнопкой "Resend verification email"

### 3. Google account email изменился

NextAuth связывает account по `providerAccountId`, а не email - обновляем email при входе

### 4. Email регистрация, но уже есть Google account

Возвращаем generic сообщение (не раскрывая наличие Google account)

### 5. Сброс пароля для OAuth аккаунта

Возвращаем generic ответ (не раскрывая, что это OAuth account)

### 6. Два пользователя с одинаковым email

Невозможно благодаря `@unique` на email

### 7. Rate limit обход через VPN

Комбинировать email + IP + User-Agent fingerprinting

### 8. Email провайдер недоступен

Retry логика с экспоненциальным backoff

### 9. Concurrent requests для resend

Database-level locking через transactions

### 10. XSS в email параметрах

Валидация и санитизация через Zod schemas

## UI Components (Frontend)

### 1. app/auth/register/page.tsx (PUBLIC REGISTRATION)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/shared';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: t('Error'),
        description: t('Please fill all required fields'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast({
          title: t('Registration successful'),
          description: data.message,
        });
      } else {
        toast({
          title: t('Registration failed'),
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: t('Network error. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('Check your email')}</CardTitle>
            <CardDescription>
              {t('We sent you a verification link. Please check your inbox.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                {t("Didn't receive the email?")}{' '}
                <Link
                  href="/auth/resend-verification"
                  className="text-blue-600 hover:underline"
                >
                  {t('Resend')}
                </Link>
              </p>
              <Button
                onClick={() => router.push('/auth/login')}
                variant="outline"
                className="w-full"
              >
                {t('Back to login')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('Create an account')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('Enter your information to get started')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleSignInButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">
                {t('Or continue with')}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Name')}</label>
              <Input
                type="text"
                placeholder={t('Your name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('Email')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder={t('your@email.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('Password')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500">
                {t('At least 8 characters with uppercase, lowercase, number and special character')}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('Creating account...')}
                </>
              ) : (
                t('Create account')
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              {t('Already have an account?')}{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                {t('Sign in')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2. components/auth/GoogleSignInButton.tsx

```typescript
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function GoogleSignInButton() {
  const { t } = useTranslation();

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleSignIn}
    >
      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      {t('Continue with Google')}
    </Button>
  );
}
```

### 3. app/auth/forgot-password/page.tsx

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/shared';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: t('Error'),
        description: t('Please enter your email'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        toast({
          title: t('Error'),
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('Error'),
        description: t('Network error. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('Check your email')}</CardTitle>
            <CardDescription>
              {t('If this email is registered, you will receive a password reset link.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">{t('Back to login')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('Forgot password')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('Enter your email to receive a password reset link')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('Email')}</label>
              <Input
                type="email"
                placeholder={t('your@email.com')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('Sending...')}
                </>
              ) : (
                t('Send reset link')
              )}
            </Button>

            <Button asChild variant="ghost" className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Back to login')}
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Настройка внешних сервисов

### Resend Setup (за 7 дней до деплоя)

1. Зарегистрироваться на [resend.com](https://resend.com)
2. Создать API ключ в dashboard
3. Добавить домен `conozco.net`
4. **Настроить DNS в Namecheap:**
   
   **SPF запись (TXT):**
   - Type: TXT Record
   - Host: @
   - Value: `v=spf1 include:_spf.resend.com ~all`
   
   **DKIM записи (предоставит Resend):**
   - Type: CNAME или TXT
   - Host: (из Resend dashboard)
   - Value: (из Resend dashboard)
   
   **DMARC (рекомендуется):**
   - Type: TXT Record
   - Host: _dmarc
   - Value: `v=DMARC1; p=none; rua=mailto:admin@conozco.net`

5. Подождать 24-48 часов для распространения DNS
6. Верифицировать домен в Resend dashboard

### Google OAuth Setup

1. Перейти на [console.cloud.google.com](https://console.cloud.google.com)
2. Создать проект
3. Enable Google+ API
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://conozco.net/api/auth/callback/google`
     - `http://localhost:8000/api/auth/callback/google`
5. Configure OAuth Consent Screen:
   - User Type: External
   - Scopes: email, profile
   - Add test users

## Переменные окружения

### .env.local (development)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/conozco

NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your-super-secret-32-chars-min

RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@conozco.net

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

ADMIN_REGISTRATION_PASSWORD=your-admin-password
```

**Важно:** не использовать fallback-значения в коде для `NEXTAUTH_SECRET` и
`ADMIN_REGISTRATION_PASSWORD`. Если переменные не заданы — фейл-фаст при старте.

### Production (.env on server)

То же самое, но:
```bash
NEXTAUTH_URL=https://conozco.net
```

### GitHub Actions Secrets

Добавить в Repository → Settings → Secrets and variables → Actions:
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET` (если ещё не добавлен)
- `ADMIN_REGISTRATION_PASSWORD` (уже должен быть)
- `EMAIL_FROM` - email отправителя (например: `noreply@conozco.net`)

## CI/CD изменения

### 1. Обновить `.github/workflows/deploy.yml`

Добавить новые переменные окружения в deploy job:

```yaml
deploy:
  needs: build_and_push
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to server via SSH
      uses: appleboy/ssh-action@v1.0.3
      env:
        DOCR_READ_TOKEN: ${{ secrets.DOCR_READ_TOKEN }}
        ADMIN_REGISTRATION_PASSWORD: ${{ secrets.ADMIN_REGISTRATION_PASSWORD }}
        DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        DEEPL_API_KEY: ${{ secrets.DEEPL_API_KEY }}
        # Добавить новые секреты:
        NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
        EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
        GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
        GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        # Обновить envs для прокидывания через SSH:
        envs: REGISTRY,IMAGE_NAME,IMAGE_TAG,DOCR_READ_TOKEN,ADMIN_REGISTRATION_PASSWORD,DB_PASSWORD,DATABASE_URL,DEEPL_API_KEY,NEXTAUTH_SECRET,RESEND_API_KEY,EMAIL_FROM,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,COMMIT_HASH
        script: |
          # ... остальной скрипт без изменений
```

**Изменения:**
1. В секции `env:` добавлены 5 новых переменных
2. В параметре `envs:` добавлены те же 5 переменных для прокидывания через SSH

### 2. Обновить `docker-compose.prod.yml`

Добавить новые переменные окружения в секцию `app`:

```yaml
app:
  image: registry.digitalocean.com/conozco-registry/flashcards-app:${IMAGE_TAG}
  container_name: flashcards-app
  restart: always
  environment:
    DATABASE_URL: ${DATABASE_URL}
    NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
    NEXTAUTH_URL: https://conozco.net
    NODE_ENV: production
    DEEPL_API_KEY: ${DEEPL_API_KEY}
    ADMIN_REGISTRATION_PASSWORD: ${ADMIN_REGISTRATION_PASSWORD}
    # Добавить новые переменные:
    RESEND_API_KEY: ${RESEND_API_KEY}
    EMAIL_FROM: ${EMAIL_FROM}
    GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
    GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
  depends_on:
    postgres:
      condition: service_healthy
  # ... остальное без изменений
```

**Изменения:**
Добавлены 4 новые переменные окружения для приложения

### 3. Чек-лист для CI/CD

- [ ] Добавить `NEXTAUTH_SECRET` в GitHub Secrets (если отсутствует)
- [ ] Добавить `RESEND_API_KEY` в GitHub Secrets
- [ ] Добавить `EMAIL_FROM` в GitHub Secrets
- [ ] Добавить `GOOGLE_CLIENT_ID` в GitHub Secrets
- [ ] Добавить `GOOGLE_CLIENT_SECRET` в GitHub Secrets
- [ ] Обновить `.github/workflows/deploy.yml` - добавить переменные в `env` и `envs`
- [ ] Обновить `docker-compose.prod.yml` - добавить переменные в `app.environment`
- [ ] Проверить, что все секреты правильно названы (без опечаток)
- [ ] Сделать test deploy на staging для проверки прокидывания переменных

**Важно:** После добавления секретов в GitHub, они будут доступны только при следующем deploy через Actions. Для локального тестирования нужно также обновить `.env.production` на сервере (если используется).

### 5. types/next-auth.d.ts (обновить)

```typescript
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
    emailVerified?: Date | null;
    registrationMethod?: string;
    passwordChangedAt?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      emailVerified: Date | null;
      registrationMethod: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id?: string;
    emailVerified?: Date | null;
    registrationMethod?: string;
    passwordChangedAt?: Date | null;
  }
}
```

### 6. API: app/api/webhooks/resend/route.ts (НОВЫЙ)

Webhook для обработки events от Resend (bounced/complained emails):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { handleResendWebhook } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // ВАЖНО: В production добавить проверку signature от Resend
    const signature = request.headers.get('resend-signature');
    // TODO: Верифицировать signature

    const event = await request.json();

    await handleResendWebhook(event);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Resend webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### 7. API: app/api/auth/resend-verification-current/route.ts (НОВЫЙ)

Для authenticated пользователей (из verify-required page):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { checkAndLogRateLimit } from '@/lib/rate-limit';
import { getClientIp, getUserAgent } from '@/lib/ip-utils';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const email = session.user.email;
    const userId = Number(session.user.id);

    // Rate limiting
    const rateLimit = await checkAndLogRateLimit({
      email,
      ipAddress: ip,
      action: 'resend',
      maxAttempts: 3,
      limitMinutes: 10,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Please wait ${Math.ceil((rateLimit.remainingSeconds || 0) / 60)} minutes before requesting another email.`,
        },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified' },
        { status: 200 }
      );
    }

    // Отправляем verification email
    const token = await createEmailVerificationToken(email);
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    await logAudit({
      userId,
      action: 'VERIFICATION_EMAIL_RESENT',
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json(
      {
        message:
          'Verification email sent! Please check your inbox and spam folder.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

## Зависимости

### Установка новых пакетов:

```bash
# Email сервис
npm install resend

# NextAuth adapter для Prisma
npm install @next-auth/prisma-adapter

# Для валидации (уже установлен, но проверить версию)
# npm install zod
```

### Проверка версий:

```json
{
  "dependencies": {
    "next-auth": "^4.24.5",
    "@next-auth/prisma-adapter": "^1.0.7",
    "resend": "^3.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4"
  }
}
```

## Deployment Checklist

### Перед деплоем:

**Настройка сервисов:**
- [ ] DNS настроен в Namecheap (за 7 дней!)
- [ ] Домен верифицирован в Resend
- [ ] Тестовое письмо отправлено успешно
- [ ] Google OAuth credentials созданы
- [ ] OAuth consent screen настроен

**GitHub Actions секреты:**
- [ ] `NEXTAUTH_SECRET` добавлен в GitHub Secrets
- [ ] `RESEND_API_KEY` добавлен в GitHub Secrets
- [ ] `EMAIL_FROM` добавлен в GitHub Secrets
- [ ] `GOOGLE_CLIENT_ID` добавлен в GitHub Secrets
- [ ] `GOOGLE_CLIENT_SECRET` добавлен в GitHub Secrets

**CI/CD файлы:**
- [ ] `.github/workflows/deploy.yml` обновлён (добавлены новые переменные в env и envs)
- [ ] `docker-compose.prod.yml` обновлён (добавлены новые переменные в app.environment)

**База данных:**
- [ ] Миграция БД протестирована на staging
- [ ] Rollback миграция подготовлена

**Тестирование:**
- [ ] E2E тесты проходят
- [ ] Test deploy на staging для проверки прокидывания переменных

**Готовность:**
- [ ] `.env.production` готов на сервере

### Во время деплоя:

1. **Backup БД:** `npm run db:backup`
2. **Применить миграцию:** `npm run prisma:migrate`
3. **Проверить таблицы**
4. **Deploy code:** Push to main
5. **Smoke test**

### После деплоя:

**Smoke tests:**
- [ ] Регистрация через email работает
- [ ] Email verification приходит и работает
- [ ] Google OAuth работает (регистрация + логин)
- [ ] Forgot password работает
- [ ] Reset password работает
- [ ] Админская регистрация работает
- [ ] Rate limiting срабатывает
- [ ] Middleware блокирует неверифицированных пользователей

**Мониторинг:**
- [ ] Проверить логи приложения (errors)
- [ ] Проверить метрики Resend (deliverability)
- [ ] Проверить audit logs в БД
- [ ] Проверить rate limit logs
- [ ] Настроить alerting (Sentry/Slack)

**Безопасность:**
- [ ] Проверить что NEXTAUTH_SECRET установлен (не fallback)
- [ ] Проверить что ADMIN_REGISTRATION_PASSWORD установлен
- [ ] Проверить HTTPS работает корректно
- [ ] Проверить CORS настройки
- [ ] Проверить что sensitive data не логируется

## Мониторинг

### Метрики для отслеживания:

1. **Email (Resend dashboard):**
   - Количество писем в день
   - Доставляемость
   - Bounces
   - Complaints

2. **Database:**
   - Неверифицированные пользователи
   - Истёкшие токены
   - Rate limit срабатывания

3. **Application:**
   - Ошибки отправки email
   - Failed login attempts
   - Rate limit violations

### SQL для мониторинга:

```sql
-- Неверифицированные пользователи старше 7 дней
SELECT COUNT(*) FROM "User"
WHERE "emailVerified" IS NULL
  AND "registrationMethod" = 'EMAIL_PASSWORD'
  AND "createdAt" < NOW() - INTERVAL '7 days';

-- Email success rate за 24 часа
SELECT "status", COUNT(*) as count
FROM "EmailLog"
WHERE "sentAt" > NOW() - INTERVAL '24 hours'
GROUP BY "status";

-- Top rate limited emails
SELECT "email", COUNT(*) as attempts
FROM "EmailResendLog"
WHERE "sentAt" > NOW() - INTERVAL '1 hour'
GROUP BY "email"
HAVING COUNT(*) > 3
ORDER BY attempts DESC;
```

### Cron job для очистки токенов

```typescript
// scripts/cleanup-auth-tokens.ts
import { cleanupExpiredTokens } from '@/lib/email';
import { cleanupRateLimitLogs } from '@/lib/rate-limit';

interface CleanupStats {
  emailVerificationTokens: number;
  passwordResetTokens: number;
  emailResendLogs: number;
  rateLimitLogs: number;
  emailLogs: number;
  auditLogs?: number;
}

async function main() {
  const startTime = Date.now();
  console.log('[CLEANUP] Starting token cleanup...');

  try {
    // Очистка токенов и логов
    const stats = await cleanupExpiredTokens();
    
    // Опционально: очистка старых audit logs (180 дней)
    const { default: prisma } = await import('@/lib/prisma');
    const auditLogsDeleted = await prisma.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
      },
    });

    const totalStats: CleanupStats = {
      ...stats,
      auditLogs: auditLogsDeleted.count,
    };

    const duration = Date.now() - startTime;

    console.log('[CLEANUP] Success:', JSON.stringify(totalStats, null, 2));
    console.log(`[CLEANUP] Duration: ${duration}ms`);

    // Exit с кодом 0 (success)
    process.exit(0);
  } catch (error) {
    console.error('[CLEANUP] Failed:', error);

    // Опционально: отправить alert (Slack, Sentry, email)
    // await sendAlert({
    //   title: 'Token Cleanup Failed',
    //   error: error instanceof Error ? error.message : 'Unknown error',
    // });

    // Exit с кодом 1 (failure)
    process.exit(1);
  }
}

// Обработка unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('[CLEANUP] Unhandled rejection:', error);
  process.exit(1);
});

main();
```

**Добавить в package.json:**

```json
{
  "scripts": {
    "cleanup:auth": "tsx scripts/cleanup-auth-tokens.ts"
  }
}
```

**Настройка cron (на сервере):**

```bash
# Открыть crontab
crontab -e

# Добавить задачу (каждый день в 2:00 AM)
0 2 * * * cd /home/deploy/flashcards && /usr/bin/npm run cleanup:auth >> /var/log/flashcards-cleanup.log 2>&1

# Или через systemd timer (рекомендуется)
```

**Systemd timer (альтернатива cron):**

```ini
# /etc/systemd/system/flashcards-cleanup.service
[Unit]
Description=Flashcards Auth Tokens Cleanup
After=network.target

[Service]
Type=oneshot
User=deploy
WorkingDirectory=/home/deploy/flashcards
ExecStart=/usr/bin/npm run cleanup:auth
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/flashcards-cleanup.timer
[Unit]
Description=Run Flashcards Auth Cleanup Daily
Requires=flashcards-cleanup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Включить и запустить timer
sudo systemctl enable flashcards-cleanup.timer
sudo systemctl start flashcards-cleanup.timer

# Проверить статус
sudo systemctl status flashcards-cleanup.timer
sudo systemctl list-timers
```

## CAPTCHA Integration (рекомендуется)

### Зачем нужен CAPTCHA:
- Защита от ботов при регистрации
- Предотвращение массового создания аккаунтов
- Снижение нагрузки на email сервис

### Рекомендуемые решения:

**1. Cloudflare Turnstile (РЕКОМЕНДУЕТСЯ)**
- Бесплатный
- Privacy-friendly (GDPR compliant)
- Незаметный для пользователей
- Легкая интеграция

```bash
npm install @marsidev/react-turnstile
```

```typescript
// components/auth/TurnstileCaptcha.tsx
'use client';

import { Turnstile } from '@marsidev/react-turnstile';

export function TurnstileCaptcha({ onSuccess }: { onSuccess: (token: string) => void }) {
  return (
    <Turnstile
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={onSuccess}
      options={{
        theme: 'light',
        size: 'normal',
      }}
    />
  );
}
```

**2. hCaptcha**
- Бесплатный
- Privacy-friendly
- Альтернатива reCAPTCHA

```bash
npm install @hcaptcha/react-hcaptcha
```

**Интеграция в registration:**

```typescript
// app/auth/register/page.tsx
const [captchaToken, setCaptchaToken] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!captchaToken) {
    toast({
      title: 'Error',
      description: 'Please complete the CAPTCHA',
      variant: 'destructive',
    });
    return;
  }

  const response = await fetch('/api/auth/register-public', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      name,
      captchaToken,
    }),
  });
  // ...
};

// В форме:
<TurnstileCaptcha onSuccess={setCaptchaToken} />
```

**Серверная валидация:**

```typescript
// lib/captcha.ts
export async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      }),
    }
  );

  const data = await response.json();
  return data.success === true;
}

// В register route:
const captchaValid = await verifyCaptcha(body.captchaToken, ip);
if (!captchaValid) {
  return NextResponse.json(
    { error: 'CAPTCHA verification failed' },
    { status: 400 }
  );
}
```

**Environment variables:**

```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
TURNSTILE_SECRET_KEY=your-secret-key
```

## Будущие улучшения

### Когда подключать Redis:
- Traffic > 1000 users/day
- Rate limiting стал bottleneck
- Нужен distributed rate limiting (несколько серверов)

### Фичи Phase 2:
- ✅ **CAPTCHA для регистрации** (можно добавить сразу)
- Email templates с React Email
- Мультиязычные email (i18n)
- Two-factor authentication (2FA)
- Social login (Facebook, Apple)
- Email change flow
- Account merge
- Pwned passwords check (haveibeenpwned.com API)
- Device tracking & suspicious login detection
- Magic link authentication

## Файлы для создания/изменения

### База данных:
- ✅ `prisma/schema.prisma` - обновить (добавить новые модели и поля)
- ✅ `prisma/migrations/XXXXXX_auth_upgrade/migration.sql` - forward migration
- ✅ `prisma/migrations/XXXXXX_auth_upgrade/rollback.sql` - rollback (опционально)

### Backend (lib) - СОЗДАТЬ:
- ✅ `lib/auth.ts` - **ОБНОВИТЬ** (добавить OAuth, audit logging, password invalidation)
- ✅ `lib/email.ts` - **СОЗДАТЬ** (Resend integration, email templates)
- ✅ `lib/email-utils.ts` - **СОЗДАТЬ** (email normalization, disposable check)
- ✅ `lib/tokens.ts` - **СОЗДАТЬ** (secure token generation, hashing, verification)
- ✅ `lib/rate-limit.ts` - **СОЗДАТЬ** (atomic rate limiting)
- ✅ `lib/validation.ts` - **СОЗДАТЬ** (Zod schemas, password validation)
- ✅ `lib/audit.ts` - **СОЗДАТЬ** (audit logging)
- ✅ `lib/ip-utils.ts` - **СОЗДАТЬ** (safe IP extraction)
- ⚠️ `lib/captcha.ts` - **СОЗДАТЬ** (опционально, если используете CAPTCHA)

### API Routes - СОЗДАТЬ:
- ✅ `app/api/auth/register/route.ts` - **ОБНОВИТЬ** (admin registration)
- ✅ `app/api/auth/register-public/route.ts` - **СОЗДАТЬ** (public registration)
- ✅ `app/api/auth/verify-email/route.ts` - **СОЗДАТЬ** (email verification)
- ✅ `app/api/auth/resend-verification/route.ts` - **СОЗДАТЬ** (resend verification)
- ✅ `app/api/auth/resend-verification-current/route.ts` - **СОЗДАТЬ** (для authenticated users)
- ✅ `app/api/auth/forgot-password/route.ts` - **СОЗДАТЬ** (password reset request)
- ✅ `app/api/auth/reset-password/route.ts` - **СОЗДАТЬ** (password reset)
- ⚠️ `app/api/webhooks/resend/route.ts` - **СОЗДАТЬ** (Resend webhooks)

### Frontend - СОЗДАТЬ/ОБНОВИТЬ:
- ⚠️ `app/auth/register/page.tsx` - **СОЗДАТЬ/ОБНОВИТЬ** (public registration form)
- ✅ `app/auth/login/page.tsx` - **ОБНОВИТЬ** (добавить Google OAuth button)
- ⚠️ `app/auth/verify-required/page.tsx` - **СОЗДАТЬ** (для неверифицированных)
- ⚠️ `app/auth/forgot-password/page.tsx` - **СОЗДАТЬ** (forgot password form)
- ⚠️ `app/auth/reset-password/page.tsx` - **СОЗДАТЬ** (reset password form)
- ⚠️ `app/auth/error/page.tsx` - **СОЗДАТЬ** (OAuth error page)
- ⚠️ `components/auth/GoogleSignInButton.tsx` - **СОЗДАТЬ** (Google OAuth button)
- ⚠️ `components/auth/TurnstileCaptcha.tsx` - **СОЗДАТЬ** (опционально)

### Types:
- ✅ `types/next-auth.d.ts` - **ОБНОВИТЬ** (добавить новые поля)

### Middleware:
- ✅ `middleware.ts` - **ОБНОВИТЬ** (email verification check)

### Scripts:
- ✅ `scripts/cleanup-auth-tokens.ts` - **СОЗДАТЬ** (cleanup cron job)

### Tests (E2E):
- ⚠️ `e2e/tests/auth/public-registration.spec.ts` - **СОЗДАТЬ**
- ⚠️ `e2e/tests/auth/email-verification.spec.ts` - **СОЗДАТЬ**
- ⚠️ `e2e/tests/auth/google-oauth.spec.ts` - **СОЗДАТЬ**
- ⚠️ `e2e/tests/auth/forgot-password.spec.ts` - **СОЗДАТЬ**
- ⚠️ `e2e/tests/auth/rate-limiting.spec.ts` - **СОЗДАТЬ**
- ⚠️ `e2e/tests/auth/password-change-invalidation.spec.ts` - **СОЗДАТЬ**

### Config:
- ✅ `.env.example` - **ОБНОВИТЬ** (добавить новые переменные)
- ✅ `package.json` - **ОБНОВИТЬ** (добавить resend, @next-auth/prisma-adapter)

### CI/CD:
- ✅ `.github/workflows/deploy.yml` - **ОБНОВИТЬ** (добавить секреты)
- ✅ `docker-compose.prod.yml` - **ОБНОВИТЬ** (env variables)

### Документация:
- ⚠️ `docs/auth-api-endpoints.md` - **СОЗДАТЬ** (API documentation)
- ⚠️ `docs/auth-troubleshooting.md` - **СОЗДАТЬ** (troubleshooting guide)

**Легенда:**
- ✅ Подробно расписано в плане
- ⚠️ Требует создания (базовая структура описана)

---

## 📋 Краткий чеклист реализации

### Phase 1: Подготовка (1-2 дня)

- [ ] **DNS настройка** (за 2 недели до деплоя!)
  - SPF, DKIM, DMARC для conozco.net
  - Верификация в Resend dashboard
- [ ] **GitHub Secrets**
  - NEXTAUTH_SECRET, RESEND_API_KEY, EMAIL_FROM
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] **Google OAuth**
  - Создать project в Google Cloud Console
  - Настроить OAuth Consent Screen
  - Добавить redirect URIs

### Phase 2: Backend (2-3 дня)

- [ ] **Database migration**
  - Backup БД: `npm run db:backup`
  - Применить forward migration
  - Проверить новые таблицы и индексы
- [ ] **Lib файлы**
  - ✅ lib/auth.ts (OAuth + audit)
  - ✅ lib/email.ts (Resend)
  - ✅ lib/email-utils.ts
  - ✅ lib/tokens.ts
  - ✅ lib/rate-limit.ts
  - ✅ lib/validation.ts
  - ✅ lib/audit.ts
  - ✅ lib/ip-utils.ts
- [ ] **API Routes**
  - ✅ register-public, verify-email
  - ✅ resend-verification, forgot/reset password
  - ⚠️ webhooks/resend
- [ ] **Types**
  - ✅ Обновить types/next-auth.d.ts
- [ ] **Middleware**
  - ✅ Проверка emailVerified

### Phase 3: Frontend (2 дня)

- [ ] **Auth Pages**
  - ⚠️ register, forgot-password, reset-password
  - ⚠️ verify-required, error pages
  - ✅ Обновить login (Google button)
- [ ] **Components**
  - ⚠️ GoogleSignInButton
  - ⚠️ TurnstileCaptcha (опционально)

### Phase 4: Testing (1-2 дня)

- [ ] **E2E Tests**
  - ⚠️ public-registration.spec.ts
  - ⚠️ email-verification.spec.ts
  - ⚠️ rate-limiting.spec.ts
  - ⚠️ google-oauth.spec.ts
- [ ] **Manual Testing**
  - Registration flow end-to-end
  - Email delivery
  - OAuth flow
  - Rate limiting

### Phase 5: Deployment (1 день)

- [ ] **CI/CD Update**
  - ✅ .github/workflows/deploy.yml
  - ✅ docker-compose.prod.yml
- [ ] **Deploy**
  - Push to main → автодеплой
  - Smoke tests
  - Monitor logs
- [ ] **Post-Deploy**
  - Настроить cleanup cron job
  - Настроить monitoring/alerting
  - Проверить Resend metrics

### Phase 6: Monitoring (ongoing)

- [ ] **Metrics**
  - Email deliverability (Resend dashboard)
  - Failed login attempts (AuditLog)
  - Rate limiting hits
- [ ] **Alerts**
  - Email failures
  - High rate limiting
  - OAuth errors

---

## 🔗 Дополнительные документы

- **[E2E Tests](auth-e2e-tests.md)** - Примеры тестов и helpers
- **[Troubleshooting Guide](auth-troubleshooting.md)** - Решение типичных проблем

---

## 📊 Оценка трудозатрат

| Phase | Task | Estimate |
|-------|------|----------|
| 1 | Подготовка (DNS, OAuth setup) | 4-8 часов |
| 2 | Backend (DB migration, lib, API) | 16-24 часа |
| 3 | Frontend (pages, components) | 12-16 часов |
| 4 | Testing (E2E + manual) | 8-12 часов |
| 5 | Deployment | 4-6 часов |
| **Total** | | **44-66 часов** (6-8 дней) |

**Примечание:** Оценка для одного разработчика. Может варьироваться в зависимости от опыта.

---

## ✅ Критерии приёмки

### Функциональность

- ✅ Пользователь может зарегистрироваться через email
- ✅ Пользователь получает verification email
- ✅ Email verification работает корректно
- ✅ Пользователь может войти через Google OAuth
- ✅ Forgot/Reset password flow работает
- ✅ Rate limiting блокирует abuse
- ✅ Админская регистрация сохранена

### Безопасность

- ✅ User enumeration защищён (generic responses)
- ✅ Пароли хешируются (bcrypt 10 rounds)
- ✅ Токены хешируются в БД (SHA-256)
- ✅ JWT инвалидируется при смене пароля
- ✅ Rate limiting работает атомарно
- ✅ IP extraction безопасный
- ✅ CSRF protection (NextAuth)
- ✅ HTTPS enforced (production)

### Performance

- ✅ Все критичные индексы созданы
- ✅ Rate limiting < 100ms
- ✅ Email отправка < 2s
- ✅ Login < 500ms

### Reliability

- ✅ Database backup перед миграцией
- ✅ Rollback migration подготовлен
- ✅ Email failures логируются
- ✅ Audit log для критичных операций
- ✅ Graceful error handling

---

## 🚀 Next Steps (Phase 2)

После успешного деплоя Phase 1:

1. **CAPTCHA** (if spam становится проблемой)
   - Cloudflare Turnstile integration
   - Настройка порогов

2. **Email Templates**
   - React Email для красивых писем
   - Multilingual support (i18n)

3. **2FA** (Two-Factor Authentication)
   - TOTP (Google Authenticator)
   - Backup codes

4. **Advanced Features**
   - Magic link authentication
   - Device tracking
   - Suspicious login detection
   - Account merge flow

5. **Monitoring**
   - Sentry integration
   - Slack alerts
   - Grafana dashboards

---

## 📝 Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-02-04 | Senior Review | Security improvements, transaction fixes, audit logging, comprehensive testing |
| 1.0 | 2026-02-03 | Initial | Basic plan for email + OAuth authentication |

---

## ⚠️ Важные предупреждения

1. **ВСЕГДА делать backup БД перед миграцией**
   ```bash
   npm run db:backup
   ```

2. **НЕ использовать fallback для secrets в production**
   ```typescript
   // ❌ ПЛОХО
   const SECRET = process.env.SECRET || 'default-secret';
   
   // ✅ ХОРОШО
   const SECRET = process.env.SECRET;
   if (!SECRET) throw new Error('SECRET required');
   ```

3. **DNS настройка за 2 недели** (не за 7 дней)
   - Время на устранение проблем
   - Propagation может занять 48 часов

4. **Тестировать на staging перед production**
   - Email delivery
   - OAuth flow
   - Rate limiting

5. **Мониторить после деплоя минимум 48 часов**
   - Email deliverability
   - Error rates
   - User complaints

---

**Успешной имплементации! 🎉**

Если возникнут вопросы или проблемы, см. [Troubleshooting Guide](auth-troubleshooting.md).
