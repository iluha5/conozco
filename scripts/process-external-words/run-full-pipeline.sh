#!/bin/bash

# Script to run the complete external words processing pipeline

echo "🚀 Running complete external words processing pipeline..."

# Step 1: Get external words
echo "📥 Step 1: Getting external words..."
./run-external-words.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to get external words"
    exit 1
fi

# Step 2: Process word with cursor (create prompt)
echo "🤖 Step 2: Creating prompt..."
./run-process-cursor.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to create prompt"
    exit 1
fi

# Step 3: Execute cursor prompt
echo "⚡ Step 3: Executing prompt with Cursor Agent..."
./run-execute-cursor.sh
if [ $? -ne 0 ]; then
    echo "❌ Failed to execute prompt"
    exit 1
fi

# Step 4: Import result to database
echo "💾 Step 4: Importing result to database..."
# Find the latest cursor result file in date folders
# First find the most recent date folder, then find the latest file in it
LATEST_DATE_FOLDER=$(find temp -maxdepth 1 -type d -name "20[0-9][0-9]-[0-9][0-9]-[0-9][0-9]" | sort | tail -1)
if [ -z "$LATEST_DATE_FOLDER" ]; then
    # Fallback to old method if no date folders found
    LATEST_RESULT=$(ls -t temp/*-cursor-result-*.json 2>/dev/null | head -1)
else
    LATEST_RESULT=$(ls -t "$LATEST_DATE_FOLDER"/*-cursor-result-*.json 2>/dev/null | head -1)
fi

if [ -z "$LATEST_RESULT" ]; then
    echo "❌ No cursor result file found"
    exit 1
fi

echo "📄 Importing file: $(basename "$LATEST_RESULT")"
./run-import.sh "$LATEST_RESULT"
if [ $? -ne 0 ]; then
    echo "❌ Failed to import data"
    exit 1
fi

echo "🎉 Pipeline completed successfully!"
echo "📊 Processed word has been added to the database"