-- Добавление столбца translationLanguageId в таблицу GrammaticalExample

-- Шаг 1: Добавить новый столбец (nullable)
ALTER TABLE "GrammaticalExample" ADD COLUMN "translationLanguageId" INTEGER;

-- Шаг 2: Заполнить существующие записи значением ID русского языка
-- Предполагаем, что все текущие переводы на русский язык
UPDATE "GrammaticalExample"
SET "translationLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'ru')
WHERE "translationLanguageId" IS NULL;

-- Шаг 3: Сделать столбец NOT NULL
ALTER TABLE "GrammaticalExample" ALTER COLUMN "translationLanguageId" SET NOT NULL;

-- Шаг 4: Создать индекс для нового столбца
CREATE INDEX "GrammaticalExample_translationLanguageId_idx" ON "GrammaticalExample"("translationLanguageId");

-- Шаг 5: Добавить внешний ключ
ALTER TABLE "GrammaticalExample" ADD CONSTRAINT "GrammaticalExample_translationLanguageId_fkey" FOREIGN KEY ("translationLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
