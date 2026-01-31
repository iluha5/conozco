---
name: Email OAuth Auth Plan
overview: Внедрение безопасной регистрации через email с верификацией и Google OAuth, с сохранением административной регистрации. План включает защиту от user enumeration, rate limiting, rollback стратегию и обработку всех edge cases.
todos:
  - id: setup-services
    content: Настроить Resend (домен, DNS в Namecheap) и Google OAuth - ДО деплоя за 7 дней
    status: pending
  - id: update-schema
    content: "Обновить prisma/schema.prisma: добавить enums, новые таблицы, обновить User модель"
    status: pending
  - id: create-migration
    content: Создать forward и rollback миграции БД
    status: pending
  - id: backup-db
    content: Сделать backup БД перед применением миграции
    status: pending
  - id: apply-migration
    content: Применить миграцию БД на staging, проверить, затем на production
    status: pending
  - id: create-lib-modules
    content: "Создать lib модули: email.ts, tokens.ts, rate-limit.ts, validation.ts"
    status: pending
  - id: update-auth-config
    content: "Обновить lib/auth.ts: добавить Google Provider, callbacks, проверки emailVerified"
    status: pending
  - id: create-api-routes
    content: "Создать новые API routes: register-public, verify-email, resend-verification, forgot-password, reset-password"
    status: pending
  - id: update-admin-registration
    content: Обновить app/api/auth/register/route.ts для установки emailVerified и registrationMethod
    status: pending
  - id: update-middleware
    content: Обновить middleware.ts для проверки emailVerified
    status: pending
  - id: update-ui-pages
    content: "Обновить страницы register и login: добавить Google OAuth, forgot password, error handling"
    status: pending
  - id: create-auth-components
    content: "Создать компоненты: ResendVerificationEmail.tsx, forgot-password page, reset-password page"
    status: pending
  - id: install-dependencies
    content: "Установить зависимости: npm install resend"
    status: pending
  - id: setup-env-variables
    content: Добавить переменные окружения локально и на production сервере
    status: pending
  - id: setup-github-secrets
    content: "Настроить GitHub Actions секреты: RESEND_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    status: pending
  - id: create-tests
    content: "Создать E2E тесты для всех flows: публичная регистрация, Google OAuth, forgot password, rate limiting"
    status: pending
  - id: test-staging
    content: Протестировать все flows на staging окружении
    status: pending
  - id: deploy-production
    content: Deploy на production с проверкой checklist
    status: pending
  - id: smoke-test-production
    content: "Smoke test на production: регистрация, email, OAuth, админская регистрация"
    status: pending
  - id: setup-monitoring
    content: "Настроить мониторинг: email метрики, database queries, application logs"
    status: pending
  - id: setup-cleanup-cron
    content: Настроить cron job для очистки истёкших токенов
    status: pending
---

# План внедрения email-верификации и Google OAuth (улучшенная версия)

## Ключевые архитектурные решения

### 1. НЕ использовать NextAuth Email Provider

**Важно:** NextAuth Email Provider предназначен для passwordless authentication (magic links), а не для регистрации с паролем.

**Наш подход:**
- Credentials Provider для email/password входа
- Google Provider для OAuth
- Custom таблица `EmailVerificationToken` для верификации email при регистрации
- Модель `VerificationToken` от NextAuth **НЕ используется**

### 2. Методы регистрации

Добавляем enum для отслеживания способа создания пользователя:

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
  registrationMethod  RegistrationMethod  @default(EMAIL_PASSWORD)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  // ... остальные поля без изменений
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

**Зачем отдельная таблица:**
- NextAuth `VerificationToken` используется для magic links
- Наша таблица - для email verification при регистрации с паролем
- Разные жизненные циклы и логика

### 3. Создать таблицу EmailResendLog

Rate limiting для повторной отправки (10 минут между запросами):

```prisma
model EmailResendLog {
  id        Int      @id @default(autoincrement())
  email     String   
  sentAt    DateTime @default(now())
  ipAddress String?  // Опционально для дополнительной защиты
  
  @@index([email, sentAt])
}
```

**Примечание:** НЕ делаем `email @unique`, чтобы хранить историю всех отправок.

### 4. Создать таблицу EmailLog

Для мониторинга и отладки отправки писем:

```prisma
model EmailLog {
  id          Int       @id @default(autoincrement())
  email       String
  type        EmailType // VERIFICATION, PASSWORD_RESET, etc.
  status      String    // SUCCESS, FAILED
  provider    String    // RESEND
  messageId   String?   // ID от email провайдера
  error       String?   
  sentAt      DateTime  @default(now())
  
  @@index([email, sentAt])
  @@index([type])
  @@index([status])
}

enum EmailType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
  EMAIL_CHANGED
  WELCOME
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

### 6. Миграция БД

**Forward migration:**

```sql
-- 1. Создать enum RegistrationMethod
CREATE TYPE "RegistrationMethod" AS ENUM ('ADMIN_CREATED', 'EMAIL_PASSWORD', 'OAUTH_GOOGLE');

