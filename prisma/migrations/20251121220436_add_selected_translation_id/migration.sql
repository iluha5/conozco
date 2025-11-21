-- AlterTable
ALTER TABLE "Word" ADD COLUMN "selectedTranslationId" INTEGER;

-- CreateIndex
CREATE INDEX "Word_selectedTranslationId_idx" ON "Word"("selectedTranslationId");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_selectedTranslationId_fkey" FOREIGN KEY ("selectedTranslationId") REFERENCES "WordTranslation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

