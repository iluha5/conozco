/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `BaseWord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `BaseWord` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GrammaticalExample` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GrammaticalExample` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Language` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Language` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `PartOfSpeech` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `PartOfSpeech` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Pronoun` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Pronoun` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Session` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Tense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Tense` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TrainingSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `TrainingSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Word` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Word` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `baseWordId` column on the `Word` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `WordExample` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `WordExample` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `WordTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `WordTranslation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `userId` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `BaseWord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `partOfSpeechId` on the `BaseWord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `baseWordId` on the `GrammaticalExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tenseId` on the `GrammaticalExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pronounId` on the `GrammaticalExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `PartOfSpeech` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `Pronoun` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Session` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `Tense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `wordId` on the `TrainingSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `Word` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `Word` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `baseWordId` on the `WordExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `pronounId` on the `WordExample` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `baseWordId` on the `WordTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `languageId` on the `WordTranslation` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "BaseWord" DROP CONSTRAINT "BaseWord_languageId_fkey";

-- DropForeignKey
ALTER TABLE "BaseWord" DROP CONSTRAINT "BaseWord_partOfSpeechId_fkey";

-- DropForeignKey
ALTER TABLE "GrammaticalExample" DROP CONSTRAINT "GrammaticalExample_baseWordId_fkey";

-- DropForeignKey
ALTER TABLE "GrammaticalExample" DROP CONSTRAINT "GrammaticalExample_pronounId_fkey";

-- DropForeignKey
ALTER TABLE "GrammaticalExample" DROP CONSTRAINT "GrammaticalExample_tenseId_fkey";

-- DropForeignKey
ALTER TABLE "PartOfSpeech" DROP CONSTRAINT "PartOfSpeech_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Pronoun" DROP CONSTRAINT "Pronoun_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tense" DROP CONSTRAINT "Tense_languageId_fkey";

-- DropForeignKey
ALTER TABLE "TrainingSession" DROP CONSTRAINT "TrainingSession_wordId_fkey";

-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_baseWordId_fkey";

-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Word" DROP CONSTRAINT "Word_userId_fkey";

-- DropForeignKey
ALTER TABLE "WordExample" DROP CONSTRAINT "WordExample_baseWordId_fkey";

-- DropForeignKey
ALTER TABLE "WordExample" DROP CONSTRAINT "WordExample_pronounId_fkey";

-- DropForeignKey
ALTER TABLE "WordTranslation" DROP CONSTRAINT "WordTranslation_baseWordId_fkey";

-- DropForeignKey
ALTER TABLE "WordTranslation" DROP CONSTRAINT "WordTranslation_languageId_fkey";

-- DropIndex
DROP INDEX "PartOfSpeech_name_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "BaseWord" DROP CONSTRAINT "BaseWord_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
DROP COLUMN "partOfSpeechId",
ADD COLUMN     "partOfSpeechId" INTEGER NOT NULL,
ADD CONSTRAINT "BaseWord_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GrammaticalExample" DROP CONSTRAINT "GrammaticalExample_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "baseWordId",
ADD COLUMN     "baseWordId" INTEGER NOT NULL,
DROP COLUMN "tenseId",
ADD COLUMN     "tenseId" INTEGER NOT NULL,
DROP COLUMN "pronounId",
ADD COLUMN     "pronounId" INTEGER NOT NULL,
ADD CONSTRAINT "GrammaticalExample_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Language" DROP CONSTRAINT "Language_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Language_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PartOfSpeech" DROP CONSTRAINT "PartOfSpeech_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Pronoun" DROP CONSTRAINT "Pronoun_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD CONSTRAINT "Pronoun_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tense" DROP CONSTRAINT "Tense_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD CONSTRAINT "Tense_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TrainingSession" DROP CONSTRAINT "TrainingSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "wordId",
ADD COLUMN     "wordId" INTEGER NOT NULL,
ADD CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Word" DROP CONSTRAINT "Word_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "baseWordId",
ADD COLUMN     "baseWordId" INTEGER,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD CONSTRAINT "Word_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WordExample" DROP CONSTRAINT "WordExample_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "baseWordId",
ADD COLUMN     "baseWordId" INTEGER NOT NULL,
DROP COLUMN "pronounId",
ADD COLUMN     "pronounId" INTEGER NOT NULL,
ADD CONSTRAINT "WordExample_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WordTranslation" DROP CONSTRAINT "WordTranslation_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "baseWordId",
ADD COLUMN     "baseWordId" INTEGER NOT NULL,
DROP COLUMN "languageId",
ADD COLUMN     "languageId" INTEGER NOT NULL,
ADD CONSTRAINT "WordTranslation_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "BaseWord_languageId_partOfSpeechId_idx" ON "BaseWord"("languageId", "partOfSpeechId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseWord_word_languageId_key" ON "BaseWord"("word", "languageId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_baseWordId_tenseId_idx" ON "GrammaticalExample"("baseWordId", "tenseId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_tenseId_idx" ON "GrammaticalExample"("tenseId");

-- CreateIndex
CREATE INDEX "PartOfSpeech_languageId_idx" ON "PartOfSpeech"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_name_languageId_key" ON "PartOfSpeech"("name", "languageId");

-- CreateIndex
CREATE INDEX "Pronoun_languageId_idx" ON "Pronoun"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Pronoun_pronoun_languageId_key" ON "Pronoun"("pronoun", "languageId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Tense_languageId_idx" ON "Tense"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Tense_name_languageId_key" ON "Tense"("name", "languageId");

-- CreateIndex
CREATE INDEX "TrainingSession_wordId_stage_idx" ON "TrainingSession"("wordId", "stage");

-- CreateIndex
CREATE INDEX "Word_userId_languageId_status_idx" ON "Word"("userId", "languageId", "status");

-- CreateIndex
CREATE INDEX "Word_languageId_idx" ON "Word"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_baseWordId_key" ON "Word"("userId", "baseWordId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_customWord_languageId_key" ON "Word"("userId", "customWord", "languageId");

-- CreateIndex
CREATE INDEX "WordExample_baseWordId_idx" ON "WordExample"("baseWordId");

-- CreateIndex
CREATE INDEX "WordTranslation_baseWordId_idx" ON "WordTranslation"("baseWordId");

-- CreateIndex
CREATE INDEX "WordTranslation_languageId_idx" ON "WordTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "WordTranslation_baseWordId_languageId_priority_key" ON "WordTranslation"("baseWordId", "languageId", "priority");

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pronoun" ADD CONSTRAINT "Pronoun_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tense" ADD CONSTRAINT "Tense_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_tenseId_fkey" FOREIGN KEY ("tenseId") REFERENCES "Tense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
