# Quick Start Guide - Authentication Implementation

## ⚡ Быстрый старт (для опытных разработчиков)

Этот документ содержит минимальную информацию для быстрого старта. Подробности см. в [auth-implementation-plan.md](auth-implementation-plan.md).

---

## 1. Подготовка (перед началом)

### 1.1 Установить зависимости

```bash
npm install resend @next-auth/prisma-adapter
```

### 1.2 Настроить DNS (ЗА 2 НЕДЕЛИ!)

В Namecheap для домена conozco.net добавить:

```
TXT @ v=spf1 include:_spf.resend.com ~all
TXT _dmarc v=DMARC1; p=none; rua=mailto:admin@conozco.net
```

DKIM записи получить из Resend dashboard после добавления домена.

### 1.3 Создать Google OAuth App

1. https://console.cloud.google.com
2. Create Project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Redirect URIs: `https://conozco.net/api/auth/callback/google`
5. OAuth Consent Screen: External, add test users

### 1.4 GitHub Secrets

Добавить в Repository → Settings → Secrets:

```
NEXTAUTH_SECRET (generate: openssl rand -base64 32)
RESEND_API_KEY
EMAIL_FROM=noreply@conozco.net
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

---

## 2. Database Migration

### 2.1 Backup

```bash
npm run db:backup
```

### 2.2 Применить миграцию

```sql
-- Скопировать SQL из auth-implementation-plan.md секция "Forward Migration"
-- Или создать через Prisma
```

### 2.3 Проверить

```sql
-- Проверить новые таблицы
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'EmailVerificationToken', 
  'PasswordResetToken', 
  'RateLimitLog',
  'EmailLog',
  'AuditLog'
);

-- Проверить новые поля в User
\d "User"
```

---

## 3. Backend Files

Создать/обновить следующие файлы (полный код в main plan):

### Создать:
- `lib/email.ts` - Resend integration
- `lib/email-utils.ts` - Email normalization
- `lib/tokens.ts` - Token generation/verification
- `lib/rate-limit.ts` - Atomic rate limiting
- `lib/validation.ts` - Zod schemas
- `lib/audit.ts` - Audit logging
- `lib/ip-utils.ts` - Safe IP extraction

### Обновить:
- `lib/auth.ts` - Добавить OAuth, audit, password invalidation
- `types/next-auth.d.ts` - Новые поля

### API Routes (создать):
- `app/api/auth/register-public/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/resend-verification/route.ts`
- `app/api/auth/resend-verification-current/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/webhooks/resend/route.ts`

### Обновить:
- `app/api/auth/register/route.ts` - Админская регистрация
- `middleware.ts` - Email verification check

---

## 4. Frontend (минимум)

### Обязательно создать:
- `app/auth/register/page.tsx` - Public registration
- `app/auth/verify-required/page.tsx` - Для неверифицированных
- `app/auth/forgot-password/page.tsx`
- `app/auth/reset-password/page.tsx`
- `components/auth/GoogleSignInButton.tsx`

### Обновить:
- `app/auth/login/page.tsx` - Добавить Google button

---

## 5. Environment Variables

### .env.local (development):

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/conozco

NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=<generate-with-openssl>

RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@conozco.net

GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

ADMIN_REGISTRATION_PASSWORD=<your-admin-password>
```

### Production:
Same, но `NEXTAUTH_URL=https://conozco.net`

---

## 6. CI/CD Update

### .github/workflows/deploy.yml

Добавить в `env:` и `envs:`:
```yaml
NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
```

### docker-compose.prod.yml

Добавить в `app.environment`:
```yaml
RESEND_API_KEY: ${RESEND_API_KEY}
EMAIL_FROM: ${EMAIL_FROM}
GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```

---

## 7. Deploy

```bash
# 1. Commit changes
git add .
git commit -m "feat: add email verification and OAuth authentication"

# 2. Push to main (автодеплой)
git push origin main

# 3. Monitor deployment
# GitHub Actions → Watch deploy job
```

---

## 8. Post-Deploy Checklist

### Smoke Tests (5 мин):
- [ ] Registration работает
- [ ] Email приходит (check spam!)
- [ ] Verification link работает
- [ ] Google OAuth работает
- [ ] Forgot password работает
- [ ] Rate limiting работает (try 6 registrations)

### Monitoring (30 мин):
- [ ] Проверить application logs
- [ ] Resend dashboard - deliverability
- [ ] Database - audit logs
- [ ] Rate limit logs

### Cleanup Cron (настроить):
```bash
# Add to crontab
0 2 * * * cd /path/to/app && npm run cleanup:auth >> /var/log/cleanup.log 2>&1
```

---

## 🆘 Quick Troubleshooting

### Email не приходит?
```sql
SELECT * FROM "EmailLog" WHERE status = 'FAILED' ORDER BY "sentAt" DESC LIMIT 5;
```
→ Проверить RESEND_API_KEY, DNS records

### OAuth error?
→ Проверить redirect URIs в Google Console
→ Проверить NEXTAUTH_URL

### Rate limiting не работает?
```sql
SELECT COUNT(*) FROM "RateLimitLog" WHERE "createdAt" > NOW() - INTERVAL '1 hour';
```
→ Проверить IP extraction

### "Invalid credentials"?
```sql
SELECT email, "emailVerified", "registrationMethod" FROM "User" WHERE email = 'user@example.com';
```
→ Проверить emailVerified установлен

---

## 📚 Полная документация

- **[Основной план](auth-implementation-plan.md)** - Детальный implementation plan с кодом
- **[E2E Tests](auth-e2e-tests.md)** - Примеры тестов
- **[Troubleshooting](auth-troubleshooting.md)** - Решение проблем

---

## 🚨 Критические моменты

1. ✅ **ВСЕГДА backup БД** перед миграцией
2. ✅ **DNS за 2 недели** (не 7 дней)
3. ✅ **Нет fallback для secrets** в production
4. ✅ **Test на staging** перед production
5. ✅ **Monitor 48 часов** после деплоя

---

**Estimated time: 6-8 дней для одного разработчика**

**Questions?** См. [troubleshooting guide](auth-troubleshooting.md) или спросите в команде.
