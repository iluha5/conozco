# Аудит готовности к Production: ветка upd-auth-providers

## Обзор изменений

**Ветка:** `upd-auth-providers`  
**Коммитов от main:** 12 коммитов  
**Файлов изменено:** 37 файлов (+8884 строк, -49 строк)  
**Последние изменения:** 2 минуты назад (OAuth account linking fix)

### Ключевые функции

1. Email + Password регистрация с верификацией email
2. Google OAuth authentication
3. Password reset функциональность
4. Rate limiting для защиты от abuse
5. Audit logging для security events
6. Email отправка через Resend

### Измененные компоненты

**Backend:**

- `[lib/auth.ts](lib/auth.ts)` - NextAuth конфигурация с OAuth и credentials
- `[lib/tokens.ts](lib/tokens.ts)` - Генерация и валидация secure tokens
- `[lib/email.ts](lib/email.ts)` - Интеграция с Resend API
- `[lib/rate-limit.ts](lib/rate-limit.ts)` - Atomic rate limiting
- `[lib/validation.ts](lib/validation.ts)` - Email/password validation
- `[lib/audit.ts](lib/audit.ts)` - Security audit logging
- `[lib/ip-utils.ts](lib/ip-utils.ts)` - IP extraction для rate limiting

**API Routes (новые):**

- `[app/api/auth/register-public/route.ts](app/api/auth/register-public/route.ts)`
- `[app/api/auth/verify-email/route.ts](app/api/auth/verify-email/route.ts)`
- `[app/api/auth/resend-verification/route.ts](app/api/auth/resend-verification/route.ts)`
- `[app/api/auth/forgot-password/route.ts](app/api/auth/forgot-password/route.ts)`
- `[app/api/auth/reset-password/route.ts](app/api/auth/reset-password/route.ts)`

**Frontend (новые страницы):**

- `[app/auth/register-public/page.tsx](app/auth/register-public/page.tsx)`
- `[app/auth/verify-email/page.tsx](app/auth/verify-email/page.tsx)`
- `[app/auth/forgot-password/page.tsx](app/auth/forgot-password/page.tsx)`
- `[app/auth/reset-password/page.tsx](app/auth/reset-password/page.tsx)`
- `[app/auth/error/page.tsx](app/auth/error/page.tsx)`
- `[components/auth/GoogleSignInButton.tsx](components/auth/GoogleSignInButton.tsx)`

**Database Migrations:**

1. `20260207182330_add_auth_system` - Основная auth система (5 новых таблиц, 3 enum)
2. `20260207183600_add_password_reset_token` - Password reset функциональность
3. `20260209214837_add_user_image_field` - OAuth avatar support

**Scripts:**

- `[scripts/update-existing-users.ts](scripts/update-existing-users.ts)` - Миграция существующих пользователей
- `[scripts/cleanup-auth-tokens.ts](scripts/cleanup-auth-tokens.ts)` - Очистка expired tokens (для cron)

**Infrastructure:**

- `[.github/workflows/deploy.yml](.github/workflows/deploy.yml)` - Добавлены новые env переменные
- `[docker-compose.prod.yml](docker-compose.prod.yml)` - Добавлены Resend и Google OAuth переменные

**Dependencies:**

- `resend@6.9.1` - Email service
- `@next-auth/prisma-adapter@1.0.7` - OAuth database adapter

---

## Готовность к деплою

### ✅ Готово и протестировано

1. **Database Schema**
  - Миграции корректно структурированы
  - Используют idempotent операции (ADD COLUMN IF NOT EXISTS где нужно)
  - Индексы созданы для performance
  - Foreign keys с CASCADE DELETE
2. **Backend Code**
  - NextAuth правильно сконфигурирован
  - OAuth account linking исправлен (последний коммит)
  - Rate limiting реализован атомарно
  - Password hashing с bcrypt
  - Secure token generation (crypto.randomBytes)
  - Audit logging для всех критических событий
3. **Frontend**
  - Все auth страницы реализованы
  - React Strict Mode issues исправлены (useRef для предотвращения double-invocation)
  - Password strength validation в реальном времени
  - User-friendly error messages
