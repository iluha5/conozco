-- CreateTable
CREATE TABLE "TrainingLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sessionId" TEXT NOT NULL,
    "selectedLanguage" TEXT NOT NULL,
    "totalWords" INTEGER NOT NULL,
    "completedWords" INTEGER NOT NULL,
    "totalAttempts" INTEGER NOT NULL,
    "correctAttempts" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "enabledStages" TEXT NOT NULL,
    "stagesProgress" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainingLog_sessionId_key" ON "TrainingLog"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingLog_userId_createdAt_idx" ON "TrainingLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingLog_sessionId_idx" ON "TrainingLog"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingLog_createdAt_idx" ON "TrainingLog"("createdAt");

