#!/bin/bash

# Script to run the word data import script

if [ $# -ne 1 ]; then
    echo "Usage: $0 <path-to-json-file>"
    echo "Example: $0 ./temp/example-word-data.json"
    exit 1
fi

echo "🚀 Running word data import script..."

# Run the JavaScript ES module script using node
node ./import-word-data.mjs "$1"