4. **CI/CD**
  - GitHub Actions workflow обновлен
  - Все новые environment variables добавлены в envs
  - Explicit export команды для docker-compose
5. **Documentation**
  - Подробный implementation plan (3917 строк)
  - Quick start guide
  - Troubleshooting guide
  - E2E test examples
6. **E2E Tests**
  - Auth тесты существуют: login, logout, register, route-protection
  - Fixtures и helpers готовы
7. **Local Testing**
  - Все сценарии протестированы на localhost
  - OAuth linking работает корректно
  - Email verification работает
  - Password reset работает

---

## ⚠️ Критические риски и проблемы

### БЛОКЕРЫ (должны быть устранены перед деплоем)

1. **GitHub Secrets не проверены**
  - НЕИЗВЕСТНО: настроены ли все secrets в GitHub?
  - Требуется: `NEXTAUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - **Действие:** Проверить Repository → Settings → Secrets and variables → Actions
2. **Production Environment Variables**
  - `NEXTAUTH_URL` hardcoded в docker-compose.prod.yml как `https://conozco.net`
  - `NEXTAUTH_SECRET` должен быть уникальным для production (не переиспользовать dev)
  - **Действие:** Сгенерировать новый NEXTAUTH_SECRET: `openssl rand -base64 32`
3. **Database Backup отсутствует**
  - Миграции изменяют структуру User таблицы (ALTER TABLE)
  - Нет автоматического backup в deployment workflow
  - **Действие:** Manual backup перед деплоем обязателен
4. **Скрипт update-existing-users.ts не запущен на проде**
  - Существующие prod пользователи должны быть обновлены (registrationMethod → ADMIN_CREATED)
  - Скрипт НЕ интегрирован в deployment pipeline
  - **Действие:** Запустить вручную ПОСЛЕ миграции БД
5. **Cleanup cron job не настроен**
  - `scripts/cleanup-auth-tokens.ts` должен запускаться daily
  - НЕТ в production cron configuration
  - **Действие:** Добавить в cron на production server

### СРЕДНИЕ РИСКИ

1. **E2E тесты не в CI/CD**
  - Auth e2e тесты существуют, но не запускаются в GitHub Actions
  - Нет автоматической проверки перед деплоем
  - **Рекомендация:** Добавить Playwright tests в CI
2. **Email sending не протестирован на production**
  - Resend API ключ не проверен в production
  - DNS records (SPF, DKIM) могут быть не настроены
  - **Рекомендация:** Test email отправка сразу после деплоя
3. **Google OAuth redirect URIs**
  - Production callback URL должен быть `https://conozco.net/api/auth/callback/google`
  - НЕИЗВЕСТНО: настроен ли в Google Cloud Console?
  - **Действие:** Проверить Google OAuth App settings
4. **Rate limiting слишком строгий для production?**
  - REGISTER: 3 per hour per IP
  - LOGIN: 5 per 15 min per IP
  - Может блокировать легитимных пользователей за shared IP (corporate networks)
  - **Рекомендация:** Мониторить rate limit hits первую неделю

### НИЗКИЕ РИСКИ

1. **Rollback plan не документирован явно**
  - Миграции можно откатить, но процесс не автоматизирован
    - **Рекомендация:** Подготовить rollback SQL заранее
2. **Monitoring отсутствует**
  - Нет Sentry/logging для auth errors
    - **Рекомендация:** Добавить после деплоя
3. **NEXTAUTH_SECRET валидация в development**
  - Код позволяет запуск без NEXTAUTH_SECRET в dev (fallback warning)
    - В production должно быть strict error
    - **Проверено:** В коде есть строгая проверка для production

---

## 📋 Pre-Deployment Checklist

### 1. GitHub Secrets (КРИТИЧНО)

```bash
# Проверить что все secrets настроены:
# Repository → Settings → Secrets and variables → Actions

NEXTAUTH_SECRET        # Сгенерировать: openssl rand -base64 32
RESEND_API_KEY         # Получить из resend.com dashboard
EMAIL_FROM             # noreply@conozco.net
GOOGLE_CLIENT_ID       # Из Google Cloud Console
GOOGLE_CLIENT_SECRET   # Из Google Cloud Console
DEEPL_API_KEY         # (уже должен быть)
DATABASE_URL          # (уже должен быть)
ADMIN_REGISTRATION_PASSWORD  # (уже должен быть)
```

