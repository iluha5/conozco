-- CreateTable
CREATE TABLE "UserCookieConsent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "given" BOOLEAN NOT NULL DEFAULT false,
    "givenAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "preferences" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCookieConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCookieConsent_userId_key" ON "UserCookieConsent"("userId");

-- CreateIndex
CREATE INDEX "UserCookieConsent_userId_idx" ON "UserCookieConsent"("userId");

-- CreateIndex
CREATE INDEX "UserCookieConsent_version_idx" ON "UserCookieConsent"("version");

-- CreateIndex
CREATE INDEX "UserCookieConsent_given_idx" ON "UserCookieConsent"("given");

-- AddForeignKey
ALTER TABLE "UserCookieConsent" ADD CONSTRAINT "UserCookieConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

