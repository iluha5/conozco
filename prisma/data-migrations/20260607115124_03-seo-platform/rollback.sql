-- Rollback: 03-seo-platform (v1)
-- Generated: 2026-06-07 12:05:28

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Delete only records created by this migration (tagged with source = dm_...)
-- Examples
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

-- Translations: no explicit marker in schema; translation rollback is not performed in v1

-- New BaseWord rows created by this migration
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607115124_03-seo-platform');

COMMIT;