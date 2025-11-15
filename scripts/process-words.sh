#!/bin/bash

# Script to run daily code review
# Usage: ./scripts/run-daily-code-review.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="${SCRIPT_DIR}/process-external-words/run-multiple-pipelines.ts"

# Check if the review script exists
if [ ! -f "$SCRIPT_NAME" ]; then
    echo "Error: Word processing script not found at $SCRIPT_NAME"
    exit 1
fi

# Run the daily code review script
npx tsx "$SCRIPT_NAME" 2

