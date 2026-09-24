-- Rollback: deepl_en (v1)
-- Generated: 2026-09-24 17:50:51

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Удаляем только записи, созданные этой миграцией (помечены source = dm_...)
-- Примеры
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260924171514_deepl_en');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260924171514_deepl_en');

-- Переводы: явной маркировки нет в схеме, откат переводов не выполняется в v1

-- Новые BaseWord, созданные этой миграцией
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260924171514_deepl_en');

COMMIT;