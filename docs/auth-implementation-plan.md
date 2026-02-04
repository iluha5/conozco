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

**Важно:** для корректной работы OAuth требуется `PrismaAdapter`, иначе NextAuth не создаст `User/Account`.

**Решение:**
- Использовать `PrismaAdapter(prisma)` в `authOptions`
- Явно зафиксировать политику linking:
  - **Безопасный вариант:** запретить автоматический link по email, разрешать link только из профиля после входа
  - **Компромисс:** разрешать link только если `email_verified=true` от провайдера

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
  registrationMethod  RegistrationMethod  @default(EMAIL_PASSWORD)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  // ... остальные существующие поля
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
  status      String
  provider    String
  messageId   String?
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

### 6. Forward Migration

```sql
-- 1. Создать enums
CREATE TYPE "RegistrationMethod" AS ENUM ('ADMIN_CREATED', 'EMAIL_PASSWORD', 'OAUTH_GOOGLE');
CREATE TYPE "EmailType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'EMAIL_CHANGED', 'WELCOME');
CREATE TYPE "RateLimitAction" AS ENUM ('REGISTER', 'RESEND', 'FORGOT', 'LOGIN');

-- 2. Добавить новые поля в User
ALTER TABLE "User" 
  ADD COLUMN "emailVerified" TIMESTAMP(3),
  ADD COLUMN "registrationMethod" "RegistrationMethod" NOT NULL DEFAULT 'EMAIL_PASSWORD';

-- 3. Обновить существующих пользователей (считаем их созданными админом)
UPDATE "User" 
SET 
  "emailVerified" = "createdAt",
  "registrationMethod" = 'ADMIN_CREATED'
WHERE "emailVerified" IS NULL;

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

CREATE INDEX "RateLimitLog_action_createdAt_idx" ON "RateLimitLog"("action", "createdAt");
CREATE INDEX "RateLimitLog_email_createdAt_idx" ON "RateLimitLog"("email", "createdAt");
CREATE INDEX "RateLimitLog_ipAddress_createdAt_idx" ON "RateLimitLog"("ipAddress", "createdAt");

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
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

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
  DROP COLUMN IF EXISTS "registrationMethod";

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

### 2. Rate Limiting (10 минут)

**Реализация через БД (email + IP + action):**

```typescript
// lib/rate-limit.ts
export async function checkRateLimit(params: {
  email?: string;
  ipAddress?: string;
  action: 'register' | 'resend' | 'forgot' | 'login';
  limitMinutes?: number;
  maxAttempts?: number;
}): Promise<{ allowed: boolean; remainingSeconds?: number }> {
  const limitMinutes = params.limitMinutes ?? 10;
  const maxAttempts = params.maxAttempts ?? 5;
  const since = new Date(Date.now() - limitMinutes * 60 * 1000);

  const attempts = await prisma.rateLimitLog.count({
    where: {
      action: params.action.toUpperCase() as any,
      createdAt: { gte: since },
      ...(params.email ? { email: params.email } : {}),
      ...(params.ipAddress ? { ipAddress: params.ipAddress } : {})
    }
  });

  if (attempts >= maxAttempts) {
    const remainingSeconds = Math.ceil(
      (since.getTime() + limitMinutes * 60 * 1000 - Date.now()) / 1000
    );
    return { allowed: false, remainingSeconds };
  }

  return { allowed: true };
}

