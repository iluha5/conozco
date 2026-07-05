-- AlterEnum
ALTER TYPE "RateLimitAction" ADD VALUE 'EXTENSION_AUTH_TOKEN';

-- CreateTable
CREATE TABLE "ExtensionToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Chrome Extension',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ExtensionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionToken_tokenHash_key" ON "ExtensionToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ExtensionToken_userId_idx" ON "ExtensionToken"("userId");

-- CreateIndex
CREATE INDEX "ExtensionToken_tokenHash_idx" ON "ExtensionToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "ExtensionToken" ADD CONSTRAINT "ExtensionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
