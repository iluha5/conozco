-- Обновляем существующие группы слов, устанавливая испанский язык
UPDATE "WordGroup" 
SET "languageId" = (SELECT "id" FROM "Language" WHERE "code" = 'es')
WHERE "languageId" IS NULL;

-- Изменяем поле languageId на обязательное (NOT NULL)
ALTER TABLE "WordGroup" ALTER COLUMN "languageId" SET NOT NULL;

