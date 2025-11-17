#!/bin/bash

# Script to add test verb to database
# Usage: ./scripts/process-external-words/run-add-test-verb.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="${SCRIPT_DIR}/add-test-verb.ts"

# Check if the script exists
if [ ! -f "$SCRIPT_NAME" ]; then
    echo "Error: Script not found at $SCRIPT_NAME"
    exit 1
fi

# Run the script
echo "🚀 Adding test verb to database..."
npx tsx "$SCRIPT_NAME"

exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Test verb added successfully!"
    echo "📝 Run the pipeline to test:"
    echo "   cd $SCRIPT_DIR && ./run-full-pipeline.sh"
else
    echo ""
    echo "❌ Failed to add test verb (exit code: $exit_code)"
fi

exit $exit_code

