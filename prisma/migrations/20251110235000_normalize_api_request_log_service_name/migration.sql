-- Нормализация ApiRequestLog: замена serviceName на sourceId

-- Шаг 1: Добавить новую колонку sourceId (nullable)
ALTER TABLE "ApiRequestLog" ADD COLUMN "sourceId" INTEGER;

-- Шаг 2: Сопоставить serviceName с sourceId из таблицы WordSource
-- Обновляем записи с учетом различных вариантов написания
UPDATE "ApiRequestLog" 
SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'DEEPL')
WHERE LOWER("serviceName") IN ('deepl', 'deeplapi', 'deepl api', 'deeplapi', 'deepltranslationapi');

UPDATE "ApiRequestLog" 
SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'MYMEMORY')
WHERE LOWER("serviceName") IN ('mymemory', 'mymemoryapi', 'mymemory api', 'mymemoryapi', 'mymemorytranslationapi');

UPDATE "ApiRequestLog" 
SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'TATOEBA')
WHERE LOWER("serviceName") IN ('tatoeba', 'tatoebaapi', 'tatoeba api', 'tatoebaapi');

-- Шаг 3: Для записей, где sourceId все еще NULL, устанавливаем значение по умолчанию
-- Используем 'MYMEMORY' как fallback для неизвестных источников
UPDATE "ApiRequestLog" 
SET "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = 'MYMEMORY')
WHERE "sourceId" IS NULL;

-- Шаг 4: Удалить старый индекс с serviceName
DROP INDEX IF EXISTS "ApiRequestLog_serviceName_createdAt_idx";

-- Шаг 5: Сделать sourceId NOT NULL
ALTER TABLE "ApiRequestLog" ALTER COLUMN "sourceId" SET NOT NULL;

-- Шаг 6: Удалить старую колонку serviceName
ALTER TABLE "ApiRequestLog" DROP COLUMN "serviceName";

-- Шаг 7: Создать новые индексы
CREATE INDEX "ApiRequestLog_sourceId_createdAt_idx" ON "ApiRequestLog"("sourceId", "createdAt");
CREATE INDEX "ApiRequestLog_sourceId_idx" ON "ApiRequestLog"("sourceId");

-- Шаг 8: Добавить внешний ключ
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "WordSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

