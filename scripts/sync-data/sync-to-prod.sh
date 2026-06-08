#!/bin/bash
set -euo pipefail

SERVER="root@164.92.130.190"
REMOTE_DIR="/opt/flashcards"
TABLES="BaseWord,WordTranslation,WordExample,WordGroup,BaseWordOnWordGroup,Pronoun,Tense,GrammaticalExample,Language,SentenceType,WordSource,PartOfSpeech"

echo "=== Syncing data to production ==="

# 1. Create backup on server
echo "Creating backup on server..."
ssh "$SERVER" "$REMOTE_DIR/scripts/server-setup/backup-db-prod.sh"

# 2. Export local data (selected tables only)
TMP_FILE="/tmp/sync-data.sql"
rm -f "$TMP_FILE"
echo "Exporting local data..."
for TABLE in ${TABLES//,/ }; do
  docker exec flashcards-db pg_dump -U flashcards -d flashcards \
    --data-only --inserts -t "\"$TABLE\"" >> "$TMP_FILE"
done

# 3. Upload to server
echo "Uploading to server..."
scp "$TMP_FILE" "$SERVER:/tmp/"

# 4. Import data on server
echo "Importing data on server..."
ssh "$SERVER" "docker exec -i flashcards-db psql -U flashcards -d flashcards < /tmp/$(basename "$TMP_FILE")"

# 5. Cleanup
rm -f "$TMP_FILE"
ssh "$SERVER" "rm -f /tmp/$(basename "$TMP_FILE")"

echo "=== Sync complete ==="
