# Authentication Troubleshooting Guide

## Email не отправляются

### Симптомы
Пользователи не получают verification или password reset emails.

### Диагностика

```sql
-- Проверить логи отправки
SELECT * FROM "EmailLog" 
WHERE "status" = 'FAILED' 
ORDER BY "sentAt" DESC 
LIMIT 10;

-- Проверить rate limiting
SELECT email, COUNT(*) 
FROM "EmailResendLog"
WHERE "sentAt" > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) > 5;
```

### Решения

1. **Проверить API ключ**
   ```bash
   # В production env
   echo $RESEND_API_KEY
   ```

2. **Проверить DNS в Resend**
   - Зайти в Resend dashboard
   - Domains → conozco.net
   - Проверить статус SPF/DKIM/DMARC

3. **Проверить лимиты плана**
   - Free plan: 100 emails/day
   - Если превышен - апгрейд плана

4. **Проверить bounced emails**
   ```sql
   SELECT * FROM "User" WHERE "emailBounced" = true;
   ```

## Rate Limiting не работает

### Симптомы
Пользователи могут делать неограниченное количество запросов.

### Диагностика

```sql
-- Проверить записи
SELECT action, COUNT(*) as count
FROM "RateLimitLog"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY action;

-- Проверить IP addresses
SELECT "ipAddress", COUNT(*) 
FROM "RateLimitLog"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY "ipAddress"
ORDER BY COUNT(*) DESC;
```

### Решения

1. **Проверить IP extraction**
   ```typescript
   // В route handler добавить логирование
   console.log('Client IP:', getClientIp(request));
   ```

2. **Проверить индексы**
   ```sql
   -- Должен быть composite index
   \d "RateLimitLog"
   ```

3. **Проверить transaction isolation**
   - Rate limiting использует transactions
   - Проверить что БД поддерживает

## OAuth не работает

### Симптомы
Error при попытке войти через Google.

### Диагностика

```typescript
// В lib/auth.ts добавить logging
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID?.slice(0, 10) + '...');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
```

### Решения

1. **Проверить redirect URIs**
   - Google Cloud Console → APIs & Services → Credentials
   - Authorized redirect URIs должен включать:
     ```
     https://conozco.net/api/auth/callback/google
     ```

2. **Проверить OAuth Consent Screen**
   - User Type: External
   - Publishing status: In production (или Testing)
   - Test users добавлены (для Testing mode)

3. **Проверить PrismaAdapter**
   ```typescript
   // lib/auth.ts
   adapter: PrismaAdapter(prisma), // Должен быть
   ```

## Пользователи не могут войти после верификации

### Симптомы
"Invalid credentials" после верификации email.

### Диагностика

```sql
SELECT 
  id, 
  email, 
  "emailVerified", 
  "registrationMethod", 
  password IS NOT NULL as has_password
FROM "User"
WHERE email = 'user@example.com';
```

### Решения

1. **Проверить emailVerified установлен**
   ```sql
   UPDATE "User" 
   SET "emailVerified" = NOW() 
   WHERE email = 'user@example.com';
   ```

2. **Проверить audit logs**
   ```sql
   SELECT * FROM "AuditLog"
   WHERE "userId" = (SELECT id FROM "User" WHERE email = 'user@example.com')
   ORDER BY "createdAt" DESC
   LIMIT 10;
   ```

3. **Очистить browser cache**
   - Chrome: Ctrl+Shift+Delete
   - Clear cookies для домена

## Token invalidation не работает

### Симптомы
Пользователи могут использовать старые JWT после смены пароля.

### Диагностика

```sql
SELECT 
  id, 
  email, 
  "passwordChangedAt",
  "updatedAt"
FROM "User"
WHERE email = 'user@example.com';
```

### Решения

1. **Проверить passwordChangedAt устанавливается**
   ```typescript
   // В reset-password route
   await prisma.user.update({
     where: { id: user.id },
     data: {
       password: hashedPassword,
       passwordChangedAt: new Date(), // ВАЖНО
     },
   });
   ```

2. **Проверить JWT callback**
   ```typescript
   // lib/auth.ts
   async jwt({ token, trigger }) {
     if (trigger === 'update') {
       // Проверка passwordChangedAt
     }
   }
   ```

## NEXTAUTH_SECRET warning

### Симптомы
Warning в консоли: "No secret provided".

### Решение

```bash
# Сгенерировать секрет
openssl rand -base64 32

# Добавить в .env
echo "NEXTAUTH_SECRET=<generated-value>" >> .env.local

# В production
# GitHub → Settings → Secrets → New secret
# Name: NEXTAUTH_SECRET
# Value: <generated-value>
```

## Database migration failed

### Симптомы
Ошибка при применении миграции.

### Решения

1. **Backup БД ПЕРЕД миграцией**
   ```bash
   npm run db:backup
   ```

2. **Проверить подключение**
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

3. **Rollback если нужно**
   ```bash
   # Применить rollback migration
   psql $DATABASE_URL -f prisma/migrations/XXXXXX_auth_upgrade/rollback.sql
   ```

## Performance issues

### Симптомы
Медленные запросы при аутентификации.

### Диагностика

```sql
-- Slow query log
SELECT * FROM pg_stat_statements
WHERE query LIKE '%User%'
ORDER BY total_exec_time DESC
LIMIT 10;

-- Missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('User', 'RateLimitLog', 'EmailLog');
```

### Решения

1. **Проверить indexes созданы**
   ```sql
   CREATE INDEX IF NOT EXISTS "User_emailVerified_idx" 
   ON "User"("emailVerified");
   
   CREATE INDEX IF NOT EXISTS "RateLimitLog_composite_idx"
   ON "RateLimitLog"("action", "email", "ipAddress", "createdAt");
   ```

2. **Анализировать query plans**
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM "User" WHERE email = 'test@example.com';
   ```

3. **Cleanup старых данных**
   ```bash
   npm run cleanup:auth
   ```

## Common Errors

### Error: "CSRF token mismatch"

**Причина:** NextAuth CSRF protection failed

**Решение:**
- Проверить что NEXTAUTH_URL правильный
- Проверить cookies не блокируются
- Проверить SameSite settings

### Error: "Email already exists"

**Причина:** Duplicate registration (только admin route)

**Решение:**
- Это нормально для public route (generic response)
- Для admin route - user уже существует

### Error: "Database connection failed"

**Причина:** DATABASE_URL неправильный

**Решение:**
```bash
# Проверить connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```
