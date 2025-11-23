-- CreateEnum
CREATE TYPE "WordGroupVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'SHARED');

-- CreateTable
CREATE TABLE "WordGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdByUserId" INTEGER NOT NULL,
    "visibility" "WordGroupVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseWordOnWordGroup" (
    "baseWordId" INTEGER NOT NULL,
    "wordGroupId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaseWordOnWordGroup_pkey" PRIMARY KEY ("baseWordId","wordGroupId")
);

-- CreateTable
CREATE TABLE "WordGroupAccess" (
    "id" SERIAL NOT NULL,
    "wordGroupId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordGroupAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordGroup_name_key" ON "WordGroup"("name");

-- CreateIndex
CREATE INDEX "WordGroup_name_idx" ON "WordGroup"("name");

-- CreateIndex
CREATE INDEX "WordGroup_createdByUserId_idx" ON "WordGroup"("createdByUserId");

-- CreateIndex
CREATE INDEX "WordGroup_visibility_idx" ON "WordGroup"("visibility");

-- CreateIndex
CREATE INDEX "BaseWordOnWordGroup_baseWordId_idx" ON "BaseWordOnWordGroup"("baseWordId");

-- CreateIndex
CREATE INDEX "BaseWordOnWordGroup_wordGroupId_idx" ON "BaseWordOnWordGroup"("wordGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "WordGroupAccess_wordGroupId_userId_key" ON "WordGroupAccess"("wordGroupId", "userId");

-- CreateIndex
CREATE INDEX "WordGroupAccess_wordGroupId_idx" ON "WordGroupAccess"("wordGroupId");

-- CreateIndex
CREATE INDEX "WordGroupAccess_userId_idx" ON "WordGroupAccess"("userId");

-- AddForeignKey
ALTER TABLE "WordGroup" ADD CONSTRAINT "WordGroup_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWordOnWordGroup" ADD CONSTRAINT "BaseWordOnWordGroup_baseWordId_fkey" FOREIGN KEY ("baseWordId") REFERENCES "BaseWord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseWordOnWordGroup" ADD CONSTRAINT "BaseWordOnWordGroup_wordGroupId_fkey" FOREIGN KEY ("wordGroupId") REFERENCES "WordGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordGroupAccess" ADD CONSTRAINT "WordGroupAccess_wordGroupId_fkey" FOREIGN KEY ("wordGroupId") REFERENCES "WordGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordGroupAccess" ADD CONSTRAINT "WordGroupAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

