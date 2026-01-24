# Безопасный бэкап перед миграциями

## Анализ текущей ситуации

### Проблема безопасности

Запуск миграций без бэкапа **небезопасен**, особенно для data migrations, которые могут изменять или удалять данные. Риски:

- Потеря данных при ошибке в миграции
- Невозможность отката изменений
- Нарушение целостности данных

### Текущая архитектура

1. GitHub Actions подключается к серверу по SSH
2. На сервере выполняется `docker compose run` для запуска миграций внутри контейнера
3. Скрипт `backup-db-prod.sh` требует команду `docker` на хосте (недоступна внутри контейнера)
4. Backup скрипт сохраняет бэкапы локально и в DigitalOcean Spaces

## Решения

### Вариант 1: Backup на хосте перед миграциями (Рекомендуется)

**Преимущества:**

- Бэкап выполняется на хосте, где доступна команда `docker`
- Автоматический бэкап перед каждой миграцией
- Сохранение в DigitalOcean Spaces для надежности
- Минимальные изменения в коде

**Реализация:**

Добавить вызов `backup-db-prod.sh` в workflow перед запуском миграций на хосте сервера.

**Изменения:**

- `.github/workflows/deploy.yml` - добавить вызов backup скрипта перед миграциями
- `scripts/apply-data-migrations.sh` - оставить проверку на контейнер, но backup будет выполняться на хосте

### Вариант 2: Backup из контейнера через прямой доступ к БД

**Преимущества:**

- Backup выполняется из того же места, где миграции
- Не требует доступа к docker на хосте

**Недостатки:**

- Требует установки `pg_dump` в контейнер приложения
- Увеличивает размер образа
- Менее надежно (backup зависит от контейнера приложения)

**Реализация:**

Создать альтернативный скрипт backup, который использует `pg_dump` напрямую через DATABASE_URL вместо `docker exec`.

### Вариант 3: Переместить миграции на хост

**Преимущества:**

- Полный контроль над процессом
- Легкий доступ к docker командам

**Недостатки:**

- Требует установки Node.js и зависимостей на хосте
- Усложняет процесс деплоя
- Дублирование зависимостей

## Рекомендуемое решение: Вариант 1

### Детали реализации

#### Изменения в `.github/workflows/deploy.yml`

Добавить вызов backup скрипта на хосте перед запуском миграций:

```yaml
# После проверки образа, перед миграциями
if ! docker image inspect "$REGISTRY/$IMAGE_NAME:${IMAGE_TAG}" >/dev/null 2>&1; then
  echo "ERROR: Image not found: $REGISTRY/$IMAGE_NAME:${IMAGE_TAG}"; exit 1; fi

# Create database backup before migrations
echo "Creating database backup before migrations..."
BACKUP_SCRIPT="/opt/flashcards/scripts/server-setup/backup-db-prod.sh"
if [ -f "$BACKUP_SCRIPT" ]; then
  bash "$BACKUP_SCRIPT" || {
    echo "ERROR: Database backup failed. Aborting deployment."
    exit 1
  }
  echo "Database backup completed successfully"
else
  echo "WARNING: Backup script not found at $BACKUP_SCRIPT"
  echo "Proceeding without backup (NOT RECOMMENDED for production)"
fi

# Run schema migrations before starting app
docker compose -f docker-compose.prod.yml run --rm --no-deps app npx prisma@5.22.0 migrate deploy
```

#### Изменения в `scripts/apply-data-migrations.sh`

Оставить текущую логику пропуска backup внутри контейнера, но добавить информативное сообщение:

```bash
if [ "$IS_DOCKER_CONTAINER" = "true" ]; then
    echo "ℹ️  Running inside Docker container - backup should have been created on host before deployment"
    echo "ℹ️  If backup was not created, migration will proceed without backup (NOT RECOMMENDED)"
fi
```

### Альтернатива: Условный backup

Если backup должен быть обязательным, можно добавить переменную окружения для контроля:

```yaml
# В workflow добавить переменную
envs: REGISTRY,IMAGE_NAME,IMAGE_TAG,...,SKIP_BACKUP

# В скрипте деплоя
if [ "${SKIP_BACKUP:-false}" != "true" ]; then
  bash "$BACKUP_SCRIPT" || exit 1
fi
```

## Порядок выполнения

1. Добавить вызов backup скрипта в workflow перед миграциями
2. Добавить проверку успешности backup (прервать деплой при ошибке)
3. Обновить сообщения в apply-data-migrations.sh для ясности
4. Протестировать процесс деплоя

## Безопасность

- Backup выполняется автоматически перед каждой миграцией
- При ошибке backup деплой прерывается
- Backup сохраняется локально и в DigitalOcean Spaces
- Можно добавить проверку размера backup файла для валидации

## Дополнительные улучшения (опционально)

1. Добавить метку в имя backup файла (например, `pre-migration-`)
2. Логировать время выполнения backup
3. Проверять доступное место на диске перед backup
4. Отправлять уведомления при ошибках backup
