-- Rollback: deepl_es (v1)
-- Generated: 2026-08-22 13:59:57

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Удаляем только записи, созданные этой миграцией (помечены source = dm_...)
-- Примеры
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260822135254_deepl_es');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260822135254_deepl_es');

-- Переводы: явной маркировки нет в схеме, откат переводов не выполняется в v1

-- Новые BaseWord, созданные этой миграцией
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260822135254_deepl_es');

COMMIT;