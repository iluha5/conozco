#!/bin/bash
set -e

echo "🛑 Останавливаем контейнеры..."
docker compose down

echo "🗑️  Удаляем volume с базой данных..."
docker volume rm flash-cards_postgres_data 2>/dev/null || true

echo "✅ База данных удалена!"
echo ""
echo "Теперь запустите приложение командой:"
echo "  docker-compose up -d"
echo ""
echo "Или сразу запустите с билдом:"
echo "  docker-compose up --build -d"

