#!/bin/bash

# Database Backup Script Wrapper
# This script runs the TypeScript database backup script

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔄 Running database backup..."
echo "📁 Project root: $PROJECT_ROOT"

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "📍 Using Docker for database backup"
else
    echo "❌ Docker not found. Please install Docker:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "📄 Loading environment variables from .env"
    set -a
    source "$PROJECT_ROOT/.env"
    set +a
fi

# Run the TypeScript backup script
cd "$PROJECT_ROOT"
npx tsx scripts/backup-db/backup-database.ts "$@"

echo "✅ Database backup completed!"
