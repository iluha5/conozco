# Production Deployment Plan для conozco.net

## Обзор

Подготовка проекта flash-cards к production-деплою на DigitalOcean с настройкой nginx, SSL (Let's Encrypt), CI/CD через GitHub Actions, автоматическими бэкапами и стратегией синхронизации данных.

## Обзор архитектуры

```mermaid
flowchart TB
    subgraph Internet
        User[User Browser]
        GitHub[GitHub Repository]
    end
    
    subgraph DigitalOcean[DigitalOcean Droplet]
        Nginx[Nginx + SSL]
        Cron[Cron: Backups + SSL renewal]
        subgraph Docker[Docker Compose]
            App[Next.js App :8000]
            Postgres[(PostgreSQL :5432)]
        end
        Backups[/backups/]
    end
    
    User -->|HTTPS| Nginx
    Nginx -->|proxy_pass| App
    App --> Postgres
    GitHub -->|SSH Deploy| DigitalOcean
    Cron -->|pg_dump| Backups
    Cron -->|certbot renew| Nginx
```

---

## 1. Конфигурация Nginx

Создать файл `nginx/nginx.conf` для reverse proxy:

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    server_name conozco.net www.conozco.net;
    
    # Для Certbot challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name conozco.net www.conozco.net;
    
    ssl_certificate /etc/letsencrypt/live/conozco.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/conozco.net/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.deepl.com https://api.mymemory.translated.net;" always;
    
    # Proxy settings
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;
    
    # Healthcheck endpoint (no rate limiting)
    location /api/health {
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }
    
    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth_limit burst=5 nodelay;
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # All other routes
    location / {
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Создать `nginx/Dockerfile`:

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## 2. Консолидация миграций базы данных

**Стратегия**: Создать одну "baseline" миграцию из текущей схемы.

### Шаги:

1. Сделать бэкап локальной БД:
   ```bash
   npm run db:backup
   ```

2. Экспортировать данные в SQL дамп:
   ```bash
   docker exec flashcards-db pg_dump -U flashcards -d flashcards \
     --data-only --inserts > backup-data.sql
   ```

3. Удалить папку `prisma/migrations`:
   ```bash
   rm -rf prisma/migrations
   ```

4. Создать новую baseline миграцию:
   ```bash
   npx prisma migrate dev --name init --create-only
   ```

5. Проверить что схема совпадает с `schema.prisma`

6. Применить миграцию локально:
   ```bash
   npx prisma migrate dev
   ```

### Миграция данных на prod

После первого деплоя на сервер:

```bash
# На локальной машине - создать дамп
docker exec flashcards-db pg_dump -U flashcards -d flashcards > full-backup.sql

# Скопировать на сервер
scp full-backup.sql root@164.92.130.190:/opt/flashcards/

# На сервере - восстановить
docker exec -i flashcards-db psql -U flashcards -d flashcards < /opt/flashcards/full-backup.sql
```

---

## 3. SSL-сертификат (Let's Encrypt + Certbot)

**Выбор**: Let's Encrypt через Certbot без wildcard (для conozco.net и www.conozco.net).

### Получение сертификата

На сервере после настройки DNS:

```bash
# Установка certbot (включено в setup-server.sh)
apt install -y certbot

# Первоначальное получение сертификата (standalone mode)
certbot certonly --standalone -d conozco.net -d www.conozco.net \
  --non-interactive --agree-tos --email your-email@example.com

# После этого запустить nginx с SSL
```

### Автообновление сертификата

Добавить в cron (включено в setup-server.sh):

```bash
# Автообновление SSL каждый день в 2:30
30 2 * * * certbot renew --quiet --post-hook "docker exec flashcards-nginx nginx -s reload"
```

---

## 4. Автоматические бэкапы БД (2 раза в сутки)

### Скрипт бэкапа: `scripts/server-setup/backup-db-prod.sh`

```bash
#!/bin/bash
set -e

BACKUP_DIR="/opt/flashcards/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/flashcards_$TIMESTAMP.sql.gz"
RETENTION_DAYS=14
LOG_FILE="/var/log/flashcards-backup.log"

# Функция для логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Проверка существования контейнера
if ! docker ps --format "{{.Names}}" | grep -q "^flashcards-db$"; then
    log "ERROR: flashcards-db container is not running"
    exit 1
fi

# Создать директорию если не существует
mkdir -p "$BACKUP_DIR"

log "Starting backup process..."

# Создать бэкап с использованием custom format (более эффективный)
CONTAINER_TEMP_PATH="/tmp/flashcards_backup_${TIMESTAMP}.dump"

# Попытка создать бэкап в custom format
if docker exec flashcards-db pg_dump -U flashcards -d flashcards \
    --format=custom --compress=9 --file="$CONTAINER_TEMP_PATH" 2>>"$LOG_FILE"; then
    
    # Копировать из контейнера на хост
    if docker cp flashcards-db:"$CONTAINER_TEMP_PATH" "$BACKUP_FILE" 2>>"$LOG_FILE"; then
        # Удалить временный файл из контейнера
        docker exec flashcards-db rm -f "$CONTAINER_TEMP_PATH" 2>/dev/null || true
        
        # Проверить что файл создан и не пустой
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log "SUCCESS: Backup created: $BACKUP_FILE (size: $BACKUP_SIZE)"
        else
            log "ERROR: Backup file is empty or missing"
            exit 1
        fi
    else
        log "ERROR: Failed to copy backup from container"
        docker exec flashcards-db rm -f "$CONTAINER_TEMP_PATH" 2>/dev/null || true
        exit 1
    fi
else
    log "WARNING: Custom format backup failed, trying plain SQL format..."
    
    # Fallback: plain SQL format с gzip
    if docker exec flashcards-db pg_dump -U flashcards -d flashcards \
        --format=plain 2>>"$LOG_FILE" | gzip > "$BACKUP_FILE"; then
        
        if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
            BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
            log "SUCCESS: Backup created (plain format): $BACKUP_FILE (size: $BACKUP_SIZE)"
        else
            log "ERROR: Backup file is empty or missing"
            exit 1
        fi
    else
        log "ERROR: Both backup methods failed"
        exit 1
    fi
fi

# Удалить старые бэкапы (старше RETENTION_DAYS дней)
DELETED_COUNT=$(find "$BACKUP_DIR" -name "flashcards_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted $DELETED_COUNT old backup(s)"
fi

log "Backup process completed successfully"
```

### Настройка cron

Добавить в `/etc/cron.d/flashcards-backup`:

```cron
# Бэкап БД дважды в сутки: в 03:00 и 15:00 (UTC)
0 3 * * * root /opt/flashcards/scripts/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
0 15 * * * root /opt/flashcards/scripts/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
```

### Структура бэкапов

```
/opt/flashcards/backups/
├── flashcards_2026-01-15_03-00-00.sql.gz
├── flashcards_2026-01-15_15-00-00.sql.gz
├── flashcards_2026-01-14_03-00-00.sql.gz
└── ...
```

Бэкапы хранятся 14 дней (настраивается в `RETENTION_DAYS`).

---

## 5. Автоматизация настройки сервера

Создать скрипт `scripts/server-setup/setup-server.sh`:

```bash
#!/bin/bash
set -e

echo "=== Flash Cards Server Setup ==="

# Обновление системы
apt update && apt upgrade -y

# Установка базовых пакетов
apt install -y curl git ufw

# Настройка swap (для 1GB RAM)
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Установка Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Установка Docker Compose (v2)
apt install -y docker-compose-plugin

# Установка Certbot
apt install -y certbot

# Настройка UFW
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Создание директорий
mkdir -p /opt/flashcards
mkdir -p /opt/flashcards/backups
mkdir -p /var/www/certbot

# Генерация SSH ключа для GitHub Actions
if [ ! -f /root/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -f /root/.ssh/id_ed25519 -N ""
    echo "=== PUBLIC KEY FOR GITHUB DEPLOY KEY ==="
    cat /root/.ssh/id_ed25519.pub
    echo "========================================="
fi

# Клонирование репозитория (замените на ваш URL)
# git clone git@github.com:YOUR_USERNAME/flash-cards.git /opt/flashcards

# Настройка cron для бэкапов
cat > /etc/cron.d/flashcards-backup << 'EOF'
# Бэкап БД дважды в сутки
0 3 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
0 15 * * * root /opt/flashcards/scripts/server-setup/backup-db-prod.sh >> /var/log/flashcards-backup.log 2>&1
EOF

# Настройка cron для SSL renewal
cat > /etc/cron.d/certbot-renewal << 'EOF'
30 2 * * * root certbot renew --quiet --post-hook "docker exec flashcards-nginx nginx -s reload" >> /var/log/certbot-renewal.log 2>&1
EOF

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Add the public key above as Deploy Key in GitHub"
echo "2. Clone repository to /opt/flashcards"
echo "3. Configure DNS in Namecheap"
echo "4. Run: certbot certonly --standalone -d conozco.net -d www.conozco.net"
echo "5. Create .env file and start containers"
```

---

## 6. Стратегия синхронизации данных (Local -> Prod)

```mermaid
flowchart LR
    LocalDB[(Local PostgreSQL)]
    Script[sync-to-prod.sh]
    ProdDB[(Prod PostgreSQL)]
    
    LocalDB -->|pg_dump| Script
    Script -->|SSH + psql| ProdDB
```

### Скрипт: `scripts/sync-data/sync-to-prod.sh`

```bash
#!/bin/bash
set -e

SERVER="root@164.92.130.190"
REMOTE_DIR="/opt/flashcards"
TABLES="BaseWord,WordTranslation,WordExample,WordGroup,BaseWordOnWordGroup,Pronoun,Tense,GrammaticalExample,Language,SentenceType,WordSource,PartOfSpeech"

echo "=== Syncing data to production ==="

# 1. Создать бэкап на сервере
echo "Creating backup on server..."
ssh $SERVER "$REMOTE_DIR/scripts/server-setup/backup-db-prod.sh"

# 2. Экспорт локальных данных (только указанные таблицы)
echo "Exporting local data..."
for TABLE in ${TABLES//,/ }; do
    docker exec flashcards-db pg_dump -U flashcards -d flashcards \
      --data-only --inserts -t "\"$TABLE\"" >> /tmp/sync-data.sql
done

# 3. Отправить на сервер
echo "Uploading to server..."
scp /tmp/sync-data.sql $SERVER:/tmp/

# 4. Импортировать данные
echo "Importing data on server..."
ssh $SERVER "docker exec -i flashcards-db psql -U flashcards -d flashcards < /tmp/sync-data.sql"

# 5. Очистка
rm /tmp/sync-data.sql
ssh $SERVER "rm /tmp/sync-data.sql"

echo "=== Sync complete ==="
```

### Рекомендации по синхронизации

- **Всегда** делать бэкап prod БД перед синхронизацией (скрипт делает автоматически)
- Синхронизировать только справочные таблицы (слова, переводы, примеры)
- **Не синхронизировать**: User, Session, Account, Word (пользовательские), TrainingSession, TrainingLog
- Для конфликтов использовать `INSERT ... ON CONFLICT DO UPDATE`

---

## 7. GitHub Actions CI/CD

### Workflow: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/flashcards
            
            # Pull latest changes
            git pull origin main
            
            # Build and restart containers
            docker compose -f docker-compose.prod.yml build --no-cache
            docker compose -f docker-compose.prod.yml up -d
            
            # Run migrations
            docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
            
            # Clean up old images
            docker image prune -f
            
            echo "Deployment completed at $(date)"
```

---

## 8. Настройка секретов GitHub

### Какие секреты нужны

| Секрет | Значение | Описание |
|--------|----------|----------|
| `SERVER_HOST` | `164.92.130.190` | IP-адрес сервера |
| `SERVER_USER` | `root` | SSH пользователь |
| `SSH_PRIVATE_KEY` | Содержимое приватного ключа | Ключ для SSH доступа |

### Как добавить секреты

1. Перейти в репозиторий на GitHub

2. Открыть **Settings** → **Secrets and variables** → **Actions**

3. Нажать **New repository secret**

4. Добавить секреты:

   **SERVER_HOST**:
   ```
   164.92.130.190
   ```

   **SERVER_USER**:
   ```
   root
   ```

   **SSH_PRIVATE_KEY**:
   - Сгенерировать ключ на локальной машине:
     ```bash
     ssh-keygen -t ed25519 -f ~/.ssh/flashcards-deploy -C "github-actions-deploy"
     ```
   - Скопировать **публичный** ключ на сервер:
     ```bash
     ssh-copy-id -i ~/.ssh/flashcards-deploy.pub root@164.92.130.190
     ```
   - В секрет `SSH_PRIVATE_KEY` вставить содержимое **приватного** ключа:
     ```bash
     cat ~/.ssh/flashcards-deploy
     ```
     (включая строки `-----BEGIN OPENSSH PRIVATE KEY-----` и `-----END OPENSSH PRIVATE KEY-----`)

### Проверка секретов

После добавления секретов они будут отображаться в списке:

```
SERVER_HOST      Updated 2 minutes ago
SERVER_USER      Updated 2 minutes ago
SSH_PRIVATE_KEY  Updated 2 minutes ago
```

---

## 9. Переменные окружения для Production

Создать `.env.production.example`:

```env
# Database
DATABASE_URL=postgresql://flashcards:SECURE_PASSWORD@postgres:5432/flashcards

# NextAuth
NEXTAUTH_SECRET=GENERATE_WITH_openssl_rand_base64_32
NEXTAUTH_URL=https://conozco.net

# Environment
NODE_ENV=production

# External APIs
# DeepL API key (required for translations)
DEEPL_API_KEY=your-deepl-api-key-here

# Optional: Google Analytics
# NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Генерация безопасного секрета:

```bash
openssl rand -base64 32
```

**Важно**: Все переменные окружения должны быть установлены в `.env` файле на production сервере перед запуском контейнеров.

---

## 10. Healthcheck Endpoint для приложения

Создать файл `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Проверка подключения к базе данных
        await prisma.$queryRaw`SELECT 1`;
        
        return NextResponse.json(
            { 
                status: 'ok', 
                timestamp: new Date().toISOString(),
                database: 'connected'
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { 
                status: 'error', 
                timestamp: new Date().toISOString(),
                database: 'disconnected',
                error: process.env.NODE_ENV === 'production' 
                    ? undefined 
                    : (error as Error).message
            },
            { status: 503 }
        );
    }
}
```

Этот endpoint используется Docker healthcheck для проверки работоспособности приложения.

---

## 11. Доработки Dockerfile для Production

Создать `Dockerfile.prod`:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package*.json ./
RUN npm ci
COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

RUN apk add --no-cache libc6-compat openssl wget
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 8000

CMD ["node", "server.js"]
```

**Примечание**: `wget` установлен для использования в healthcheck. Альтернативно можно использовать `curl` или встроенный Node.js для проверки health.

**Критически важно**: Добавить в `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
};

module.exports = nextConfig;
```

Без этой настройки Dockerfile.prod не сможет собрать standalone версию приложения.

---

## 12. docker-compose.prod.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: flashcards-db
    restart: always
    environment:
      POSTGRES_USER: flashcards
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: flashcards
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - flashcards-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U flashcards"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: flashcards-app
    restart: always
    environment:
      DATABASE_URL: postgresql://flashcards:${DB_PASSWORD}@postgres:5432/flashcards
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: https://conozco.net
      NODE_ENV: production
      DEEPL_API_KEY: ${DEEPL_API_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - flashcards-network

  nginx:
    image: nginx:alpine
    container_name: flashcards-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
    depends_on:
      - app
    networks:
      - flashcards-network

volumes:
  postgres_data:

networks:
  flashcards-network:
    driver: bridge
```

---

## 13. Настройка DNS (Namecheap)

В панели Namecheap для домена conozco.net:

1. Перейти в **Domain List** → **Manage** → **Advanced DNS**

2. Удалить все существующие записи (если есть парковочные)

3. Добавить записи:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 164.92.130.190 | 300 |
| A Record | www | 164.92.130.190 | 300 |

4. Сохранить изменения

5. Подождать 5-30 минут для распространения DNS

Проверка DNS:
```bash
dig conozco.net +short
# Должен показать: 164.92.130.190
```

---

## 14. Структура новых файлов

```
flash-cards/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── app/
│   └── api/
│       └── health/
│           └── route.ts          # Healthcheck endpoint
├── nginx/
│   ├── nginx.conf                 # С rate limiting и CSP
│   └── Dockerfile
├── scripts/
│   ├── server-setup/
│   │   ├── setup-server.sh
│   │   ├── backup-db-prod.sh     # Улучшенный с проверками
│   │   └── README.md
│   └── sync-data/
│       ├── sync-to-prod.sh
│       └── README.md
├── docker-compose.prod.yml        # С healthcheck для app
├── Dockerfile.prod
├── .env.production.example        # С переменными для внешних API
├── next.config.js                 # С output: 'standalone'
└── docs/
    └── production-deployment-plan.md
```

---

## 15. Порядок выполнения

### Этап 1: Подготовка проекта (локально)

- [ ] Создать `nginx/nginx.conf` с rate limiting и CSP заголовками
- [ ] Создать `nginx/Dockerfile`
- [ ] Создать `Dockerfile.prod` с multi-stage сборкой
- [ ] **Критично**: Добавить `output: 'standalone'` в `next.config.js`
- [ ] Создать `/app/api/health/route.ts` для healthcheck endpoint
- [ ] Создать `docker-compose.prod.yml` с healthcheck для app
- [ ] Создать `.env.production.example` с переменными для внешних API
- [ ] Создать улучшенный скрипт `scripts/server-setup/backup-db-prod.sh`
- [ ] Создать скрипт `scripts/sync-data/sync-to-prod.sh`
- [ ] Создать `.github/workflows/deploy.yml`

### Этап 2: Консолидация миграций

- [ ] Сделать бэкап локальной БД: `npm run db:backup`
- [ ] Экспортировать данные: `pg_dump --data-only`
- [ ] Удалить `prisma/migrations`
- [ ] Создать baseline миграцию: `npx prisma migrate dev --name init`
- [ ] Проверить работоспособность локально

### Этап 3: Настройка сервера

- [ ] Подключиться к серверу: `ssh root@164.92.130.190`
- [ ] Скопировать и запустить `setup-server.sh`
- [ ] Сохранить публичный SSH ключ для GitHub

### Этап 4: Настройка DNS

- [ ] Добавить A-записи в Namecheap
- [ ] Дождаться распространения DNS (проверить через `dig`)

### Этап 5: SSL-сертификат

- [ ] Остановить nginx если запущен
- [ ] Получить сертификат: `certbot certonly --standalone -d conozco.net -d www.conozco.net`
- [ ] Проверить что сертификаты созданы в `/etc/letsencrypt/live/conozco.net/`

### Этап 6: Первый деплой

- [ ] Клонировать репозиторий на сервер
- [ ] Создать `.env` файл на сервере (включая DEEPL_API_KEY)
- [ ] Проверить что `next.config.js` содержит `output: 'standalone'`
- [ ] Убедиться что создан `/app/api/health/route.ts`
- [ ] Запустить: `docker compose -f docker-compose.prod.yml up -d`
- [ ] Проверить healthcheck: `docker compose ps` (должен показать "healthy" для app)
- [ ] Применить миграции: `docker compose exec app npx prisma migrate deploy`
- [ ] Проверить логи: `docker compose logs app`
- [ ] Загрузить данные из локальной БД

### Этап 7: Настройка GitHub Actions

- [ ] Сгенерировать SSH ключ для деплоя
- [ ] Добавить публичный ключ на сервер
- [ ] Добавить секреты в GitHub (SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY)
- [ ] Сделать тестовый push в main
- [ ] Проверить успешность деплоя

### Этап 8: Финальная проверка

- [ ] Проверить доступность https://conozco.net
- [ ] Проверить работу авторизации
- [ ] Проверить работу тренировок
- [ ] Проверить cron-задачи (бэкапы, SSL renewal)
- [ ] Протестировать синхронизацию данных
