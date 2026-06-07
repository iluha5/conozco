-- Rollback: 03-seo-platform (v1)
-- Generated: 2026-06-07 12:05:28

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Удаляем только записи, созданные этой миграцией (помечены source = dm_...)
-- Примеры
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

-- Переводы: явной маркировки нет в схеме, откат переводов не выполняется в v1

-- Новые BaseWord, созданные этой миграцией
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

COMMIT;