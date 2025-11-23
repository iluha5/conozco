-- DropForeignKey: Remove foreign key constraint
ALTER TABLE "BaseWord" DROP CONSTRAINT IF EXISTS "BaseWord_partOfSpeechId_fkey";

-- DropIndex: Remove index on languageId and partOfSpeechId
DROP INDEX IF EXISTS "BaseWord_languageId_partOfSpeechId_idx";

-- AlterTable: Drop partOfSpeechId column from BaseWord
ALTER TABLE "BaseWord" DROP COLUMN IF EXISTS "partOfSpeechId";

-- CreateIndex: Create new index on languageId only (replacing the old composite index)
CREATE INDEX IF NOT EXISTS "BaseWord_languageId_idx" ON "BaseWord"("languageId");

