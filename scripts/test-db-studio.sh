#!/bin/bash

set -euo pipefail

CONTAINER_NAME="flashcards-db-test"
DEFAULT_TEST_DATABASE_URL="postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test"

if ! command -v docker &> /dev/null; then
    echo "Docker is not available. Install Docker to use the test database."
    exit 1
fi

if ! docker inspect -f '{{.State.Running}}' "$CONTAINER_NAME" 2>/dev/null | grep -qx true; then
    echo "Test database is not running. Start it with: npm run test:db:up"
    exit 1
fi

if ! docker exec "$CONTAINER_NAME" pg_isready -U flashcards_test > /dev/null 2>&1; then
    echo "Test database container is running but PostgreSQL is not ready yet."
    exit 1
fi

DATABASE_URL="${TEST_DATABASE_URL:-$DEFAULT_TEST_DATABASE_URL}"

echo "Opening Prisma Studio for test database..."
DATABASE_URL="$DATABASE_URL" npx prisma studio
