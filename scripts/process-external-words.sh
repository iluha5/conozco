#!/bin/bash

# Process External Words Script Launcher
# Usage: ./scripts/process-external-words.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Add ~/.local/bin to PATH if not already there (for cursor-agent)
export PATH="$HOME/.local/bin:$PATH"

cd "$PROJECT_ROOT" || exit 1

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found. Please install Node.js first."
    exit 1
fi

# Check if Cursor Agent is available
if ! command -v cursor-agent &> /dev/null; then
    echo "Error: cursor-agent not found. Please ensure Cursor CLI is installed."
    echo "Install: curl https://cursor.com/install -fsS | bash"
    exit 1
fi

# Run the script
node "$SCRIPT_DIR/process-external-words/process-external-words.mjs"

