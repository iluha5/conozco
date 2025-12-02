#!/bin/bash

# Script to run daily code review
# Usage: ./scripts/run-daily-code-review.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REVIEW_SCRIPT="${SCRIPT_DIR}/daily-code-review/daily-code-review.mjs"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if the review script exists
if [ ! -f "$REVIEW_SCRIPT" ]; then
    echo "Error: Review script not found at $REVIEW_SCRIPT"
    exit 1
fi

# Run the daily code review script
node "$REVIEW_SCRIPT"


