-- AlterTable
ALTER TABLE "User" ADD COLUMN "interfaceLanguageId" INTEGER;
ALTER TABLE "User" ADD COLUMN "learnLanguageId" INTEGER;
ALTER TABLE "User" ADD COLUMN "ownLanguageId" INTEGER;
ALTER TABLE "User" ADD COLUMN "hasConfigured" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_interfaceLanguageId_fkey" FOREIGN KEY ("interfaceLanguageId") REFERENCES "Language"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_learnLanguageId_fkey" FOREIGN KEY ("learnLanguageId") REFERENCES "Language"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ownLanguageId_fkey" FOREIGN KEY ("ownLanguageId") REFERENCES "Language"("id") ON UPDATE CASCADE ON DELETE SET NULL;
