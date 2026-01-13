#!/bin/bash

# Script to add/update English words to the flashcards database
# Usage: ./scripts/add-english-word.sh <word> | ./scripts/add-english-word.sh <file>

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/add-english-word" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Check if tsx is installed locally
if ! npx tsx --version &> /dev/null; then
    echo "❌ tsx is not available. Please install it with: npm install tsx"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Run the TypeScript script
npx tsx "$SCRIPT_DIR/add-english-word.ts" "$@"
