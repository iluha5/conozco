-- AlterTable: Add partOfSpeechId to WordTranslation
ALTER TABLE "WordTranslation" ADD COLUMN "partOfSpeechId" INTEGER;

-- CreateIndex
CREATE INDEX "WordTranslation_partOfSpeechId_idx" ON "WordTranslation"("partOfSpeechId");

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate data: Copy partOfSpeechId from BaseWord to WordTranslation
UPDATE "WordTranslation" wt
SET "partOfSpeechId" = bw."partOfSpeechId"
FROM "BaseWord" bw
WHERE wt."baseWordId" = bw.id
  AND bw."partOfSpeechId" IS NOT NULL;

