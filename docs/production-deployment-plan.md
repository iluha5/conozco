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

Создать файл `nginx/nginx.conf` для reverse proxy (используем bind-mount, отдельный Dockerfile для nginx не нужен):

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=30r/m;

# Корректная обработка WebSocket Upgrade
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}

server {
    listen 80;
    server_name conozco.net www.conozco.net;

    # Для Certbot challenge (webroot метод)
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
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Content Security Policy (минимально-безопасная; по возможности перейти на nonce/sha)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.deepl.com https://api.mymemory.translated.net;" always;

    # Proxy settings
    client_max_body_size 10M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    # Кэширование статики Next.js
    location /_next/static/ {
        proxy_pass http://app:8000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
    }

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
        limit_req zone=auth_limit burst=20 nodelay;
        proxy_pass http://app:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
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
        proxy_set_header Connection $connection_upgrade;
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
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 2. Консолидация миграций базы данных

**Стратегия**: Используем текущие миграции из `prisma/migrations`. Для старта с пустой prod-БД применяем `prisma migrate deploy`, затем переносим данные с локали через `data-only` дамп.

### Шаги:

1. Сделать бэкап локальной БД:
   ```bash
   npm run db:backup
   ```

2. Убедиться, что все изменения схемы оформлены миграциями в `prisma/migrations`

3. Применить миграции локально:
   ```bash
   npx prisma migrate dev
   ```
   > Примечание: `migrate dev` может запросить reset базы. Убедитесь, что бэкап сделан и вы готовы восстановить данные.

4. Проверить что схема совпадает с `schema.prisma`

### Первичный перенос данных на prod (пустая БД)

1) Применить миграции на prod БД: `docker compose -f docker-compose.prod.yml run --rm --no-deps app npx prisma migrate deploy`

2) Перенести все данные из локальной БД (без таблицы `_prisma_migrations`):
```bash
# На локальной машине — создать дамп всех данных
docker exec flashcards-db pg_dump -U flashcards -d flashcards \
  --data-only --inserts --exclude-table=_prisma_migrations > data-only.sql

# Скопировать на сервер
scp data-only.sql root@164.92.130.190:/opt/flashcards/

# На сервере — импортировать
docker exec -i flashcards-db psql -U flashcards -d flashcards < /opt/flashcards/data-only.sql
```

---

## 3. SSL-сертификат (Let's Encrypt + Certbot)

**Выбор**: Let's Encrypt через Certbot без wildcard (для conozco.net и www.conozco.net).

### Получение сертификата

На сервере после настройки DNS (webroot, без остановки nginx):

