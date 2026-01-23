-- Rollback: words_to_fix (v1)
-- Generated: 2026-01-23 20:59:23

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Удаляем только записи, созданные этой миграцией (помечены source = dm_...)
-- Примеры
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260123205923_words_to_fix');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260123205923_words_to_fix');

-- Переводы: явной маркировки нет в схеме, откат переводов не выполняется в v1

-- Новые BaseWord, созданные этой миграцией
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260123205923_words_to_fix');

COMMIT;