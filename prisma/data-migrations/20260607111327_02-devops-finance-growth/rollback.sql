-- Rollback: 02-devops-finance-growth (v1)
-- Generated: 2026-06-07 11:37:50

BEGIN;
SET LOCAL statement_timeout = '10min';
SET LOCAL lock_timeout = '60s';

-- Delete only records created by this migration (tagged with source = dm_...)
-- Examples
DELETE FROM "GrammaticalExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607111327_02-devops-finance-growth');

DELETE FROM "WordExample"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607111327_02-devops-finance-growth');

-- Translations: no explicit marker in schema; translation rollback is not performed in v1

-- New BaseWord rows created by this migration
DELETE FROM "BaseWord"
WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'dm_20260607111327_02-devops-finance-growth');

COMMIT;