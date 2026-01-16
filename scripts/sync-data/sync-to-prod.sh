#!/bin/bash
set -euo pipefail

SERVER="root@164.92.130.190"
REMOTE_DIR="/opt/flashcards"
TABLES="BaseWord,WordTranslation,WordExample,WordGroup,BaseWordOnWordGroup,Pronoun,Tense,GrammaticalExample,Language,SentenceType,WordSource,PartOfSpeech"

echo "=== Syncing data to production ==="

# 1. Создать бэкап на сервере
echo "Creating backup on server..."
ssh "$SERVER" "$REMOTE_DIR/scripts/server-setup/backup-db-prod.sh"

# 2. Экспорт локальных данных (только указанные таблицы)
TMP_FILE="/tmp/sync-data.sql"
rm -f "$TMP_FILE"
echo "Exporting local data..."
for TABLE in ${TABLES//,/ }; do
  docker exec flashcards-db pg_dump -U flashcards -d flashcards \
    --data-only --inserts -t "\"$TABLE\"" >> "$TMP_FILE"
done

# 3. Отправить на сервер
echo "Uploading to server..."
scp "$TMP_FILE" "$SERVER:/tmp/"

# 4. Импортировать данные
echo "Importing data on server..."
ssh "$SERVER" "docker exec -i flashcards-db psql -U flashcards -d flashcards < /tmp/$(basename "$TMP_FILE")"

# 5. Очистка
rm -f "$TMP_FILE"
ssh "$SERVER" "rm -f /tmp/$(basename "$TMP_FILE")"

echo "=== Sync complete ==="
