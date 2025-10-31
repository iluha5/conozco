/*
  Warnings:

  - You are about to drop the column `partOfSpeech` on the `BaseWord` table. All the data in the column will be lost.
  - Added the required column `partOfSpeechId` to the `BaseWord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BaseWord_languageId_partOfSpeech_idx";

-- AlterTable
ALTER TABLE "BaseWord" DROP COLUMN "partOfSpeech",
ADD COLUMN     "partOfSpeechId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PartOfSpeech";

-- CreateTable
CREATE TABLE "PartOfSpeech" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_name_key" ON "PartOfSpeech"("name");

-- CreateIndex
CREATE INDEX "PartOfSpeech_languageId_idx" ON "PartOfSpeech"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_name_languageId_key" ON "PartOfSpeech"("name", "languageId");

-- CreateIndex
CREATE INDEX "BaseWord_languageId_partOfSpeechId_idx" ON "BaseWord"("languageId", "partOfSpeechId");

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
