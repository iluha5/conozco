# Environment Variables Management

## Обзор

Система управления переменными окружения автоматизирована для production и требует минимальной ручной настройки.

## Архитектура

### Development (Локальная разработка)

- **Файл**: `.env.local` (создается вручную)
- **Источник**: Копируется из `.env.example` и заполняется реальными значениями
- **Загрузка**: Next.js автоматически загружает `.env.local`
- **Git**: Не коммитится (в `.gitignore`)

### Production (Боевой сервер)

- **Файл**: `.env` (генерируется автоматически)
- **Источник**: GitHub Secrets → CI/CD → `.env` на сервере
- **Генерация**: Автоматическая через `.github/workflows/deploy.yml`
- **Git**: Не коммитится (в `.gitignore`)

## Настройка для разработки

### 1. Первоначальная настройка

```bash
# Скопировать пример
cp .env.example .env.local

# Отредактировать файл
nano .env.local
```

### 2. Обязательные переменные для локальной разработки

```bash
# База данных (при использовании docker-compose.yml)
DATABASE_URL=postgresql://flashcards:your_password@localhost:5432/flashcards
DB_PASSWORD=your_password

# NextAuth
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:8000

# Email (опционально для тестирования)
RESEND_API_KEY=re_test_key
EMAIL_FROM=noreply@conozco.net

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# DeepL (опционально)
DEEPL_API_KEY=your-deepl-key

# Admin
ADMIN_REGISTRATION_PASSWORD=test-password
```

### 3. Запуск Prisma Studio

```bash
npm run prisma:studio
```

**Note**: Скрипт `prisma:studio` в `package.json` настроен на использование `.env.local`:
```json
"prisma:studio": "dotenv -e .env.local -- prisma studio"
```

## Настройка Production через GitHub Secrets

### 1. Добавление секретов в GitHub

Перейдите в: `Settings → Secrets and variables → Actions → New repository secret`

Добавьте следующие секреты:

| Secret Name | Описание | Пример |
|------------|----------|--------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `DB_PASSWORD` | Database password | `secure-password-123` |
| `NEXTAUTH_SECRET` | NextAuth encryption key | `<openssl rand -base64 32>` |
| `NEXTAUTH_URL` | Production URL | `https://conozco.net` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender email address | `noreply@conozco.net` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-xxxxx` |
| `DEEPL_API_KEY` | DeepL API key | `xxxxxxx:fx` |
| `ADMIN_REGISTRATION_PASSWORD` | Admin API password | `secure-admin-password` |

### 2. Автоматическая синхронизация

При каждом деплое (push в `main` или `master`):

1. **CI/CD читает** GitHub Secrets
2. **Валидирует** наличие всех обязательных переменных
3. **Генерирует** `/opt/flashcards/.env` на production сервере
4. **Docker Compose** использует этот `.env` файл

### 3. Процесс в CI/CD

```yaml
# .github/workflows/deploy.yml (фрагмент)
- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    # ... остальные секреты
  run: |
    # Валидация
    for var in DATABASE_URL NEXTAUTH_SECRET ...; do
      if [ -z "${!var:-}" ]; then
        echo "ERROR: Missing $var"
        exit 1
      fi
    done
    
    # Генерация .env файла
    cat > /opt/flashcards/.env << ENV_EOF
    DATABASE_URL=${DATABASE_URL}
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    # ... остальные переменные
    ENV_EOF
    
    # Деплой
    docker compose -f docker-compose.prod.yml up -d
```

## Добавление новой переменной

### Шаг 1: Обновить `.env.example`

```bash
# Добавить новую переменную с описанием и примером
NEW_API_KEY=your-api-key-here
```

### Шаг 2: Обновить CI/CD

1. Добавить в **GitHub Secrets** (`Settings → Secrets`)
2. Добавить в `.github/workflows/deploy.yml`:
   - В секцию `env` джобы `deploy`
   - В список валидации переменных
   - В heredoc генерации `.env` файла

```yaml
env:
  NEW_API_KEY: ${{ secrets.NEW_API_KEY }}

