-- CreateTable
CREATE TABLE "WordImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordImage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "WordTranslation" ADD COLUMN "imageId" INTEGER;

-- CreateIndex
CREATE INDEX "WordImage_url_idx" ON "WordImage"("url");

-- CreateIndex
CREATE INDEX "WordTranslation_imageId_idx" ON "WordTranslation"("imageId");

-- AddForeignKey
ALTER TABLE "WordTranslation" ADD CONSTRAINT "WordTranslation_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "WordImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

