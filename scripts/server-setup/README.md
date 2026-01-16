# Server Setup Scripts

Скрипты для настройки production сервера.

## backup-db-prod.sh

Автоматический скрипт бэкапа базы данных:
- Создает бэкап в формате PostgreSQL custom format или plain SQL (gzip)
- Загружает бэкап в DigitalOcean Spaces
- Очищает старые бэкапы (14 дней локально, 30 дней в Spaces)
- Логирует все операции в `/var/log/flashcards-backup.log`

**Использование:**
```bash
/opt/flashcards/scripts/server-setup/backup-db-prod.sh
```

**Требования:**
- Настроенный `s3cmd` с доступом к DigitalOcean Spaces
- Запущенный контейнер `flashcards-db`

## setup-server.sh

Скрипт первоначальной настройки сервера:
- Устанавливает Docker, Certbot, s3cmd
- Настраивает UFW firewall
- Создает swap файл (2GB)
- Настраивает cron задачи для бэкапов и SSL renewal
- Создает пользователя `deploy` для безопасного деплоя

**Использование:**
```bash
chmod +x scripts/server-setup/setup-server.sh
sudo ./scripts/server-setup/setup-server.sh
```

## check-backups.sh

Скрипт проверки свежести бэкапов:
- Проверяет наличие бэкапов в DigitalOcean Spaces
- Проверяет что последний бэкап не старше 24 часов
- Проверяет количество бэкапов

**Использование:**
```bash
/opt/flashcards/scripts/server-setup/check-backups.sh
```

**Настройка cron:**
Скрипт автоматически добавляется в cron при выполнении `setup-server.sh`.