### 2. External Services

**Resend (Email):**

- Domain conozco.net добавлен в Resend dashboard
- DNS records настроены (SPF, DKIM, DMARC)
- Status: Verified (ждать до 48 часов после добавления DNS)
- Test email отправлен успешно

**Google OAuth:**

- OAuth App создан в Google Cloud Console
- Redirect URI: `https://conozco.net/api/auth/callback/google`
- OAuth Consent Screen: Configured
- Test users: Добавлены (если app не published)

### 3. Database Backup (КРИТИЧНО)

```bash
# На production server ПЕРЕД деплоем
cd /opt/flashcards
./scripts/server-setup/backup-db-prod.sh

# Проверить что backup создан
ls -lh backups/ | tail -1
```

### 4. Merge и Push

```bash
# Локально проверить что все чисто
git status
git log main..upd-auth-providers --oneline

# Merge в main (или create PR)
git checkout main
git merge upd-auth-providers
git push origin main
```

---

## 🚀 Deployment Plan

### Этап 1: Pre-Deployment (на production server)

```bash
# SSH в production
ssh user@conozco.net
cd /opt/flashcards

# 1. Backup database
./scripts/server-setup/backup-db-prod.sh

# 2. Verify backup
ls -lh backups/ | tail -1
```

### Этап 2: Deployment (GitHub Actions автоматически)

```bash
# Push в main триггерит deployment
# GitHub Actions:
# - Build Docker image
# - Push to registry
# - SSH в server
# - Pull new image
# - Run docker-compose up
# - Migrations apply automatically (prisma migrate deploy в Dockerfile)
```

### Этап 3: Post-Deployment (на production server)

```bash
# SSH в production
ssh user@conozco.net
cd /opt/flashcards

# 1. Проверить что контейнеры запущены
docker ps | grep flashcards

# 2. Проверить логи
docker logs flashcards-app --tail 100

# 3. Проверить миграции применились
docker exec flashcards-app npx prisma migrate status

# 4. КРИТИЧНО: Обновить существующих пользователей
docker exec flashcards-app npx dotenv-cli -e .env.local -- npx tsx scripts/update-existing-users.ts

# 5. Проверить результат
docker exec -i flashcards-db psql -U flashcards -d flashcards -c "SELECT id, email, registrationMethod, emailVerified IS NOT NULL as verified FROM \"User\";"

# 6. Добавить cleanup cron job
# Добавить в /etc/cron.d/flashcards-cleanup:
echo '0 2 * * * root cd /opt/flashcards && docker exec flashcards-app npx dotenv-cli -e .env.local -- npx tsx scripts/cleanup-auth-tokens.ts >> /var/log/flashcards-cleanup.log 2>&1' | sudo tee /etc/cron.d/flashcards-cleanup
```

### Этап 4: Smoke Tests

```bash
# 1. Test homepage loads
curl -I https://conozco.net

# 2. Test auth pages accessible
curl -I https://conozco.net/auth/login
curl -I https://conozco.net/auth/register-public

# 3. Manual tests в браузере:
# - Открыть https://conozco.net/auth/register-public
# - Зарегистрировать тестовый аккаунт
# - Проверить что email verification пришел
# - Войти через Google OAuth
# - Протестировать password reset flow
```

---

## 📊 Post-Deployment Monitoring

### Day 1 Checklist

1. **Email Delivery**
  ```bash
   # Проверить EmailLog
   docker exec -i flashcards-db psql -U flashcards -d flashcards -c "SELECT type, status, COUNT(*) FROM \"EmailLog\" GROUP BY type, status;"
  ```
2. **Rate Limiting**
  ```bash
   # Проверить RateLimitLog на false positives
   docker exec -i flashcards-db psql -U flashcards -d flashcards -c "SELECT action, COUNT(*) FROM \"RateLimitLog\" WHERE \"createdAt\" > NOW() - INTERVAL '24 hours' GROUP BY action;"
  ```
3. **OAuth Registration**
  ```bash
   # Проверить что OAuth регистрации работают
   docker exec -i flashcards-db psql -U flashcards -d flashcards -c "SELECT registrationMethod, COUNT(*) FROM \"User\" GROUP BY registrationMethod;"
  ```