export async function logRateLimit(params: {
  email?: string;
  ipAddress?: string;
  action: 'register' | 'resend' | 'forgot' | 'login';
}) {
  await prisma.rateLimitLog.create({
    data: {
      email: params.email ?? null,
      ipAddress: params.ipAddress ?? null,
      action: params.action.toUpperCase() as any
    }
  });
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

### 4.1 Нормализация email

- Всегда приводить email к `lowercase` и `trim()` до записи/поиска
- Опционально: использовать `citext` в PostgreSQL для case-insensitive уникальности

### 5. Token Security

**Email Verification Token:**
- Длина: минимум 32 байта (256 бит)
- Формат: random hex string
- TTL: 24 часа
- Одноразовый: удаляется после использования
- **Хранение: только хеш токена (не raw)**
- **То же правило для PasswordResetToken**

```typescript
// lib/tokens.ts
import crypto from 'crypto';

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex'); // 64 символа
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createEmailVerificationToken(email: string) {
  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
  
  await prisma.emailVerificationToken.deleteMany({ where: { email } });
  
  await prisma.emailVerificationToken.create({
    data: { email, token: tokenHash, expires }
  });
  
  return token;
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashToken(token);
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: tokenHash }
  });
  
  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' };
  }
  
  if (verificationToken.expires < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } });
    return { valid: false, error: 'Token expired' };
  }
  
  return { valid: true, email: verificationToken.email };
}
```

## Изменения в коде аутентификации

### 1. lib/auth.ts

```typescript
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, accounts: true },
        });

        if (!user) {
          throw new Error('Invalid credentials');
        }

        // Проверка 1: Если пользователь OAuth - отклонить
        const hasOAuthAccount = user.accounts.some(acc => acc.provider === 'google');
        if (hasOAuthAccount) {
          throw new Error('Invalid credentials');
        }

        // Проверка 2: Email должен быть верифицирован
        if (!user.emailVerified) {
          throw new Error('Invalid credentials');
        }

        // Проверка 3: Пароль должен существовать
        if (!user.password) {
          throw new Error('Invalid credentials');
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
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;
        
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true }
        });
        
        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          });
          return true;
        }
        
        return true;
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.registrationMethod = user.registrationMethod;
      }
      
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
        session.user.emailVerified = token.emailVerified as boolean | null;
        session.user.registrationMethod = token.registrationMethod as string;
      }
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 2. lib/email.ts

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

export async function cleanupExpiredTokens() {
  const now = new Date();
  
  await prisma.emailVerificationToken.deleteMany({
    where: { expires: { lt: now } }
  });
  
  await prisma.passwordResetToken.deleteMany({
    where: { expires: { lt: now } }
  });
  
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await prisma.emailResendLog.deleteMany({
    where: { sentAt: { lt: ninetyDaysAgo } }
  });

  await prisma.rateLimitLog.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } }
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
import { checkRateLimit, logRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const body = await request.json();
    const validation = registrationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email, password, name } = validation.data;
    const normalizedEmail = email.trim().toLowerCase();

    const rateLimit = await checkRateLimit({
      email: normalizedEmail,
      ipAddress: ip,
      action: 'register',
      maxAttempts: 5,
      limitMinutes: 60
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (existingUser) {
      // НЕ раскрывать, что пользователь существует
      return NextResponse.json(
        { message: 'Please check your email to verify your account.' },
        { status: 201 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const defaultRole = await prisma.userRole.findUnique({
      where: { code: 'USER' }
    });
    
    if (!defaultRole) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }
    
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name || null,
        roleId: defaultRole.id,
        registrationMethod: 'EMAIL_PASSWORD',
        emailVerified: null,
      }
    });
    
    const token = await createEmailVerificationToken(normalizedEmail);
    const emailResult = await sendVerificationEmail(normalizedEmail, token);

    await logRateLimit({ email: normalizedEmail, ipAddress: ip, action: 'register' });
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }
    
    return NextResponse.json(
      { message: 'Please check your email to verify your account.' },
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
    
    const verification = await verifyEmailToken(token);
    
    if (!verification.valid) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${verification.error === 'Token expired' ? 'token_expired' : 'invalid_token'}`,
          request.url
        )
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: verification.email }
    });
    
    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=user_not_found', request.url)
      );
    }
    
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL('/auth/login?message=already_verified', request.url)
      );
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() }
    });
    
    await prisma.emailVerificationToken.delete({
      where: { token }
    });
    
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
import { checkRateLimit, logRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const genericResponse = {
      message: 'If this email is registered and not verified, you will receive a verification email.'
    };

    const rateLimit = await checkRateLimit({
      email: normalizedEmail,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      action: 'resend',
      maxAttempts: 3,
      limitMinutes: 10
    });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(rateLimit.remainingSeconds! / 60)} minutes before requesting another verification email.` 
        },
        { status: 429 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });
    
    if (!user || user.emailVerified) {
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    const token = await createEmailVerificationToken(normalizedEmail);
    const emailResult = await sendVerificationEmail(normalizedEmail, token);
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip');
    await logRateLimit({ email: normalizedEmail, ipAddress: ip || undefined, action: 'resend' });
    
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

#### app/api/auth/forgot-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSecureToken, hashToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit, logRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.trim().toLowerCase();
    const genericResponse = {
      message: 'If this email is registered, you will receive a password reset link.'
    };

    const rateLimit = await checkRateLimit({
      email: normalizedEmail,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      action: 'forgot',
      maxAttempts: 3,
      limitMinutes: 10
    });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Please wait ${Math.ceil(rateLimit.remainingSeconds! / 60)} minutes before requesting another password reset.` 
        },
        { status: 429 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { accounts: true }
    });
    
    if (!user) {
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    const hasOAuthAccount = user.accounts.some(acc => acc.provider === 'google');
    if (hasOAuthAccount) {
      return NextResponse.json(genericResponse, { status: 200 });
    }
    
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });
    
    await prisma.passwordResetToken.create({
      data: { email: normalizedEmail, token: tokenHash, expires }
    });
    
    const emailResult = await sendPasswordResetEmail(normalizedEmail, token);
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip');
    await logRateLimit({ email: normalizedEmail, ipAddress: ip || undefined, action: 'forgot' });
    
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