-- 2. Создать enum EmailType
CREATE TYPE "EmailType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGED', 'WELCOME');

-- 3. Добавить новые поля в User
ALTER TABLE "User" 
  ADD COLUMN "emailVerified" TIMESTAMP(3),
  ADD COLUMN "registrationMethod" "RegistrationMethod" NOT NULL DEFAULT 'EMAIL_PASSWORD';

-- 4. Обновить существующих пользователей - считаем их созданными админом
UPDATE "User" 
SET 
  "emailVerified" = "createdAt",
  "registrationMethod" = 'ADMIN_CREATED'
WHERE "emailVerified" IS NULL;

-- 5. Сделать password nullable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- 6. Создать EmailVerificationToken
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

-- 7. Создать EmailResendLog
CREATE TABLE "EmailResendLog" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  
  CONSTRAINT "EmailResendLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailResendLog_email_sentAt_idx" ON "EmailResendLog"("email", "sentAt");

-- 8. Создать EmailLog
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
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- 9. Создать PasswordResetToken
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

**Rollback migration:**

```sql
-- 1. Удалить таблицы (в обратном порядке)
DROP TABLE IF EXISTS "PasswordResetToken";
DROP TABLE IF EXISTS "EmailLog";
DROP TABLE IF EXISTS "EmailResendLog";
DROP TABLE IF EXISTS "EmailVerificationToken";

-- 2. Вернуть password NOT NULL
-- ВНИМАНИЕ: Сначала нужно установить пароль для OAuth пользователей
UPDATE "User" SET "password" = '$2a$10$PLACEHOLDER_HASH' WHERE "password" IS NULL;
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- 3. Удалить новые поля
ALTER TABLE "User" 
  DROP COLUMN IF EXISTS "emailVerified",
  DROP COLUMN IF EXISTS "registrationMethod";

-- 4. Удалить enums
DROP TYPE IF EXISTS "EmailType";
DROP TYPE IF EXISTS "RegistrationMethod";
```

**Важно для rollback:**
- Перед откатом нужно решить, что делать с OAuth пользователями (они не имеют пароля)
- Вариант: установить им временный пароль и отправить письмо для сброса
- Или: не позволять откат, если есть OAuth пользователи

## Безопасность

### 1. Защита от User Enumeration Attack

**Проблема:** Злоумышленник может узнать, какие email зарегистрированы в системе.

**Решение:**

```typescript
// app/api/auth/resend-verification/route.ts
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  
  // ВСЕГДА возвращаем одинаковый ответ
  const response = {
    message: 'If this email is registered and not verified, you will receive a verification email.'
  };
  
  // Проверяем пользователя ВНУТРИ, но не раскрываем результат
  const user = await prisma.user.findUnique({
    where: { email }
  });
  
  // Отправляем email ТОЛЬКО если:
  // 1. Пользователь существует
  // 2. Email не верифицирован
  // 3. Rate limit не превышен
  if (user && !user.emailVerified) {
    // ... логика отправки
  }
  
  // Одинаковый ответ в любом случае
  return NextResponse.json(response, { status: 200 });
}
```

**Применить ко всем endpoint:**
- `/api/auth/register-public` - не говорить "email already exists"
- `/api/auth/resend-verification` - не раскрывать существование
- `/api/auth/forgot-password` - не раскрывать существование

### 2. Rate Limiting (10 минут)

**Реализация через БД (без Redis пока):**

```typescript
// lib/rate-limit.ts
export async function checkEmailRateLimit(
  email: string,
  limitMinutes: number = 10
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  
  // Получить последнюю отправку для этого email
  const lastLog = await prisma.emailResendLog.findFirst({
    where: { email },
    orderBy: { sentAt: 'desc' }
  });
  
  if (!lastLog) {
    return { allowed: true };
  }
  
  const now = new Date();
  const timeSinceLastSend = now.getTime() - lastLog.sentAt.getTime();
  const limitMs = limitMinutes * 60 * 1000;
  
  if (timeSinceLastSend < limitMs) {
    const remainingSeconds = Math.ceil((limitMs - timeSinceLastSend) / 1000);
    return { 
      allowed: false, 
      remainingSeconds 
    };
  }
  
  return { allowed: true };
}

export async function logEmailResend(email: string, ipAddress?: string) {
  await prisma.emailResendLog.create({
    data: {
      email,
      ipAddress,
      sentAt: new Date()
    }
  });
}
```

**Дополнительная защита:**

```typescript
// lib/rate-limit.ts - IP based rate limiting (опционально)
const ipRateLimitCache = new Map<string, { count: number; resetAt: number }>();

export function checkIpRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMinutes: number = 60
): { allowed: boolean; remainingRequests?: number } {
  
  const now = Date.now();
  const limit = ipRateLimitCache.get(ip);
  
  // Очистить expired записи
  if (limit && now > limit.resetAt) {
    ipRateLimitCache.delete(ip);
  }
  
  if (!limit || now > limit.resetAt) {
    ipRateLimitCache.set(ip, {
      count: 1,
      resetAt: now + windowMinutes * 60 * 1000
    });
    return { allowed: true, remainingRequests: maxRequests - 1 };
  }
  
  if (limit.count >= maxRequests) {
    return { allowed: false, remainingRequests: 0 };
  }
  
  limit.count++;
  return { allowed: true, remainingRequests: maxRequests - limit.count };
}
```