4. **Audit Log**
  ```bash
   # Проверить security events
   docker exec -i flashcards-db psql -U flashcards -d flashcards -c "SELECT action, COUNT(*) FROM \"AuditLog\" WHERE \"createdAt\" > NOW() - INTERVAL '24 hours' GROUP BY action ORDER BY COUNT(*) DESC;"
  ```

### Week 1 Review

- Проверить что нет failed email deliveries
- Проверить что rate limits не блокируют легитимных пользователей
- Проверить что Google OAuth работает стабильно
- Проверить что cleanup cron job запускается

---

## 🔄 Rollback Strategies

### Стратегия отката зависит от типа проблемы

Есть **3 варианта отката**, выбирайте в зависимости от ситуации:

---

### ⚡ Вариант 1: Quick Docker Rollback (РЕКОМЕНДУЕТСЯ для auth deployment)

**Когда использовать:**
- Деплой прошел, но приложение работает некорректно
- Баги в новом коде, проблемы с логикой
- БД миграции совместимы с предыдущей версией

**Преимущества:**
- Быстро: 2-3 минуты
- Простой откат
- Нет потери данных

**Процедура:**

```bash
# 1. SSH в production
ssh user@conozco.net
cd /opt/flashcards

# 2. Найти предыдущий working image
docker images | grep flashcards-app

# Вывод:
# registry.digitalocean.com/conozco-registry/flashcards-app   sha-abc123   2 hours ago  <- BAD
# registry.digitalocean.com/conozco-registry/flashcards-app   sha-def456   1 day ago    <- GOOD

# 3. Записать текущий IMAGE_TAG (на случай если нужно вернуться)
docker inspect flashcarts-app --format='{{.Config.Image}}' > /tmp/bad-image-tag.txt

# 4. Откатиться на предыдущий image
export IMAGE_TAG=sha-def456  # Замените на ваш working commit hash
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"  # Все env переменные
export NEXTAUTH_URL="${NEXTAUTH_URL}"
export RESEND_API_KEY="${RESEND_API_KEY}"
export EMAIL_FROM="${EMAIL_FROM}"
export GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID}"
export GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET}"
export DEEPL_API_KEY="${DEEPL_API_KEY}"
export ADMIN_REGISTRATION_PASSWORD="${ADMIN_REGISTRATION_PASSWORD}"
export DB_PASSWORD="${DB_PASSWORD}"
export DATABASE_URL="${DATABASE_URL}"

docker-compose -f docker-compose.prod.yml up -d

# 5. Проверить что старая версия работает
docker ps | grep flashcards
docker logs flashcards-app --tail 50
curl -I https://conozco.net

# 6. Проверить auth endpoints
curl -I https://conozco.net/auth/login
curl -I https://conozco.net/api/health
```

**Откат миграций (если нужно):**

```bash
# Если новые миграции несовместимы, откатите их:

# 1. Отметить миграции как rolled-back
docker exec flashcards-app npx prisma migrate resolve --rolled-back 20260209214837_add_user_image_field
docker exec flashcards-app npx prisma migrate resolve --rolled-back 20260207183600_add_password_reset_token
docker exec flashcards-app npx prisma migrate resolve --rolled-back 20260207182330_add_auth_system

# 2. Вручную откатить структуру БД
docker exec -i flashcards-db psql -U flashcards -d flashcards << 'EOF'
-- Откат в обратном порядке миграций

-- Удалить таблицы
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "EmailLog" CASCADE;
DROP TABLE IF EXISTS "RateLimitLog" CASCADE;
DROP TABLE IF EXISTS "EmailVerificationToken" CASCADE;

-- Откатить изменения User таблицы
ALTER TABLE "User" DROP COLUMN IF EXISTS "image";
ALTER TABLE "User" DROP COLUMN IF EXISTS "registrationMethod";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailBounced";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordChangedAt";
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- Удалить enum типы
DROP TYPE IF EXISTS "EmailType";
DROP TYPE IF EXISTS "RateLimitAction";
DROP TYPE IF EXISTS "RegistrationMethod";

-- Удалить индексы (если были созданы отдельно)
DROP INDEX IF EXISTS "User_emailVerified_idx";
DROP INDEX IF EXISTS "User_registrationMethod_idx";
EOF

# 3. Проверить что БД в правильном состоянии
docker exec -i flashcards-db psql -U flashcards -d flashcards -c "\d \"User\""
```

