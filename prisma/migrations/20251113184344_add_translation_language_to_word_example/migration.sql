-- Добавление столбца translationLanguageId в таблицу WordExample

-- Шаг 1: Добавить новый столбец (nullable)
ALTER TABLE "WordExample" ADD COLUMN "translationLanguageId" INTEGER;

-- Шаг 2: Заполнить существующие записи значением ID русского языка
-- Предполагаем, что все текущие переводы на русский язык
UPDATE "WordExample" 
SET "translationLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'ru')
WHERE "translationLanguageId" IS NULL;

-- Шаг 3: Сделать столбец NOT NULL
ALTER TABLE "WordExample" ALTER COLUMN "translationLanguageId" SET NOT NULL;

-- Шаг 4: Создать индекс для нового столбца
CREATE INDEX "WordExample_translationLanguageId_idx" ON "WordExample"("translationLanguageId");

-- Шаг 5: Добавить внешний ключ
ALTER TABLE "WordExample" ADD CONSTRAINT "WordExample_translationLanguageId_fkey" FOREIGN KEY ("translationLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