### 3. CSRF Protection для OAuth

NextAuth v4 имеет встроенную защиту, но нужно проверить:

```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Минимум 32 байта
  // ... providers
};

// Проверка в .env.example
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long-random-string
```

**Генерация безопасного секрета:**

```bash
openssl rand -base64 32
```

### 4. Password Security

```typescript
// lib/validation.ts
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(2).max(100).optional(),
});
```

### 5. Token Security

**Email Verification Token:**
- Длина: минимум 32 байта (256 бит)
- Формат: random hex string
- TTL: 24 часа
- Одноразовый: удаляется после использования

```typescript
// lib/tokens.ts
import crypto from 'crypto';

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 символа
}

export async function createEmailVerificationToken(email: string) {
  const token = generateSecureToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
  
  // Удалить старые токены для этого email
  await prisma.emailVerificationToken.deleteMany({
    where: { email }
  });
  
  // Создать новый
  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires
    }
  });
  
  return token;
}

export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token }
  });
  
  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' };
  }
  
  if (verificationToken.expires < new Date()) {
    // Удалить истёкший токен
    await prisma.emailVerificationToken.delete({
      where: { token }
    });
    return { valid: false, error: 'Token expired' };
  }
  
  return { valid: true, email: verificationToken.email };
}
```

## Изменения в коде аутентификации

### 1. Обновить lib/auth.ts

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider для email/password
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            role: true,
            accounts: true 
          },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Проверка 1: Если пользователь OAuth - отклонить
        const hasOAuthAccount = user.accounts.some(
          acc => acc.provider === 'google'
        );
        
        if (hasOAuthAccount) {
          throw new Error('Please use Google to sign in');
        }

        // Проверка 2: Email должен быть верифицирован
        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in');
        }

        // Проверка 3: Пароль должен существовать
        if (!user.password) {
          throw new Error('No password set for this account');
        }

        // Проверка 4: Пароль должен совпадать
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: user.role.code,
        };
      },
    }),
    
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google OAuth flow
      if (account?.provider === 'google') {
        const email = user.email;
        
        if (!email) {
          return false; // Reject if no email
        }
        
        // Проверить существующего пользователя
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true }
        });
        
        if (existingUser) {
          // Пользователь существует - обновить emailVerified
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { 
              emailVerified: new Date(),
              // Не обновляем registrationMethod, если пользователь был создан раньше
            }
          });
          
          return true;
        }
        
        // Новый пользователь через Google
        // NextAuth автоматически создаст User и Account
        // Нужно обновить registrationMethod через событие
        return true;
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      
      // При первом входе через Google - обновить registrationMethod
      if (account?.provider === 'google' && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });
        
        if (dbUser && dbUser.registrationMethod !== 'OAUTH_GOOGLE') {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { 
              registrationMethod: 'OAUTH_GOOGLE',
              emailVerified: new Date()
            }
          });
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // Redirect errors to login
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 2. Email Service (lib/email.ts)

