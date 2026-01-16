-- Remove displayName and languageId columns from PartOfSpeech table
-- This migration aligns the database schema with the current Prisma schema

-- Drop foreign key constraint on languageId (if exists)
ALTER TABLE "PartOfSpeech" DROP CONSTRAINT IF EXISTS "PartOfSpeech_languageId_fkey";

-- Drop unique index on name and languageId (if exists)
DROP INDEX IF EXISTS "PartOfSpeech_name_languageId_key";

-- Drop index on languageId (if exists)
DROP INDEX IF EXISTS "PartOfSpeech_languageId_idx";

-- Drop displayName column (if exists)
ALTER TABLE "PartOfSpeech" DROP COLUMN IF EXISTS "displayName";

-- Drop languageId column (if exists)
ALTER TABLE "PartOfSpeech" DROP COLUMN IF EXISTS "languageId";

-- Ensure unique index on name exists (should already exist, but making sure)
CREATE UNIQUE INDEX IF NOT EXISTS "PartOfSpeech_name_key" ON "PartOfSpeech"("name");