```bash
# Установка certbot (включено в setup-server.sh)
apt install -y certbot

# Первоначальное получение сертификата (webroot mode)
certbot certonly --webroot -w /var/www/certbot -d conozco.net -d www.conozco.net \
  --non-interactive --agree-tos --email your-email@example.com

# После этого nginx уже может обслуживать HTTPS
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
set -euo pipefail

# Local backup settings
BACKUP_DIR="/opt/flashcards/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_BASE="$BACKUP_DIR/flashcards_$TIMESTAMP"
RETENTION_DAYS=14
LOG_FILE="/var/log/flashcards-backup.log"

# DigitalOcean Spaces settings
SPACES_BUCKET="conozco"
SPACES_REGION="sfo3"
SPACES_ENDPOINT="sfo3.digitaloceanspaces.com"
SPACES_PATH="s3://${SPACES_BUCKET}/database-backups/"
SPACES_RETENTION_DAYS=30

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

if ! docker ps --format "{{.Names}}" | grep -q "^flashcards-db$"; then
  log "ERROR: flashcards-db container is not running"; exit 1; fi

mkdir -p "$BACKUP_DIR"
log "Starting backup process..."

# Try custom format first
CONTAINER_TMP_DUMP="/tmp/flashcards_${TIMESTAMP}.dump"
FINAL_BACKUP_FILE=""

if docker exec flashcards-db pg_dump -U flashcards -d flashcards \
  --format=custom --compress=9 --file="$CONTAINER_TMP_DUMP" 2>>"$LOG_FILE"; then

  HOST_DUMP_FILE="${BACKUP_BASE}.dump"
  if docker cp "flashcards-db:${CONTAINER_TMP_DUMP}" "$HOST_DUMP_FILE" 2>>"$LOG_FILE"; then
    docker exec flashcards-db rm -f "$CONTAINER_TMP_DUMP" 2>/dev/null || true
    if [ -s "$HOST_DUMP_FILE" ]; then
      FINAL_BACKUP_FILE="$HOST_DUMP_FILE"
      SIZE=$(du -h "$FINAL_BACKUP_FILE" | cut -f1)
      log "SUCCESS: Backup created: $FINAL_BACKUP_FILE (size: $SIZE)"
    else
      log "ERROR: Dump file is empty"; exit 1
    fi
  else
    log "ERROR: Failed to copy dump from container"; exit 1
  fi
else
  log "WARNING: Custom dump failed, fallback to plain SQL gzip..."
  HOST_SQL_FILE="${BACKUP_BASE}.sql.gz"
  if docker exec flashcards-db pg_dump -U flashcards -d flashcards --format=plain 2>>"$LOG_FILE" \
    | gzip > "$HOST_SQL_FILE"; then
    if [ -s "$HOST_SQL_FILE" ]; then
      FINAL_BACKUP_FILE="$HOST_SQL_FILE"
      SIZE=$(du -h "$FINAL_BACKUP_FILE" | cut -f1)
      log "SUCCESS: Backup created (plain): $FINAL_BACKUP_FILE (size: $SIZE)"
    else
      log "ERROR: Plain SQL gzip file is empty"; exit 1
    fi
  else
    log "ERROR: Both backup methods failed"; exit 1
  fi
fi

# Функция загрузки в DigitalOcean Spaces
upload_to_spaces() {
  local FILE="$1"
  log "Uploading backup to DigitalOcean Spaces..."
  s3cmd put "$FILE" "${SPACES_PATH}$(basename "$FILE")" \
    --host="${SPACES_ENDPOINT}" \
    --host-bucket="${SPACES_BUCKET}.${SPACES_ENDPOINT}" \
    --region="${SPACES_REGION}" 2>>"$LOG_FILE"
}

cleanup_old_spaces_backups() {
  log "Cleaning old backups from Spaces (older than ${SPACES_RETENTION_DAYS} days)..."
  CUTOFF_TIMESTAMP=$(date -d "${SPACES_RETENTION_DAYS} days ago" +%s)
  s3cmd ls "${SPACES_PATH}" 2>/dev/null | while read -r line; do
    FILE_DATE=$(echo "$line" | awk '{print $1" "$2}')
    FILE_PATH=$(echo "$line" | awk '{print $4}')
    FILE_TS=$(date -d "$FILE_DATE" +%s 2>/dev/null || echo 0)
    if [ "$FILE_TS" -gt 0 ] && [ "$FILE_TS" -lt "$CUTOFF_TIMESTAMP" ]; then
      s3cmd del "$FILE_PATH" 2>>"$LOG_FILE" && log "Deleted old backup: $(basename "$FILE_PATH")"
    fi
  done
}

if command -v s3cmd &>/dev/null; then
  if upload_to_spaces "$FINAL_BACKUP_FILE"; then
    log "SUCCESS: Uploaded to Spaces"
    cleanup_old_spaces_backups
  else
    log "WARNING: Spaces upload failed, local backup retained"
  fi
else
  log "WARNING: s3cmd not found, skipping Spaces upload"
fi

# Local retention
log "Cleaning old local backups (older than ${RETENTION_DAYS} days)..."
find "$BACKUP_DIR" -name "flashcards_*.*" -mtime +$RETENTION_DAYS -delete -print 2>/dev/null \
  | wc -l | xargs -I{} echo "Deleted {} old local backup(s)" | tee -a "$LOG_FILE"

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

Бэкапы хранятся 14 дней локально (настраивается в `RETENTION_DAYS`).

---

## 4.1. Настройка DigitalOcean Spaces для удаленного хранения бэкапов

### Что такое DigitalOcean Spaces?

**DigitalOcean Spaces** - это S3-совместимое объектное хранилище для файлов любого размера. Используется для надежного хранения бэкапов с географической избыточностью.

### Зачем нужно для этого проекта?

- **Географическая избыточность**: Production сервер в Frankfurt (fra1), бэкапы в San Francisco (sfo3)
- **Защита от отказа сервера**: Если дроплет выйдет из строя, бэкапы останутся доступными
- **Долгосрочное хранение**: 30 дней в Spaces vs 14 дней локально
- **Автоматизация**: Загрузка и очистка старых бэкапов происходит автоматически

### Конфигурация Space для проекта

- **URL**: `https://conozco.sfo3.digitaloceanspaces.com`
- **Bucket name**: `conozco`
- **Region**: `sfo3` (San Francisco)
- **Путь для бэкапов**: `s3://conozco/database-backups/`

