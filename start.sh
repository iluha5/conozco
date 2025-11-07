#!/bin/bash

echo "🚀 Запуск Flash Cards приложения..."
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker и Docker Compose."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose."
    exit 1
fi

echo "✅ Docker и Docker Compose найдены"
echo ""

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker compose down

echo ""
echo "🔨 Сборка и запуск контейнеров..."
docker compose up --build -d

echo ""
echo "⏳ Ожидание запуска сервисов..."
sleep 5

echo ""
echo "✅ Приложение запущено!"
echo ""
echo "📱 Откройте в браузере: http://localhost:8000"
echo ""
echo "🛠  Полезные команды:"
echo "  - Просмотр логов: docker compose logs -f"
echo "  - Остановка: docker compose down"
echo "  - Prisma Studio: docker compose exec app npx prisma studio"
echo ""