```typescript
import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@conozco.net',
      to: email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to Conozco!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
    });
    
    // Логировать успешную отправку
    await prisma.emailLog.create({
      data: {
        email,
        type: 'EMAIL_VERIFICATION',
        status: 'SUCCESS',
        provider: 'RESEND',
        messageId: result.id,
      }
    });
    
    return { success: true, messageId: result.id };
    
  } catch (error) {
    console.error('Email send error:', error);
    
    // Логировать ошибку
    await prisma.emailLog.create({
      data: {
        email,
        type: 'EMAIL_VERIFICATION',
        status: 'FAILED',
        provider: 'RESEND',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<SendEmailResult> {
  
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@conozco.net',
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    });
    
    await prisma.emailLog.create({
      data: {
        email,
        type: 'PASSWORD_RESET',
        status: 'SUCCESS',
        provider: 'RESEND',
        messageId: result.id,
      }
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
      }
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Cleanup expired tokens (запускать периодически)
export async function cleanupExpiredTokens() {
  const now = new Date();
  
  // Удалить истёкшие verification tokens
  await prisma.emailVerificationToken.deleteMany({
    where: { expires: { lt: now } }
  });
  
  // Удалить истёкшие password reset tokens
  await prisma.passwordResetToken.deleteMany({
    where: { expires: { lt: now } }
  });
  
  // Удалить старые logs (старше 90 дней)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await prisma.emailResendLog.deleteMany({
    where: { sentAt: { lt: ninetyDaysAgo } }
  });
}
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
import { checkIpRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting по IP (5 регистраций в час)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const ipLimit = checkIpRateLimit(ip, 5, 60);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    
    // Валидация с Zod
    const validation = registrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validation.data;
    
    // Проверить существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // НЕ раскрывать, что пользователь существует!
      // Возвращаем успешный ответ
      return NextResponse.json(
        { 
          message: 'Please check your email to verify your account.' 
        },
        { status: 201 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Получить default роль
    const defaultRole = await prisma.userRole.findUnique({
      where: { code: 'USER' }
    });
    
    if (!defaultRole) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }
    
    // Создать пользователя (НЕ верифицированный)
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        roleId: defaultRole.id,
        registrationMethod: 'EMAIL_PASSWORD',
        emailVerified: null, // Требуется верификация
      }
    });
    
    // Создать токен верификации
    const token = await createEmailVerificationToken(email);
    
    // Отправить email
    const emailResult = await sendVerificationEmail(email, token);
    
    if (!emailResult.success) {
      // Email не отправлен - логируем, но не показываем пользователю
      console.error('Failed to send verification email:', emailResult.error);
      // Можно добавить retry логику или оповещение админа
    }
    
    return NextResponse.json(
      { 
        message: 'Please check your email to verify your account.' 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/verify-email/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyEmailToken } from '@/lib/tokens';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_token', request.url)
      );
    }
    
    // Проверить токен
    const verification = await verifyEmailToken(token);
    
    if (!verification.valid) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${verification.error === 'Token expired' ? 'token_expired' : 'invalid_token'}`,
          request.url
        )
      );
    }
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email: verification.email }
    });
    
    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=user_not_found', request.url)
      );
    }
    
    // Проверить, не верифицирован ли уже
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/auth/login?message=already_verified', request.url)
      );
    }
    
    // Верифицировать пользователя
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });
    
    // Удалить токен (одноразовый)
    await prisma.emailVerificationToken.delete({
      where: { token }
    });
    
    // Redirect на login с success message
    return NextResponse.redirect(
      new URL('/auth/login?message=email_verified', request.url)
    );
    
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/auth/login?error=verification_failed', request.url)
    );
  }
}
```

#### app/api/auth/resend-verification/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email';
import { checkEmailRateLimit, logEmailResend } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // ВСЕГДА возвращаем одинаковый ответ (защита от user enumeration)
    const genericResponse = {
      message: 'If this email is registered and not verified, you will receive a verification email.'
    };
    
    // Проверить rate limit (10 минут)
    const rateLimit = await checkEmailRateLimit(email, 10);
    
    if (!rateLimit.allowed) {
      // НЕ раскрываем, что email существует!
      // Возвращаем generic сообщение, но с информацией о времени ожидания
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(rateLimit.remainingSeconds! / 60)} minutes before requesting another verification email.` 
        },
        { status: 429 }
      );
    }
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Если пользователь не существует или уже верифицирован - возвращаем generic ответ
    if (!user || user.emailVerified) {
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    // Создать новый токен
    const token = await createEmailVerificationToken(email);
    
    // Отправить email
    const emailResult = await sendVerificationEmail(email, token);
    
    // Залогировать отправку
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip');
    await logEmailResend(email, ip || undefined);
    
    if (!emailResult.success) {
      console.error('Failed to resend verification email:', emailResult.error);
    }
    
    return NextResponse.json(genericResponse, { status: 200 });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/forgot-password/route.ts (новый flow)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSecureToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkEmailRateLimit, logEmailResend } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Generic response (защита от user enumeration)
    const genericResponse = {
      message: 'If this email is registered, you will receive a password reset link.'
    };
    
    // Rate limit (10 минут)
    const rateLimit = await checkEmailRateLimit(email, 10);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(rateLimit.remainingSeconds! / 60)} minutes before requesting another password reset.` 
        },
        { status: 429 }
      );
    }
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true }
    });
    
    // Если пользователя нет - generic ответ
    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    // Если пользователь OAuth - не позволяем сбросить пароль
    const hasOAuthAccount = user.accounts.some(acc => acc.provider === 'google');
    if (hasOAuthAccount) {
      // Generic ответ (не раскрываем, что это OAuth account)
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    // Создать токен сброса (1 час)
    const token = generateSecureToken();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 час
    
    // Удалить старые токены
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });
    
    // Создать новый
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires
      }
    });
    
    // Отправить email
    const emailResult = await sendPasswordResetEmail(email, token);
    
    // Залогировать
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip');
    await logEmailResend(email, ip || undefined);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }
    
    return NextResponse.json(genericResponse, { status: 200 });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
```

