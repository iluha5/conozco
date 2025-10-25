-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'SPANISH');

-- CreateEnum
CREATE TYPE "WordStatus" AS ENUM ('NOT_LEARNED', 'LEARNED');

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "foreignWord" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "status" "WordStatus" NOT NULL DEFAULT 'NOT_LEARNED',
    "examples" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranslationCache" (
    "id" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "sourceLanguage" "Language" NOT NULL,
    "translations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranslationCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Word_language_status_idx" ON "Word"("language", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Word_foreignWord_language_key" ON "Word"("foreignWord", "language");

-- CreateIndex
CREATE INDEX "TranslationCache_sourceText_sourceLanguage_idx" ON "TranslationCache"("sourceText", "sourceLanguage");

-- CreateIndex
CREATE UNIQUE INDEX "TranslationCache_sourceText_sourceLanguage_key" ON "TranslationCache"("sourceText", "sourceLanguage");

-- CreateIndex
CREATE INDEX "TrainingSession_wordId_stage_idx" ON "TrainingSession"("wordId", "stage");

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

