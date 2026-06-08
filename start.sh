#!/bin/bash

echo "🚀 Starting Conozco application..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose down

echo ""
echo "🔨 Building and starting containers..."
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "✅ Application is running!"
echo ""
echo "📱 Open in browser: http://localhost:8000"
echo ""
echo "🛠  Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop: docker compose down"
echo "  - Prisma Studio: docker compose exec app npx prisma studio"
echo ""
