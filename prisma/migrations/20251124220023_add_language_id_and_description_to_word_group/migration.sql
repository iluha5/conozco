-- AlterTable
ALTER TABLE "WordGroup" ADD COLUMN "languageId" INTEGER;
ALTER TABLE "WordGroup" ADD COLUMN "description" TEXT;

-- AddForeignKey
ALTER TABLE "WordGroup" ADD CONSTRAINT "WordGroup_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "WordGroup_languageId_idx" ON "WordGroup"("languageId");