#### app/api/auth/reset-password/route.ts (новый flow)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    // Валидация пароля
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    // Найти токен
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Проверить срок действия
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { token }
      });
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }
    
    // Проверить, не использован ли уже
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      );
    }
    
    // Найти пользователя
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Hash нового пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Обновить пароль и пометить токен как использованный
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { 
          used: true,
          usedAt: new Date()
        }
      })
    ]);
    
    return NextResponse.json(
      { message: 'Password reset successful. You can now log in.' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

#### Обновить app/api/auth/register/route.ts (админский)

```typescript
// ... существующий код до создания пользователя

// Создать пользователя (верифицированный, созданный админом)
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name: name || null,
    roleId: defaultRole.id,
    emailVerified: new Date(), // Админ создаёт верифицированных пользователей
    registrationMethod: 'ADMIN_CREATED',
  },
  // ... остальное без изменений
});
```

### 4. Middleware обновление

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Можно добавить дополнительные проверки здесь
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        // Проверка аутентификации
        if (!token) {
          return false;
        }
        
        // Для Credentials Provider - проверяем emailVerified в БД
        // (для OAuth это уже проверено при signIn)
        if (token.email) {
          const user = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { emailVerified: true, registrationMethod: true }
          });
          
          // OAuth пользователи всегда имеют emailVerified
          // Для EMAIL_PASSWORD - проверяем
          if (
            user?.registrationMethod === 'EMAIL_PASSWORD' && 
            !user.emailVerified
          ) {
            return false;
          }
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/', '/words/:path*', '/training/:path*', '/settings/:path*'],
};
```

## Edge Cases обработка

### 1. Пользователь удалил аккаунт, потом регистрируется снова

**Решение:** Soft delete или полная очистка

```typescript
// Вариант А: Soft delete (рекомендуется)
model User {
  // ... поля
  deletedAt DateTime?
  
  @@index([deletedAt])
}

// При регистрации проверять:
const existingUser = await prisma.user.findFirst({
  where: { 
    email,
    deletedAt: null // Только активные
  }
});

// Вариант Б: Полная очистка при удалении
// CASCADE удаление через relations в schema.prisma
```

### 2. Email токен истёк, пользователь кликает на ссылку

**Решение:** Понятное сообщение + возможность запросить новый

```typescript
// app/auth/login/page.tsx
// Показать сообщение "Token expired" с кнопкой "Resend verification email"

if (searchParams.error === 'token_expired') {
  return (
    <div>
      <p>Your verification link has expired.</p>
      <ResendVerificationEmail />
    </div>
  );
}
```

### 3. Google account email изменился

**Проблема:** Пользователь изменил email в Google, теперь при входе NextAuth видит новый email.

**Решение:** NextAuth связывает account по `providerAccountId`, а не email

```typescript
// callbacks.signIn
if (account?.provider === 'google') {
  // Найти по providerAccountId, а не email
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: 'google',
        providerAccountId: account.providerAccountId
      }
    },
    include: { user: true }
  });
  
  if (existingAccount) {
    // Обновить email пользователя
    await prisma.user.update({
      where: { id: existingAccount.userId },
      data: { email: user.email! }
    });
  }
}
```

### 4. Пользователь пытается зарегистрироваться через email, но уже есть Google account

**Решение:** Объединить аккаунты или показать ошибку

```typescript
// app/api/auth/register-public/route.ts
const existingUser = await prisma.user.findUnique({
  where: { email },
  include: { accounts: true }
});

if (existingUser) {
  const hasGoogleAccount = existingUser.accounts.some(
    acc => acc.provider === 'google'
  );
  
  if (hasGoogleAccount) {
    // НЕ раскрывать напрямую, но можно дать подсказку
    // через generic сообщение
    return NextResponse.json(
      { message: 'Please check your email or try signing in with Google.' },
      { status: 200 }
    );
  }
}
```

### 5. Пользователь запрашивает сброс пароля для OAuth аккаунта

**Решение:** Не позволять, но не раскрывать

```typescript
// app/api/auth/forgot-password/route.ts (уже реализовано выше)
const hasOAuthAccount = user.accounts.some(acc => acc.provider === 'google');
if (hasOAuthAccount) {
  // Generic ответ
  return NextResponse.json(genericResponse, { status: 200 });
}
```

### 6. Два пользователя с одинаковым email (email + OAuth)

**Решение:** НЕВОЗМОЖНО благодаря `@unique` на email

```prisma
model User {
  email String @unique // Один email = один аккаунт
}
```

Если пользователь регистрируется через email, потом пытается через Google - NextAuth автоматически связывает с существующим User.

### 7. Rate limit обход через VPN/прокси

**Решение:** Комбинировать несколько факторов

```typescript
// lib/rate-limit.ts - улучшенная версия
export async function checkAdvancedRateLimit(
  email: string,
  ip: string,
  userAgent: string
): Promise<{ allowed: boolean }> {
  
  // Проверка 1: Email rate limit
  const emailLimit = await checkEmailRateLimit(email, 10);
  if (!emailLimit.allowed) return { allowed: false };
  
  // Проверка 2: IP rate limit
  const ipLimit = checkIpRateLimit(ip, 5, 60);
  if (!ipLimit.allowed) return { allowed: false };
  
  // Проверка 3: User-Agent fingerprint (опционально)
  // Можно добавить более сложный fingerprinting
  
  return { allowed: true };
}
```

### 8. Email провайдер (Resend) недоступен

**Решение:** Graceful degradation + retry логика

```typescript
// lib/email.ts - добавить retry
export async function sendVerificationEmailWithRetry(
  email: string,
  token: string,
  maxRetries: number = 3
): Promise<SendEmailResult> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendVerificationEmail(email, token);
    
    if (result.success) {
      return result;
    }
    
    // Если не последняя попытка - ждём
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  // Все попытки провалились - уведомить админа
  console.error('CRITICAL: Failed to send email after retries:', email);
  // TODO: Отправить уведомление в Slack/Telegram
  
  return { success: false, error: 'Service temporarily unavailable' };
}
```

### 9. Concurrent requests для resend email

**Решение:** Database-level locking или idempotency

```typescript
// lib/rate-limit.ts
export async function checkEmailRateLimitWithLock(
  email: string,
  limitMinutes: number = 10
): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  
  // Используем transaction для atomic check-and-set
  return await prisma.$transaction(async (tx) => {
    const lastLog = await tx.emailResendLog.findFirst({
      where: { email },
      orderBy: { sentAt: 'desc' }
    });
    
    // ... проверка времени ...
    
    if (allowed) {
      // Сразу создаём запись - atomic operation
      await tx.emailResendLog.create({
        data: { email, sentAt: new Date() }
      });
    }
    
    return { allowed };
  });
}
```

### 10. XSS в email параметрах

**Решение:** Валидация и санитизация

```typescript
// lib/validation.ts
import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5)
  .max(255)
  .transform(email => email.toLowerCase().trim());