### Создание API ключей (если еще не создано)

1. Зайти в [DigitalOcean Control Panel](https://cloud.digitalocean.com/)

2. Перейти в **API** → **Spaces access keys**

3. Нажать **Generate New Key**

4. Назвать ключ: `flashcards-backup-key`

5. **Сохранить оба значения** (Secret Key показывается только один раз!):
   ```
   Access Key ID: DO00ABCDEFGH12345678
   Secret Access Key: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

6. Эти ключи понадобятся для настройки s3cmd на сервере

### Безопасность ключей

**На сервере:**
- Ключи хранятся в `/root/.s3cfg` с правами `600` (только root может читать)
- Не коммитить `.s3cfg` в репозиторий

**В репозитории:**
- Добавить в `.gitignore`:
  ```
  .s3cfg
  scripts/**/.s3cfg
  ```

### Стоимость

- **$5/месяц** за 250GB хранилища + 1TB исходящего трафика
- Бэкапы: ~50-100MB × 60 (30 дней × 2 раза/день) = ~3-6GB
- **Укладывается в базовый тариф**

---

## 4.2. Настройка s3cmd на сервере

### Установка s3cmd

s3cmd будет установлен автоматически при выполнении `setup-server.sh` (см. раздел 5).

Для ручной установки:
```bash
apt install -y s3cmd python3-magic
```

### Настройка доступа к Spaces

На production сервере выполнить:

```bash
s3cmd --configure
```

**Параметры для ввода:**

| Параметр | Значение |
|----------|----------|
| Access Key | `DO00ABCDEFGH12345678` (ваш ключ) |
| Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` (ваш секрет) |
| Default Region | `sfo3` |
| S3 Endpoint | `sfo3.digitaloceanspaces.com` |
| DNS-style bucket+hostname template | `%(bucket)s.sfo3.digitaloceanspaces.com` |
| Encryption password | `[Enter]` (оставить пустым или задать для дополнительной безопасности) |
| Path to GPG program | `/usr/bin/gpg` (по умолчанию) |
| Use HTTPS protocol | `Yes` |
| HTTP Proxy server name | `[Enter]` (оставить пустым) |

**Важно**: На вопрос "Test access with supplied credentials?" ответить `Y` для проверки подключения.

### Проверка конфигурации

```bash
# Проверить что конфигурация сохранена
cat /root/.s3cfg | grep host_base

# Должно показать:
# host_base = sfo3.digitaloceanspaces.com

# Установить правильные права доступа
chmod 600 /root/.s3cfg
```

### Проверка работы s3cmd

```bash
# Список всех buckets
s3cmd ls

# Должно показать:
# 2026-01-15 10:00  s3://conozco

# Список файлов в bucket (пока пусто)
s3cmd ls s3://conozco/database-backups/
```

### Альтернатива: Создание .s3cfg программно

Для автоматизации можно создать файл напрямую:

```bash
cat > /root/.s3cfg << 'EOF'
[default]
access_key = DO00ABCDEFGH12345678
secret_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
host_base = sfo3.digitaloceanspaces.com
host_bucket = %(bucket)s.sfo3.digitaloceanspaces.com
use_https = True
default_mime_type = binary/octet-stream
enable_multipart = True
multipart_chunk_size_mb = 15
EOF

chmod 600 /root/.s3cfg
```

**Замените** `access_key` и `secret_key` на ваши реальные значения!

---

## 4.3. Тестирование бэкапов в Spaces

После настройки s3cmd важно протестировать весь процесс.

### Тест 1: Ручная загрузка бэкапа

```bash
# Запустить скрипт бэкапа вручную
/opt/flashcards/scripts/server-setup/backup-db-prod.sh

# Проверить логи
tail -f /var/log/flashcards-backup.log

# Проверить что файл появился в Spaces
s3cmd ls s3://conozco/database-backups/

# Должно показать:
# 2026-01-15 15:30  12345678   s3://conozco/database-backups/flashcards_2026-01-15_15-30-00.sql.gz
```

### Тест 2: Скачивание бэкапа

```bash
# Получить последний бэкап
LATEST_BACKUP=$(s3cmd ls s3://conozco/database-backups/ | tail -n 1 | awk '{print $4}')

# Скачать файл
s3cmd get "$LATEST_BACKUP" /tmp/test-backup.sql.gz

# Проверить размер
ls -lh /tmp/test-backup.sql.gz

# Проверить что файл не поврежден
gunzip -t /tmp/test-backup.sql.gz && echo "Backup file is valid"
```

### Тест 3: Полное восстановление в тестовую БД

```bash
# Скачать последний бэкап
LATEST_BACKUP=$(s3cmd ls s3://conozco/database-backups/ | tail -n 1 | awk '{print $4}')
s3cmd get "$LATEST_BACKUP" /tmp/test-restore.sql.gz

# Распаковать
gunzip /tmp/test-restore.sql.gz

# Создать тестовую БД
docker exec -i flashcards-db psql -U flashcards -c "DROP DATABASE IF EXISTS test_restore;"
docker exec -i flashcards-db psql -U flashcards -c "CREATE DATABASE test_restore;"

# Восстановить данные
docker exec -i flashcards-db psql -U flashcards -d test_restore < /tmp/test-restore.sql

# Проверить данные
docker exec flashcards-db psql -U flashcards -d test_restore -c "SELECT COUNT(*) FROM \"User\";"
docker exec flashcards-db psql -U flashcards -d test_restore -c "SELECT COUNT(*) FROM \"BaseWord\";"

# Удалить тестовую БД
docker exec flashcards-db psql -U flashcards -c "DROP DATABASE test_restore;"

# Очистить временные файлы
rm /tmp/test-restore.sql
```

Если все тесты прошли успешно - бэкапы настроены корректно!

---

## 4.4. Мониторинг бэкапов

### Скрипт проверки свежести бэкапов

Создать `scripts/server-setup/check-backups.sh`:

```bash
#!/bin/bash
set -e

LOG_FILE="/var/log/flashcards-backup-check.log"
ALERT_EMAIL="your-email@example.com"
SPACES_PATH="s3://conozco/database-backups/"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Проверить что s3cmd настроен
if ! command -v s3cmd &> /dev/null; then
    log "ERROR: s3cmd is not installed"
    exit 1
fi

# Проверить свежесть бэкапа в Spaces
log "Checking latest backup in Spaces..."
LATEST_BACKUP=$(s3cmd ls "$SPACES_PATH" | tail -n 1 | awk '{print $1" "$2}')

if [ -z "$LATEST_BACKUP" ]; then
    log "ERROR: No backups found in Spaces!"
    # Опционально: отправить email
    # echo "No backups found in Spaces" | mail -s "CRITICAL: Backup Alert" "$ALERT_EMAIL"
    exit 1
fi

log "Latest backup date: $LATEST_BACKUP"

# Вычислить возраст бэкапа
LATEST_TIMESTAMP=$(date -d "$LATEST_BACKUP" +%s 2>/dev/null || echo 0)

if [ "$LATEST_TIMESTAMP" -eq 0 ]; then
    log "ERROR: Failed to parse backup timestamp"
    exit 1
fi

CURRENT_TIMESTAMP=$(date +%s)
AGE_HOURS=$(( ($CURRENT_TIMESTAMP - $LATEST_TIMESTAMP) / 3600 ))

# Проверить что бэкап не старше 24 часов
if [ "$AGE_HOURS" -gt 24 ]; then
    log "WARNING: Latest backup is ${AGE_HOURS} hours old!"
    # Опционально: отправить email
    # echo "Latest backup is ${AGE_HOURS} hours old" | mail -s "WARNING: Backup Alert" "$ALERT_EMAIL"
    exit 1
else
    log "OK: Latest backup is ${AGE_HOURS} hours old"
fi

# Проверить количество бэкапов
BACKUP_COUNT=$(s3cmd ls "$SPACES_PATH" | wc -l)
log "Total backups in Spaces: $BACKUP_COUNT"

if [ "$BACKUP_COUNT" -lt 5 ]; then
    log "WARNING: Only $BACKUP_COUNT backups found (expected at least 5)"
fi

log "Backup check completed successfully"
```

### Настройка автоматической проверки

Добавить в cron (ежедневная проверка в 9:00):

```bash
# Создать cron задачу
cat > /etc/cron.d/flashcards-backup-check << 'EOF'
# Проверка свежести бэкапов каждый день в 9:00
0 9 * * * root /opt/flashcards/scripts/server-setup/check-backups.sh >> /var/log/flashcards-backup-check.log 2>&1
EOF

# Сделать скрипт исполняемым
chmod +x /opt/flashcards/scripts/server-setup/check-backups.sh
```

### Просмотр логов мониторинга

```bash
# Последние проверки
tail -n 50 /var/log/flashcards-backup-check.log

# Следить за проверками в реальном времени
tail -f /var/log/flashcards-backup-check.log
```

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

# Установка Docker из официального apt-репозитория
apt-get install -y ca-certificates gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker && systemctl start docker

# Установка Certbot
apt install -y certbot

# Установка s3cmd для работы с DigitalOcean Spaces
apt install -y s3cmd python3-magic

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

# Создание пользователя для деплоя (безопаснее, чем root)
if ! id -u deploy >/dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
  echo "Created user 'deploy' and added to docker group"
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

# Настройка cron для проверки бэкапов
cat > /etc/cron.d/flashcards-backup-check << 'EOF'
# Проверка свежести бэкапов каждый день в 9:00
0 9 * * * root /opt/flashcards/scripts/server-setup/check-backups.sh >> /var/log/flashcards-backup-check.log 2>&1
EOF

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Add the public key above as Deploy Key in GitHub"
echo "2. Clone repository to /opt/flashcards"
echo "3. Configure s3cmd: s3cmd --configure (see section 4.2)"
echo "4. Configure DNS in Namecheap"
echo "5. Run: certbot certonly --standalone -d conozco.net -d www.conozco.net"
echo "6. Create .env file and start containers"
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
set -euo pipefail

SERVER="root@164.92.130.190"
REMOTE_DIR="/opt/flashcards"
TABLES="BaseWord,WordTranslation,WordExample,WordGroup,BaseWordOnWordGroup,Pronoun,Tense,GrammaticalExample,Language,SentenceType,WordSource,PartOfSpeech"

echo "=== Syncing data to production ==="

# 1. Создать бэкап на сервере
echo "Creating backup on server..."
ssh "$SERVER" "$REMOTE_DIR/scripts/server-setup/backup-db-prod.sh"

# 2. Экспорт локальных данных (только указанные таблицы)
TMP_FILE="/tmp/sync-data.sql"
rm -f "$TMP_FILE"
echo "Exporting local data..."
for TABLE in ${TABLES//,/ }; do
  docker exec flashcards-db pg_dump -U flashcards -d flashcards \
    --data-only --inserts -t "\"$TABLE\"" >> "$TMP_FILE"
done

# 3. Отправить на сервер
echo "Uploading to server..."
scp "$TMP_FILE" "$SERVER:/tmp/"

# 4. Импортировать данные
echo "Importing data on server..."
ssh "$SERVER" "docker exec -i flashcards-db psql -U flashcards -d flashcards < /tmp/$(basename "$TMP_FILE")"

# 5. Очистка
rm -f "$TMP_FILE"
ssh "$SERVER" "rm -f /tmp/$(basename "$TMP_FILE")"

echo "=== Sync complete ==="
```

### Рекомендации по синхронизации

- **Всегда** делать бэкап prod БД перед синхронизацией (скрипт делает автоматически)
- Синхронизировать только справочные таблицы (слова, переводы, примеры)
- **Не синхронизировать**: User, Session, Account, Word (пользовательские), TrainingSession, TrainingLog
- Скрипт использует только `INSERT` без upsert; повторный импорт требует ручной очистки таблиц или доработки скрипта
- Для первичного переноса всех данных используйте раздел 2 (data-only дамп всей БД)

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
  REGISTRY: registry.digitalocean.com/conozco-registry
  IMAGE_NAME: flashcards-app
  IMAGE_TAG: sha-${{ github.sha }}

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  build_and_push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to DigitalOcean Container Registry
        uses: digitalocean/action-doctl@v2
        with:
          token: ${{ secrets.DO_TOKEN }}
      - name: DOCR login
        run: doctl registry login --expiry-seconds 600
      - name: Build and push image
        run: |
          docker buildx build \
            -f Dockerfile.prod \
            -t $REGISTRY/$IMAGE_NAME:${IMAGE_TAG} \
            --push .

  deploy:
    needs: build_and_push
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          envs: REGISTRY,IMAGE_NAME,IMAGE_TAG
          script: |
            set -euo pipefail
            cd /opt/flashcards
            
            # Login to DOCR (requires doctl or docker login on server)
            if command -v doctl >/dev/null 2>&1; then
              echo "Logging to DOCR via doctl..."
              doctl registry login || true
            else
              echo "Logging to DOCR via docker login..."
              echo "${{ secrets.DOCR_READ_TOKEN }}" | docker login registry.digitalocean.com -u doctl-token --password-stdin
            fi

            if [ -z "${IMAGE_TAG:-}" ]; then
              echo "ERROR: IMAGE_TAG is not set"; exit 1; fi
            echo "Deploying image tag: ${IMAGE_TAG}"

            export IMAGE_TAG="${IMAGE_TAG}"
            docker compose -f docker-compose.prod.yml pull
            if ! docker image inspect "$REGISTRY/$IMAGE_NAME:${IMAGE_TAG}" >/dev/null 2>&1; then
              echo "ERROR: Image not found: $REGISTRY/$IMAGE_NAME:${IMAGE_TAG}"; exit 1; fi
            # Run DB migrations before starting app
            docker compose -f docker-compose.prod.yml run --rm --no-deps app npx prisma migrate deploy
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker image prune -f
            echo "Deployment completed at $(date)"
```

---

## 8. Настройка секретов GitHub

### Какие секреты нужны

| Секрет | Значение | Описание |
|--------|----------|----------|
| `SERVER_HOST` | `164.92.130.190` | IP-адрес сервера |
| `SERVER_USER` | `root` или `deploy` | SSH пользователь |
| `SSH_PRIVATE_KEY` | Содержимое приватного ключа | Ключ для SSH доступа |
| `DO_TOKEN` | DigitalOcean API Token | Для `doctl registry login` в GitHub Actions |
| `DOCR_READ_TOKEN` | Read-only token для DOCR (опц.) | Для `docker login` на сервере, если нет doctl |

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

# DigitalOcean Spaces (для бэкапов БД)
# Примечание: Эти переменные НЕ используются в приложении,
# они нужны только для скриптов бэкапа на сервере
# Ключи настраиваются через s3cmd --configure (см. раздел 4.2)
# SPACES_ACCESS_KEY=your-spaces-access-key
# SPACES_SECRET_KEY=your-spaces-secret-key
# SPACES_BUCKET=conozco
# SPACES_REGION=sfo3
# SPACES_ENDPOINT=sfo3.digitaloceanspaces.com
```

Генерация безопасного секрета:

```bash
openssl rand -base64 32
```

**Важно**: Все переменные окружения должны быть установлены в `.env` файле на production сервере перед запуском контейнеров. Для деплоя через Compose используется переменная `IMAGE_TAG`, которую job деплоя экспортирует в окружение при выполнении команд (`docker compose pull/run/up`).

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
    image: registry.digitalocean.com/conozco-registry/flashcards-app:${IMAGE_TAG}
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
│   └── nginx.conf                 # С rate limiting и CSP (через bind-mount)
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
- [ ] Убедиться, что все изменения схемы оформлены миграциями в `prisma/migrations`
- [ ] Применить миграции локально: `npx prisma migrate dev`
- [ ] Подготовить data-only дамп для первичного переноса (см. раздел 2)

### Этап 3: Настройка сервера

- [ ] Подключиться к серверу: `ssh root@164.92.130.190`
- [ ] Скопировать и запустить `setup-server.sh`
- [ ] Сохранить публичный SSH ключ для GitHub
- [ ] Настроить доступ к DigitalOcean Spaces: `s3cmd --configure` (см. раздел 4.2)
- [ ] Протестировать доступ к Spaces: `s3cmd ls s3://conozco/`

### Этап 4: Настройка DNS

- [ ] Добавить A-записи в Namecheap
- [ ] Дождаться распространения DNS (проверить через `dig`)

### Этап 5: SSL-сертификат

- [ ] Получить сертификат (webroot): `certbot certonly --webroot -w /var/www/certbot -d conozco.net -d www.conozco.net`
- [ ] Проверить что сертификаты созданы в `/etc/letsencrypt/live/conozco.net/`

### Этап 6: Первый деплой

- [ ] Клонировать репозиторий на сервер
- [ ] Создать `.env` файл на сервере (включая DEEPL_API_KEY)
- [ ] Проверить что `next.config.js` содержит `output: 'standalone'`
- [ ] Убедиться что создан `/app/api/health/route.ts`
- [ ] Выполнить логин в DOCR на сервере (`doctl registry login` или `docker login`)
- [ ] Вынести `IMAGE_TAG=sha-<commit>` из CI (или задать вручную для первого запуска)
- [ ] `docker compose -f docker-compose.prod.yml pull`
- [ ] Применить миграции: `docker compose -f docker-compose.prod.yml run --rm --no-deps app npx prisma migrate deploy`
- [ ] Запустить приложение: `docker compose -f docker-compose.prod.yml up -d`
- [ ] Проверить healthcheck: `docker compose ps` (должен показать "healthy" для app)
- [ ] Проверить логи: `docker compose logs app`
- [ ] Загрузить данные из локальной БД (по выбранной стратегии из раздела 2)

### Этап 7: Настройка GitHub Actions

- [ ] Сгенерировать SSH ключ для деплоя
- [ ] Добавить публичный ключ на сервер
- [ ] Добавить секреты в GitHub (SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY, DO_TOKEN, DOCR_READ_TOKEN)
- [ ] Сделать тестовый push в main
- [ ] Проверить успешность деплоя

### Этап 8: Финальная проверка

- [ ] Проверить доступность https://conozco.net
- [ ] Проверить работу авторизации
- [ ] Проверить работу тренировок
- [ ] Проверить cron-задачи (бэкапы, SSL renewal)
- [ ] Протестировать синхронизацию данных
- [ ] Проверить автоматическую загрузку бэкапов в Spaces
- [ ] Провести тестовое восстановление из Spaces (см. раздел 16)

---