---

### 🔄 Вариант 2: Git Revert + Redeploy

**Когда использовать:**
- Хотите чистую git историю
- Планируете потом снова задеплоить этот код
- Не критично время (10-15 минут)

**Преимущества:**
- Чистая git история
- Автоматический redeploy через CI/CD
- Можно легко вернуться (revert revert)

**Процедура:**

```bash
# 1. Локально, найти commit который нужно откатить
git log --oneline main | head -10

# 2. Создать revert commit
git revert <bad-commit-hash>

# Или revert несколько коммитов:
git revert <commit1> <commit2> <commit3>

# 3. Push в main (триггерит автоматический redeploy)
git push origin main

# 4. Мониторить деплой в GitHub Actions
# GitHub → Actions → Deploy to Production

# 5. После деплоя - откатить миграции вручную (см. Вариант 1)
```

**Время отката:** ~10-15 минут (build + deploy)

---

### ⚠️ Вариант 3: Database Restore - ЯДЕРНАЯ ОПЦИЯ

**Когда использовать:**
- Миграции сломали БД безвозвратно
- Потеряны критичные данные
- Невозможно откатить миграции SQL
- **ПОСЛЕДНЯЯ ИНСТАНЦИЯ**

**Предупреждения:**
- ⚠️ Теряются ВСЕ данные созданные ПОСЛЕ backup
- ⚠️ Требует downtime (5-20 минут)
- ⚠️ Необратимая операция

**Процедура:**

```bash
# 1. SSH в production
ssh user@conozco.net
cd /opt/flashcards

# 2. Найти backup созданный ПЕРЕД деплоем
ls -lth /opt/flashcards/backups/ | head -5

# Пример:
# -rw-r--r-- 1 root root  45M Feb  9 14:30 flashcards_2026-02-09_14-30-00.dump  <- ЭТОТ

# 3. КРИТИЧНО: Создать snapshot текущей БД
echo "Creating emergency snapshot..."
docker exec flashcards-db pg_dump -U flashcards -d flashcards \
  --format=custom --compress=9 \
  --file=/tmp/emergency_snapshot.dump

docker cp flashcards-db:/tmp/emergency_snapshot.dump \
  /opt/flashcards/backups/emergency_snapshot_$(date +%Y%m%d_%H%M%S).dump

# 4. Остановить приложение (DOWNTIME НАЧИНАЕТСЯ)
docker-compose -f docker-compose.prod.yml stop app

# 5. Drop и recreate БД
echo "Dropping database..."
docker exec flashcards-db psql -U flashcards -d postgres -c "DROP DATABASE flashcards;"
docker exec flashcards-db psql -U flashcards -d postgres -c "CREATE DATABASE flashcards;"

# 6. Restore из backup
BACKUP_FILE="/opt/flashcards/backups/flashcards_2026-02-09_14-30-00.dump"
docker cp "$BACKUP_FILE" flashcards-db:/tmp/restore.dump

docker exec flashcards-db pg_restore -U flashcards -d flashcards \
  --no-owner --no-acl /tmp/restore.dump

# 7. Откатить Docker image на старую версию
export IMAGE_TAG=sha-<previous-commit>
# + все остальные env переменные

docker-compose -f docker-compose.prod.yml up -d

# 8. Проверить что все работает (DOWNTIME ЗАКАНЧИВАЕТСЯ)
docker logs flashcards-app --tail 100
curl -I https://conozco.net

# 9. Verify database state
docker exec -i flashcards-db psql -U flashcards -d flashcards -c "
SELECT COUNT(*) as user_count FROM \"User\";
SELECT MAX(\"createdAt\") as latest_user FROM \"User\";
"
```

**Время отката:** ~10-20 минут + downtime

---

### 📋 Checklist перед rollback

**Перед тем как откатываться, соберите информацию:**

