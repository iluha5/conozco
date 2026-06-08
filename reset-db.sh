#!/bin/bash
set -e

echo "🛑 Stopping containers..."
docker compose down

echo "🗑️  Removing database volume..."
docker volume rm flash-cards_postgres_data 2>/dev/null || true

echo "✅ Database removed!"
echo ""
echo "Start the application with:"
echo "  docker-compose up -d"
echo ""
echo "Or build and start in one step:"
echo "  docker-compose up --build -d"