#### app/api/auth/reset-password/route.ts

```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { passwordSchema } from '@/lib/validation';
import { hashToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }
    
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash }
    });
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { token: tokenHash }
      });
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 400 }
      );
    }
    
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Token has already been used' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { token: tokenHash },
        data: { used: true, usedAt: new Date() }
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
// Добавить при создании пользователя:
const user = await prisma.user.create({
  data: {
    email,
    password: hashedPassword,
    name: name || null,
    roleId: defaultRole.id,
    emailVerified: new Date(), // Админ создаёт верифицированных пользователей
    registrationMethod: 'ADMIN_CREATED',
  },
  // ... остальное
});
```

### 4. Middleware

**Важно:** middleware работает в Edge runtime — не использовать Prisma/БД.

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: async ({ token }) => {
        if (!token) {
          return false;
        }

        if (
          token.registrationMethod === 'EMAIL_PASSWORD' &&
          !token.emailVerified
        ) {
          return false;
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

## UI Components

### components/auth/ResendVerificationEmail.tsx

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
        const match = data.error.match(/(\d+) minutes/);
        if (match) {
          setRemainingTime(parseInt(match[1]) * 60);
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

## Зависимости

```bash
npm install resend
npm install @next-auth/prisma-adapter
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

- [ ] Проверить отправку email
- [ ] Проверить Google OAuth
- [ ] Проверить админскую регистрацию
- [ ] Мониторить логи
- [ ] Проверить метрики Resend

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
0 0 * * * cd /path/to/app && npm run cleanup-tokens
```

## Будущие улучшения

### Когда подключать Redis:
- Traffic > 1000 users/day
- Rate limiting стал bottleneck
- Нужен distributed rate limiting

### Другие фичи:
- Email templates с React Email
- Мультиязычные email (i18n)
- Two-factor authentication (2FA)
- Social login (Facebook, Apple)
- Email change flow
- Account merge
- Pwned passwords check
- Captcha для регистрации

## Файлы для создания/изменения

### База данных:
- `prisma/schema.prisma` - обновить
- `prisma/migrations/XXXXXX_auth_upgrade/migration.sql` - forward
- `prisma/migrations/XXXXXX_auth_upgrade/rollback.sql` - rollback

### Backend (lib):
- `lib/auth.ts` - обновить
- `lib/email.ts` - создать
- `lib/tokens.ts` - создать
- `lib/rate-limit.ts` - создать
- `lib/validation.ts` - создать

### API Routes:
- `app/api/auth/register/route.ts` - обновить
- `app/api/auth/register-public/route.ts` - создать
- `app/api/auth/verify-email/route.ts` - создать
- `app/api/auth/resend-verification/route.ts` - создать
- `app/api/auth/forgot-password/route.ts` - создать
- `app/api/auth/reset-password/route.ts` - создать

### Frontend:
- `app/auth/register/page.tsx` - обновить
- `app/auth/login/page.tsx` - обновить
- `app/auth/forgot-password/page.tsx` - создать
- `app/auth/reset-password/page.tsx` - создать
- `components/auth/ResendVerificationEmail.tsx` - создать

### Middleware:
- `middleware.ts` - обновить

### Scripts:
- `scripts/cleanup-tokens.ts` - создать

### Tests:
- `e2e/tests/auth/public-registration.spec.ts` - создать
- `e2e/tests/auth/google-oauth.spec.ts` - создать
- `e2e/tests/auth/forgot-password.spec.ts` - создать
- `e2e/tests/auth/rate-limiting.spec.ts` - создать

### Config:
- `.env.example` - обновить
- `package.json` - добавить `resend`

### CI/CD:
- `.github/workflows/deploy.yml` - добавить новые секреты в env и envs
- `docker-compose.prod.yml` - добавить новые переменные окружения в app.environment