```bash
# 1. Текущее состояние
echo "=== Current State ===" > /tmp/rollback-info.txt
echo "Date: $(date)" >> /tmp/rollback-info.txt
echo "Current image: $(docker inspect flashcards-app --format='{{.Config.Image}}')" >> /tmp/rollback-info.txt
echo "Git commit: $(cd /opt/flashcards && git rev-parse HEAD)" >> /tmp/rollback-info.txt

# 2. Логи ошибок
echo "" >> /tmp/rollback-info.txt
echo "=== Last 50 app logs ===" >> /tmp/rollback-info.txt
docker logs flashcards-app --tail 50 >> /tmp/rollback-info.txt 2>&1

# 3. Состояние БД
echo "" >> /tmp/rollback-info.txt
echo "=== Database tables ===" >> /tmp/rollback-info.txt
docker exec -i flashcards-db psql -U flashcards -d flashcards -c "
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;" >> /tmp/rollback-info.txt

# 4. Миграции
echo "" >> /tmp/rollback-info.txt
echo "=== Migration status ===" >> /tmp/rollback-info.txt
docker exec flashcards-app npx prisma migrate status >> /tmp/rollback-info.txt 2>&1

# 5. Доступные images
echo "" >> /tmp/rollback-info.txt
echo "=== Available images ===" >> /tmp/rollback-info.txt
docker images | grep flashcards-app >> /tmp/rollback-info.txt

# 6. Сохранить информацию
cat /tmp/rollback-info.txt
```

---

### 🎯 Рекомендация для Auth Deployment

**Сценарий 1: Проблемы обнаружены сразу (в первые 10 минут)**
```
1. Используйте Вариант 1 (Quick Docker Rollback)
2. Откатите миграции SQL командами
3. Время отката: ~5 минут
4. Потеря данных: минимальная (несколько тестовых регистраций)
```

**Сценарий 2: Проблемы обнаружены через несколько часов**
```
1. Оцените сколько пользователей зарегистрировалось
2. Если <10 пользователей → Вариант 3 (Database Restore)
3. Если >10 пользователей → Вариант 1 + ручной фикс данных
```

**Сценарий 3: Критическая проблема безопасности**
```
1. Немедленно: Вариант 1 (откат image)
2. Затем: исправить код локально
3. После фикса: redeploy
```

---

## 🎯 Финальная оценка

### ГОТОВНОСТЬ К ДЕПЛОЮ: 75% ⚠️

**Код и архитектура:** ✅ 95% готовы

- Отличное качество кода
- Правильная архитектура
- Security best practices
- Хорошая документация

**Infrastructure:** ⚠️ 60% готовы

- CI/CD готов
- Docker готов
- **НО:** GitHub Secrets не проверены
- **НО:** Cleanup cron не настроен
- **НО:** E2E tests не в pipeline

**Operational Readiness:** ⚠️ 50%

- **НО:** Нет monitoring/alerting
- **НО:** Post-deployment скрипт не автоматизирован
- **НО:** Rollback план не протестирован

### РЕКОМЕНДАЦИЯ

**🟡 УСЛОВНО ГОТОВ к деплою с обязательными действиями:**

1. ✅ **Можно деплоить ЕСЛИ:**
  - Выполнены все пункты из Pre-Deployment Checklist
  - GitHub Secrets проверены и настроены
  - Database backup сделан
  - Есть время на post-deployment manual actions
  - Деплой делается в нерабочее время (low traffic)
2. ⚠️ **НЕ деплоить ЕСЛИ:**
  - GitHub Secrets не проверены
  - Нет времени на post-deployment monitoring
  - Деплой в пиковое время
3. 🎯 **Улучшения для следующего релиза:**
  - Добавить E2E tests в CI
  - Автоматизировать post-deployment скрипты
  - Добавить Sentry для error tracking
  - Настроить automated rollback
  - Добавить health checks для auth endpoints

### NEXT STEPS

1. **Сегодня:** Проверить GitHub Secrets
2. **Сегодня:** Проверить Google OAuth настройки
3. **Перед деплоем:** Backup БД
4. **После деплоя:** Запустить update-existing-users.ts
5. **После деплоя:** Настроить cleanup cron
6. **День 1:** Мониторить логи и метрики
