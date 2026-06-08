-- Rollback: new1 (v1)
-- Generated: 2026-02-14 19:09:05

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Delete only records created by this migration (tagged with source = dm_...)
-- Examples
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260214190905_new1');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260214190905_new1');

-- Translations: no explicit marker in schema; translation rollback is not performed in v1

-- New BaseWord rows created by this migration
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260214190905_new1');

COMMIT;