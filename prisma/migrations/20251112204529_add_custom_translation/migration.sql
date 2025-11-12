-- CreateTable
CREATE TABLE "CustomTranslation" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "partOfSpeechId" INTEGER,
    "originalLanguageId" INTEGER NOT NULL,
    "translationLanguageId" INTEGER NOT NULL,
    "translation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomTranslation_wordId_userId_key" ON "CustomTranslation"("wordId", "userId");

-- CreateIndex
CREATE INDEX "CustomTranslation_wordId_idx" ON "CustomTranslation"("wordId");

-- CreateIndex
CREATE INDEX "CustomTranslation_userId_idx" ON "CustomTranslation"("userId");

-- CreateIndex
CREATE INDEX "CustomTranslation_originalLanguageId_idx" ON "CustomTranslation"("originalLanguageId");

-- CreateIndex
CREATE INDEX "CustomTranslation_translationLanguageId_idx" ON "CustomTranslation"("translationLanguageId");

-- AddForeignKey
ALTER TABLE "CustomTranslation" ADD CONSTRAINT "CustomTranslation_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTranslation" ADD CONSTRAINT "CustomTranslation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTranslation" ADD CONSTRAINT "CustomTranslation_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTranslation" ADD CONSTRAINT "CustomTranslation_originalLanguageId_fkey" FOREIGN KEY ("originalLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTranslation" ADD CONSTRAINT "CustomTranslation_translationLanguageId_fkey" FOREIGN KEY ("translationLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

