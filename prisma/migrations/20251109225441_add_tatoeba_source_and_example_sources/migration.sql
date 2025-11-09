-- Add TATOEBA source to WordSource
INSERT INTO "WordSource" ("code", "displayName") VALUES
    ('TATOEBA', 'Tatoeba');

-- Add sourceId to WordExample (nullable first)
ALTER TABLE "WordExample" ADD COLUMN "sourceId" INTEGER;

-- Set default source for all existing WordExample to 'native'
UPDATE "WordExample" SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'native');

-- Make sourceId NOT NULL in WordExample
ALTER TABLE "WordExample" ALTER COLUMN "sourceId" SET NOT NULL;

-- AddForeignKey for WordExample
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex for WordExample
CREATE INDEX "WordExample_sourceId_idx" ON "WordExample"("sourceId");

-- Add sourceId to GrammaticalExample (nullable first)
ALTER TABLE "GrammaticalExample" ADD COLUMN "sourceId" INTEGER;

-- Set default source for all existing GrammaticalExample to 'native'
UPDATE "GrammaticalExample" SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'native');

-- Make sourceId NOT NULL in GrammaticalExample
ALTER TABLE "GrammaticalExample" ALTER COLUMN "sourceId" SET NOT NULL;

-- AddForeignKey for GrammaticalExample
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex for GrammaticalExample
CREATE INDEX "GrammaticalExample_sourceId_idx" ON "GrammaticalExample"("sourceId");

