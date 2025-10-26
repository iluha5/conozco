# Docker Setup - Инструкция по запуску

## 🚀 Быстрый старт

### Первый запуск или после изменений в миграциях

```bash
# 1. Очистить базу данных (удалить volume)
./reset-db.sh

# 2. Запустить контейнеры с пересборкой
docker-compose up --build -d

# 3. Проверить логи
docker-compose logs -f app
```

### Обычный запуск (база уже инициализирована)

```bash
docker-compose up -d
```

### Остановка приложения

```bash
docker-compose down
```

## 📋 Структура миграций

Все миграции объединены в одну инициализирующую:
- `20251026000000_init` - создание всех таблиц с нормализованной структурой языков

## 🗄️ Что происходит при запуске контейнера

1. **Применение миграций**: `npx prisma migrate deploy`
   - Создаются все таблицы согласно схеме Prisma
   - Таблица `Language` уже нормализована (вместо enum)

2. **Seed данных**: `npm run prisma:seed`
   - Создаются языки: English (en), Spanish (es)
   - Создаются пользователи:
     - Admin: `ilya.rovda@gmail.com` / `12345678`
     - User: `user@example.com` / `12345678`

3. **Запуск приложения**: `npm run dev`
   - Next.js dev server на порту 3000

## 🔧 Troubleshooting

### Ошибка миграции "column already exists"

Это значит, что база данных находится в несогласованном состоянии.

**Решение:**
```bash
# Очистить базу данных
./reset-db.sh

# Запустить заново
docker-compose up --build -d
```

### Проверка состояния базы данных

```bash
# Подключиться к контейнеру с базой
docker exec -it flashcards-db psql -U flashcards -d flashcards

# Проверить таблицы
\dt

# Проверить языки
SELECT * FROM "Language";

# Выход
\q
```

### Просмотр логов

```bash
# Логи приложения
docker-compose logs -f app

# Логи базы данных
docker-compose logs -f postgres

# Все логи
docker-compose logs -f
```

## 📦 Volumes

- `postgres_data` - данные PostgreSQL
  - Для очистки: `docker volume rm flash-cards_postgres_data`

## 🌐 Доступ к приложению

- **Приложение**: http://localhost:3000
- **База данных**: localhost:5432
  - User: `flashcards`
  - Password: `flashcards_password`
  - Database: `flashcards`

## 🔄 Полная переустановка

```bash
# Остановить и удалить все
docker-compose down -v

# Удалить образы
docker rmi flashcards-app flashcards-postgres

# Запустить заново
docker-compose up --build -d
```

## 📝 Полезные команды

```bash
# Пересобрать только app контейнер
docker-compose build app

# Перезапустить контейнеры
docker-compose restart

# Войти в контейнер приложения
docker exec -it flashcards-app sh

# Выполнить команду в контейнере
docker exec -it flashcards-app npx prisma studio
```

