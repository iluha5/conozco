-- CreateTable
CREATE TABLE "UserWordGroup" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordGroupId" INTEGER NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWordGroup_userId_wordGroupId_key" ON "UserWordGroup"("userId", "wordGroupId");

-- CreateIndex
CREATE INDEX "UserWordGroup_userId_idx" ON "UserWordGroup"("userId");

-- CreateIndex
CREATE INDEX "UserWordGroup_wordGroupId_idx" ON "UserWordGroup"("wordGroupId");

-- AddForeignKey
ALTER TABLE "UserWordGroup" ADD CONSTRAINT "UserWordGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordGroup" ADD CONSTRAINT "UserWordGroup_wordGroupId_fkey" FOREIGN KEY ("wordGroupId") REFERENCES "WordGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data migration: Add existing groups to their creators
INSERT INTO "UserWordGroup" ("userId", "wordGroupId", "activatedAt")
SELECT "createdByUserId", id, NOW()
FROM "WordGroup"
WHERE "createdByUserId" IS NOT NULL
ON CONFLICT ("userId", "wordGroupId") DO NOTHING;

