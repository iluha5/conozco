-- CreateTable
CREATE TABLE "WordSource" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,

    CONSTRAINT "WordSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordSource_code_key" ON "WordSource"("code");

-- Insert default sources
INSERT INTO "WordSource" ("code", "displayName") VALUES
    ('native', 'Вручную'),
    ('MYMEMORY', 'MyMemory Translation API');

-- AddColumn (nullable first)
ALTER TABLE "BaseWord" ADD COLUMN "sourceId" INTEGER;

-- Set default source for all existing words to 'native'
UPDATE "BaseWord" SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'native');

-- Update specific words that were added via MYMEMORY
UPDATE "BaseWord" 
SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'MYMEMORY')
WHERE "word" IN ('gato', 'perro', 'por favor', 'café', 'leche', 'cuando', 'dónde');

-- Make sourceId NOT NULL
ALTER TABLE "BaseWord" ALTER COLUMN "sourceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "BaseWord" ADD CONSTRAINT "BaseWord_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "BaseWord_sourceId_idx" ON "BaseWord"("sourceId");