# В валидации
for var in DATABASE_URL ... NEW_API_KEY; do

# В генерации .env
cat > /opt/flashcards/.env << ENV_EOF
...
NEW_API_KEY=${NEW_API_KEY}
ENV_EOF
```

### Шаг 3: Добавить в `docker-compose.prod.yml`

```yaml
services:
  app:
    environment:
      - NEW_API_KEY=${NEW_API_KEY}
```

### Шаг 4: Обновить локальный `.env.local`

```bash
echo "NEW_API_KEY=test-value" >> .env.local
```

### Шаг 5: Обновить эту документацию

Добавить описание новой переменной в соответствующий раздел.

## Безопасность

### ✅ DO (Делать)

- ✅ Использовать GitHub Secrets для всех чувствительных данных
- ✅ Генерировать `NEXTAUTH_SECRET` через `openssl rand -base64 32`
- ✅ Использовать разные значения для dev/prod
- ✅ Регулярно ротировать секреты (каждые 3-6 месяцев)
- ✅ Добавлять все `.env*` файлы в `.gitignore`

### ❌ DON'T (Не делать)

- ❌ НЕ коммитить `.env` или `.env.local` файлы
- ❌ НЕ использовать production секреты локально
- ❌ НЕ хранить секреты в коде или комментариях
- ❌ НЕ использовать слабые пароли для `ADMIN_REGISTRATION_PASSWORD`
- ❌ НЕ делиться секретами через незащищенные каналы

## Проверка конфигурации

### Локально (Development)

```bash
# Проверить что .env.local существует
ls -la .env.local

# Проверить обязательные переменные
grep -E '^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL)=' .env.local

# Запустить приложение
npm run dev
```

### Production (через CI/CD)

При деплое CI/CD автоматически:
1. Валидирует наличие всех обязательных переменных
2. Выводит в лог список переменных (со скрытыми значениями)
3. Останавливает деплой при отсутствии критичных переменных

Пример лога:
```
Validating environment variables...
All required environment variables are set
Creating production .env file...
.env file created successfully
Verifying .env file contents (secrets masked)...
DATABASE_URL=***
NEXTAUTH_SECRET=***
NEXTAUTH_URL=***
...
```

## Troubleshooting

### Проблема: "Environment variable not found: DATABASE_URL"

**Причина**: Переменная не установлена в `.env.local` или не загружается

**Решение**:
```bash
# Проверить наличие файла
ls -la .env.local

# Проверить содержимое
cat .env.local | grep DATABASE_URL

# Если файла нет - создать из примера
cp .env.example .env.local
```

### Проблема: Build fails on production with "NEXTAUTH_SECRET is required"

**Причина**: Переменная отсутствует в GitHub Secrets или не прокидывается в CI/CD

**Решение**:
1. Проверить наличие секрета: `Settings → Secrets → NEXTAUTH_SECRET`
2. Проверить что секрет добавлен в `deploy.yml` в секцию `env`
3. Проверить что секрет добавлен в heredoc генерации `.env`

### Проблема: Docker container doesn't see environment variables

**Причина**: Переменные не прокинуты в `docker-compose.prod.yml`

**Решение**:
```yaml
# docker-compose.prod.yml
services:
  app:
    environment:
      - MISSING_VAR=${MISSING_VAR}  # Добавить недостающую переменную
```

## Миграция с ручного .env на автоматический

Если у вас уже есть ручной `.env` файл на production:

```bash
# 1. Сохранить существующий .env для справки
cp /opt/flashcards/.env /opt/flashcards/.env.backup

# 2. Добавить все переменные в GitHub Secrets
# (использовать значения из .env.backup)

# 3. Запустить деплой - новый .env будет сгенерирован автоматически

# 4. Проверить что приложение работает

# 5. Удалить backup
rm /opt/flashcards/.env.backup
```

## Ссылки

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