// В API routes всегда использовать schema validation
```

## UI Components

### 1. Обновить app/auth/register/page.tsx

Добавить:
- Публичная регистрация (email/password)
- Google OAuth кнопка
- Сохранить админскую форму (скрытую или отдельную)
- Показать сообщение после регистрации
- Password strength indicator

### 2. Обновить app/auth/login/page.tsx

Добавить:
- Google OAuth кнопка
- Обработка ошибок (email not verified, etc.)
- Ссылка на forgot password
- Ссылка на resend verification

### 3. Создать components/auth/ResendVerificationEmail.tsx

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ResendVerificationEmail({ email }: { email?: string }) {
  const [inputEmail, setInputEmail] = useState(email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  
  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputEmail })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
      } else if (response.status === 429) {
        setMessage(data.error);
        // Parse remaining time из сообщения
        const match = data.error.match(/(\d+) minutes/);
        if (match) {
          setRemainingTime(parseInt(match[1]) * 60);
          // Start countdown
          startCountdown();
        }
      } else {
        setMessage(data.error || 'An error occurred');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const startCountdown = () => {
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div>
      <input
        type="email"
        value={inputEmail}
        onChange={(e) => setInputEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={loading || remainingTime > 0}
      />
      
      <Button 
        onClick={handleResend}
        disabled={loading || remainingTime > 0 || !inputEmail}
      >
        {remainingTime > 0 
          ? `Wait ${formatTime(remainingTime)}`
          : 'Resend Verification Email'
        }
      </Button>
      
      {message && <p>{message}</p>}
    </div>
  );
}
```

### 4. Создать app/auth/forgot-password/page.tsx

Форма для запроса сброса пароля.

### 5. Создать app/auth/reset-password/page.tsx

Форма для установки нового пароля (принимает token из URL).

## Настройка внешних сервисов

### 1. Resend Setup (ВАЖНО: сделать ДО деплоя)

**Шаги:**

