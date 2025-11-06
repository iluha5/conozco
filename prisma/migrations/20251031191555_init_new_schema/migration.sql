-- CreateTable
CREATE TABLE "Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "PartOfSpeech" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "PartOfSpeech_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseWord" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "partOfSpeechId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,

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
CREATE TABLE "Tense" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "languageId" INTEGER NOT NULL,

    CONSTRAINT "Tense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordExample" (
    "id" SERIAL NOT NULL,
    "baseWordId" INTEGER NOT NULL,
    "pronounId" INTEGER NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "sentenceTypeId" INTEGER NOT NULL,

    CONSTRAINT "WordExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammaticalExample" (
    "id" SERIAL NOT NULL,
    "baseWordId" INTEGER NOT NULL,
    "tenseId" INTEGER NOT NULL,
    "pronounId" INTEGER NOT NULL,
    "example" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "sentenceTypeId" INTEGER NOT NULL,

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
CREATE TABLE "TrainingSession" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_code_idx" ON "Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SentenceType_code_key" ON "SentenceType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SentenceType_isNegative_isQuestion_key" ON "SentenceType"("isNegative", "isQuestion");

-- CreateIndex
CREATE UNIQUE INDEX "WordStatus_code_key" ON "WordStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_code_key" ON "UserRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartOfSpeech_name_languageId_key" ON "PartOfSpeech"("name", "languageId");

-- CreateIndex
CREATE INDEX "PartOfSpeech_languageId_idx" ON "PartOfSpeech"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseWord_word_languageId_key" ON "BaseWord"("word", "languageId");

-- CreateIndex
CREATE INDEX "BaseWord_languageId_partOfSpeechId_idx" ON "BaseWord"("languageId", "partOfSpeechId");

-- CreateIndex
CREATE UNIQUE INDEX "WordTranslation_baseWordId_languageId_priority_key" ON "WordTranslation"("baseWordId", "languageId", "priority");

-- CreateIndex
CREATE INDEX "WordTranslation_baseWordId_idx" ON "WordTranslation"("baseWordId");

-- CreateIndex
CREATE INDEX "WordTranslation_languageId_idx" ON "WordTranslation"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Pronoun_pronoun_languageId_key" ON "Pronoun"("pronoun", "languageId");

-- CreateIndex
CREATE INDEX "Pronoun_languageId_idx" ON "Pronoun"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Tense_name_languageId_key" ON "Tense"("name", "languageId");

-- CreateIndex
CREATE INDEX "Tense_languageId_idx" ON "Tense"("languageId");

-- CreateIndex
CREATE INDEX "WordExample_baseWordId_idx" ON "WordExample"("baseWordId");

-- CreateIndex
CREATE INDEX "WordExample_sentenceTypeId_idx" ON "WordExample"("sentenceTypeId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_baseWordId_tenseId_idx" ON "GrammaticalExample"("baseWordId", "tenseId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_tenseId_idx" ON "GrammaticalExample"("tenseId");

-- CreateIndex
CREATE INDEX "GrammaticalExample_sentenceTypeId_idx" ON "GrammaticalExample"("sentenceTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_baseWordId_key" ON "Word"("userId", "baseWordId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_userId_customWord_languageId_key" ON "Word"("userId", "customWord", "languageId");

-- CreateIndex
CREATE INDEX "Word_userId_languageId_statusId_idx" ON "Word"("userId", "languageId", "statusId");

-- CreateIndex
CREATE INDEX "Word_languageId_idx" ON "Word"("languageId");

-- CreateIndex
CREATE INDEX "TrainingSession_wordId_stage_idx" ON "TrainingSession"("wordId", "stage");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartOfSpeech" ADD CONSTRAINT "PartOfSpeech_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_partOfSpeechId_fkey" FOREIGN KEY ("partOfSpeechId") REFERENCES "PartOfSpeech"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pronoun" ADD CONSTRAINT "Pronoun_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tense" ADD CONSTRAINT "Tense_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_sentenceTypeId_fkey" FOREIGN KEY ("sentenceTypeId") REFERENCES "SentenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_tenseId_fkey" FOREIGN KEY ("tenseId") REFERENCES "Tense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_pronounId_fkey" FOREIGN KEY ("pronounId") REFERENCES "Pronoun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_sentenceTypeId_fkey" FOREIGN KEY ("sentenceTypeId") REFERENCES "SentenceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "WordStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
