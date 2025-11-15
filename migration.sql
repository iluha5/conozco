-- CreateTable
CREATE TABLE "SentenceType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isNegative" BOOLEAN NOT NULL DEFAULT false,
    "isQuestion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SentenceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "WordStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartOfSpeech" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "roleId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordSource" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "WordSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseWord" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "partOfSpeechId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "BaseWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordTranslation" (
    "id" SERIAL NOT NULL,
    "baseWordId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "translation" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "WordTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pronoun" (
    "id" SERIAL NOT NULL,
    "pronoun" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "Pronoun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordExample" (
    "id" SERIAL NOT NULL,
    "baseWordId" INTEGER NOT NULL,
    "pronounId" INTEGER NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "translationLanguageId" INTEGER NOT NULL,
    "sentenceTypeId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "WordExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tense" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "Tense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammaticalExample" (
    "id" SERIAL NOT NULL,
    "baseWordId" INTEGER NOT NULL,
    "tenseId" INTEGER NOT NULL,
    "pronounId" INTEGER NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "translationLanguageId" INTEGER NOT NULL,
    "sentenceTypeId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,

    CONSTRAINT "GrammaticalExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "baseWordId" INTEGER,
    "customWord" TEXT,
    "customTranslation" TEXT,
    "languageId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiRequestLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "sourceId" INTEGER NOT NULL,
    "sourceLanguageId" INTEGER,
    "targetLanguageId" INTEGER,
    "requestType" TEXT NOT NULL,
    "requestData" TEXT NOT NULL,
    "responseData" TEXT,
    "statusCode" INTEGER,
    "errorMessage" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiRequestLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SentenceType_code_key" ON "SentenceType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SentenceType_isNegative_isQuestion_key" ON "SentenceType"("isNegative", "isQuestion");

-- CreateIndex
CREATE UNIQUE INDEX "WordStatus_code_key" ON "WordStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_code_key" ON "UserRole"("code");

-- CreateIndex
CREATE INDEX "PartOfSpeech_languageId_idx" ON "PartOfSpeech"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_name_languageId_key" ON "PartOfSpeech"("name", "languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_code_idx" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WordSource_code_key" ON "WordSource"("code");

-- CreateIndex
CREATE INDEX "BaseWord_languageId_partOfSpeechId_idx" ON "BaseWord"("languageId", "partOfSpeechId");

-- CreateIndex
CREATE INDEX "BaseWord_sourceId_idx" ON "BaseWord"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseWord_word_languageId_key" ON "BaseWord"("word", "languageId");

-- CreateIndex
CREATE INDEX "WordTranslation_baseWordId_idx" ON "WordTranslation"("baseWordId");

-- CreateIndex
CREATE INDEX "WordTranslation_languageId_idx" ON "WordTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "WordTranslation_baseWordId_languageId_priority_key" ON "WordTranslation"("baseWordId", "languageId", "priority");

-- CreateIndex
CREATE INDEX "Pronoun_languageId_idx" ON "Pronoun"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Pronoun_pronoun_languageId_key" ON "Pronoun"("pronoun", "languageId");

-- CreateIndex
CREATE INDEX "WordExample_baseWordId_idx" ON "WordExample"("baseWordId");

-- CreateIndex
CREATE INDEX "WordExample_sentenceTypeId_idx" ON "WordExample"("sentenceTypeId");

-- CreateIndex
CREATE INDEX "WordExample_sourceId_idx" ON "WordExample"("sourceId");

-- CreateIndex
CREATE INDEX "WordExample_translationLanguageId_idx" ON "WordExample"("translationLanguageId");

-- CreateIndex
CREATE INDEX "Tense_languageId_idx" ON "Tense"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Tense_name_languageId_key" ON "Tense"("name", "languageId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_baseWordId_tenseId_idx" ON "GrammaticalExample"("baseWordId", "tenseId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_tenseId_idx" ON "GrammaticalExample"("tenseId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_sentenceTypeId_idx" ON "GrammaticalExample"("sentenceTypeId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_sourceId_idx" ON "GrammaticalExample"("sourceId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_translationLanguageId_idx" ON "GrammaticalExample"("translationLanguageId");

-- CreateIndex
CREATE INDEX "Word_userId_languageId_statusId_idx" ON "Word"("userId", "languageId", "statusId");

-- CreateIndex
CREATE INDEX "Word_languageId_idx" ON "Word"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_baseWordId_key" ON "Word"("userId", "baseWordId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_customWord_languageId_key" ON "Word"("userId", "customWord", "languageId");

-- CreateIndex
CREATE INDEX "CustomTranslation_wordId_idx" ON "CustomTranslation"("wordId");

-- CreateIndex
CREATE INDEX "CustomTranslation_userId_idx" ON "CustomTranslation"("userId");

-- CreateIndex
CREATE INDEX "CustomTranslation_originalLanguageId_idx" ON "CustomTranslation"("originalLanguageId");

-- CreateIndex
CREATE INDEX "CustomTranslation_translationLanguageId_idx" ON "CustomTranslation"("translationLanguageId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomTranslation_wordId_userId_key" ON "CustomTranslation"("wordId", "userId");

-- CreateIndex
CREATE INDEX "TrainingSession_wordId_stage_idx" ON "TrainingSession"("wordId", "stage");

-- CreateIndex
CREATE INDEX "ApiRequestLog_userId_idx" ON "ApiRequestLog"("userId");

-- CreateIndex
CREATE INDEX "ApiRequestLog_sourceId_createdAt_idx" ON "ApiRequestLog"("sourceId", "createdAt");

-- CreateIndex
CREATE INDEX "ApiRequestLog_sourceLanguageId_idx" ON "ApiRequestLog"("sourceLanguageId");

-- CreateIndex
CREATE INDEX "ApiRequestLog_targetLanguageId_idx" ON "ApiRequestLog"("targetLanguageId");

-- CreateIndex
CREATE INDEX "ApiRequestLog_createdAt_idx" ON "ApiRequestLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pronoun" ADD CONSTRAINT "Pronoun_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_sentenceTypeId_fkey" FOREIGN KEY ("sentenceTypeId") REFERENCES "SentenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_translationLanguageId_fkey" FOREIGN KEY ("translationLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tense" ADD CONSTRAINT "Tense_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_sentenceTypeId_fkey" FOREIGN KEY ("sentenceTypeId") REFERENCES "SentenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_tenseId_fkey" FOREIGN KEY ("tenseId") REFERENCES "Tense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_translationLanguageId_fkey" FOREIGN KEY ("translationLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "WordStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