1. Зарегистрироваться на [resend.com](https://resend.com)
2. Создать API ключ в dashboard
3. Добавить домен `conozco.net`:
   - Domains → Add Domain
   - Выбрать домен
   - Получить DNS записи

4. **Настроить DNS в Namecheap (за 7 дней до деплоя!):**
   
   В Namecheap dashboard → Domain List → Manage → Advanced DNS:
   
   **SPF запись (TXT):**
   - Type: TXT Record
   - Host: @
   - Value: `v=spf1 include:_spf.resend.com ~all`
   - TTL: Automatic
   
   **DKIM записи (предоставит Resend):**
   Обычно 3 записи:
   - Type: CNAME или TXT
   - Host: (предоставит Resend, например `resend._domainkey`)
   - Value: (предоставит Resend)
   - TTL: Automatic
   
   **DMARC (опционально, но рекомендуется):**
   - Type: TXT Record
   - Host: _dmarc
   - Value: `v=DMARC1; p=none; rua=mailto:admin@conozco.net`
   - TTL: Automatic

5. **Верификация домена:**
   - Подождать 24-48 часов для распространения DNS
   - В Resend dashboard нажать "Verify Domain"
   - Проверить статус: должен быть "Verified"

6. **Тестирование:**
   ```bash
   # Отправить тестовое письмо через Resend API
   curl -X POST 'https://api.resend.com/emails' \
     -H 'Authorization: Bearer YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "from": "noreply@conozco.net",
       "to": "your-email@example.com",
       "subject": "Test",
       "html": "<p>Test email</p>"
     }'
   ```

### 2. Google OAuth Setup

**Шаги:**

1. Перейти на [console.cloud.google.com](https://console.cloud.google.com)
2. Создать новый проект или выбрать существующий
3. **Enable Google+ API:**
   - APIs & Services → Library
   - Найти "Google+ API"
   - Enable

4. **Create OAuth 2.0 Credentials:**
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: "Conozco Web App"
   
   **Authorized JavaScript origins:**
   - `https://conozco.net`
   - `http://localhost:8000` (для разработки)
   
   **Authorized redirect URIs:**
   - `https://conozco.net/api/auth/callback/google`
   - `http://localhost:8000/api/auth/callback/google` (для разработки)
   
   - Create → Сохранить Client ID и Client Secret

5. **Configure OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - User Type: External
   - App information:
     - App name: Conozco
     - User support email: support@conozco.net
     - Developer contact: your-email@example.com
   - Scopes: Add `email` и `profile` (non-sensitive scopes)
   - Test users: Добавить свои emails для тестирования
   - Save and Continue

6. **Publishing:**
   - Изначально приложение в "Testing" mode
   - Для production: Submit for verification (может занять несколько дней)
   - Пока в Testing mode - работает только для test users

## Переменные окружения

### .env.local (development)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/conozco

# NextAuth
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your-super-secret-key-min-32-characters-generated-with-openssl

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@conozco.net

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Admin registration (existing)
ADMIN_REGISTRATION_PASSWORD=your-admin-password
```

### Production (.env on server)

Те же переменные, но с production значениями:

```bash
NEXTAUTH_URL=https://conozco.net
# ... остальные
```

### GitHub Actions Secrets

В GitHub Repository → Settings → Secrets and variables → Actions:

Добавить секреты:
- `RESEND_API_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `ADMIN_REGISTRATION_PASSWORD`

**В workflow файле (.github/workflows/deploy.yml):**

```yaml
env:
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
  GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  # ... другие
```

## Зависимости

### Установить:

```bash
npm install resend
npm install zod # уже есть
```

### package.json обновление

```json
{
  "dependencies": {
    "resend": "^3.0.0",
    // ... остальные
  }
}
```

## Тестирование

### E2E тесты (Playwright)

Создать тесты для:

1. **Публичная регистрация:**
   - Регистрация нового пользователя
   - Верификация email (mock email или testmode)
   - Попытка входа до верификации (должна fail)
   - Вход после верификации

2. **Google OAuth:**
   - Регистрация через Google
   - Вход через Google
   - Email автоматически verified

3. **Forgot Password:**
   - Запрос сброса пароля
   - Установка нового пароля
   - Вход с новым паролем

4. **Rate Limiting:**
   - Превышение лимита resend
   - Проверка countdown

5. **Edge Cases:**
   - Истёкший токен
   - Уже верифицированный пользователь
   - OAuth пользователь пытается забыть пароль

### Unit тесты

```typescript
// __tests__/lib/tokens.test.ts
describe('Token generation', () => {
  it('should generate unique tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    expect(token1).not.toBe(token2);
    expect(token1).toHaveLength(64);
  });
});

// __tests__/lib/rate-limit.test.ts
describe('Rate limiting', () => {
  it('should block requests within 10 minutes', async () => {
    // ...
  });
});
```

## Deployment Checklist

### Перед деплоем:

- [ ] DNS настроен в Namecheap (за 7 дней!)
- [ ] Домен верифицирован в Resend
- [ ] Тестовое письмо отправлено успешно
- [ ] Google OAuth credentials созданы
- [ ] OAuth consent screen настроен
- [ ] Все секреты добавлены в GitHub Actions
- [ ] `.env.production` файл готов на сервере
- [ ] Миграция БД протестирована на staging
- [ ] E2E тесты проходят
- [ ] Rollback миграция подготовлена

### Во время деплоя:

1. **Backup БД:** `npm run db:backup`
2. **Применить миграцию:** `npm run prisma:migrate`
3. **Проверить таблицы:** Убедиться, что все создано
4. **Deploy code:** Push to main → GitHub Actions
5. **Smoke test:** Попробовать регистрацию/вход

### После деплоя:

- [ ] Проверить отправку email (зарегистрировать тестового пользователя)
- [ ] Проверить Google OAuth
- [ ] Проверить админскую регистрацию (не сломана)
- [ ] Мониторить логи на ошибки
- [ ] Проверить метрики Resend (сколько писем отправлено)

## Мониторинг

### Что отслеживать:

1. **Email метрики (Resend dashboard):**
   - Количество отправленных писем в день
   - Доставляемость (delivery rate)
   - Bounces (отклонённые письма)
   - Complaints (жалобы на спам)

2. **Database метрики:**
   - Количество неверифицированных пользователей
   - Количество истёкших токенов
   - Rate limit срабатывания

3. **Application логи:**
   - Ошибки отправки email
   - Failed login attempts
   - Rate limit violations

### Запросы для мониторинга:

```sql
-- Неверифицированные пользователи старше 7 дней
SELECT COUNT(*) FROM "User"
WHERE "emailVerified" IS NULL
  AND "registrationMethod" = 'EMAIL_PASSWORD'
  AND "createdAt" < NOW() - INTERVAL '7 days';

-- Email success rate за последние 24 часа
SELECT 
  "status",
  COUNT(*) as count
FROM "EmailLog"
WHERE "sentAt" > NOW() - INTERVAL '24 hours'
GROUP BY "status";

-- Top rate limited emails
SELECT 
  "email",
  COUNT(*) as attempts
FROM "EmailResendLog"
WHERE "sentAt" > NOW() - INTERVAL '1 hour'
GROUP BY "email"
HAVING COUNT(*) > 3
ORDER BY attempts DESC;
```

### Cron jobs

```typescript
// scripts/cleanup-tokens.ts
import { prisma } from '@/lib/prisma';
import { cleanupExpiredTokens } from '@/lib/email';

async function main() {
  console.log('Cleaning up expired tokens...');
  await cleanupExpiredTokens();
  console.log('Done!');
}

main();
```

**Запускать ежедневно:**

```bash
# Добавить в crontab или GitHub Actions scheduled workflow
0 0 * * * cd /path/to/app && npm run cleanup-tokens
```

## Будущие улучшения

### Когда подключать Redis:

- Когда traffic вырастет > 1000 users/day
- Rate limiting станет bottleneck
- Нужен distributed rate limiting (несколько серверов)

**Миграция на Redis:**

```typescript
// lib/rate-limit-redis.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkEmailRateLimitRedis(
  email: string,
  limitMinutes: number = 10
): Promise<{ allowed: boolean }> {
  
  const key = `rate_limit:email:${email}`;
  const exists = await redis.get(key);
  
  if (exists) {
    const ttl = await redis.ttl(key);
    return { allowed: false, remainingSeconds: ttl };
  }
  
  // Set key with TTL
  await redis.setex(key, limitMinutes * 60, '1');
  return { allowed: true };
}
```

### Другие будущие фичи:

- Email templates с React Email
- Мультиязычные email (i18n)
- Two-factor authentication (2FA)
- Social login (Facebook, Apple, etc.)
- Email change flow (с верификацией нового email)
- Account merge (объединение email + OAuth аккаунтов)
- Более сложный password policy (pwned passwords check)
- Captcha для регистрации (если много спама)

## Резюме изменений

### Критические отличия от оригинального плана:

1. ✅ **НЕ используем NextAuth Email Provider** - только custom verification
2. ✅ **Enum RegistrationMethod** - различение способов создания
3. ✅ **Защита от user enumeration** - generic ответы
4. ✅ **Rate limit 10 минут** (не 3)
5. ✅ **Rollback миграции** - подготовлены
6. ✅ **Forgot password flow** - добавлен
7. ✅ **Edge cases** - все обработаны
8. ✅ **Email логирование** - для мониторинга
9. ✅ **Security improvements** - password strength, token security
10. ✅ **Deployment checklist** - пошаговый план

### Файлы для создания/изменения:

**БД:**
- `prisma/schema.prisma` - обновить
- `prisma/migrations/XXXXXX_auth_upgrade/migration.sql` - forward
- `prisma/migrations/XXXXXX_auth_upgrade/rollback.sql` - rollback

**Backend:**
- `lib/auth.ts` - обновить (Google, callbacks)
- `lib/email.ts` - создать
- `lib/tokens.ts` - создать
- `lib/rate-limit.ts` - создать
- `lib/validation.ts` - создать

**API Routes:**
- `app/api/auth/register/route.ts` - обновить (админский)
- `app/api/auth/register-public/route.ts` - создать
- `app/api/auth/verify-email/route.ts` - создать
- `app/api/auth/resend-verification/route.ts` - создать
- `app/api/auth/forgot-password/route.ts` - создать
- `app/api/auth/reset-password/route.ts` - создать

**Frontend:**
- `app/auth/register/page.tsx` - обновить
- `app/auth/login/page.tsx` - обновить
- `app/auth/forgot-password/page.tsx` - создать
- `app/auth/reset-password/page.tsx` - создать
- `components/auth/ResendVerificationEmail.tsx` - создать
- `components/auth/PasswordStrength.tsx` - создать (опционально)

**Middleware:**
- `middleware.ts` - обновить

**Скрипты:**
- `scripts/cleanup-tokens.ts` - создать

**Tests:**
- `e2e/tests/auth/public-registration.spec.ts` - создать
- `e2e/tests/auth/google-oauth.spec.ts` - создать
- `e2e/tests/auth/forgot-password.spec.ts` - создать
- `e2e/tests/auth/rate-limiting.spec.ts` - создать

**Конфиг:**
- `.env.example` - обновить
- `package.json` - добавить `resend`
