-- Добавление языковых колонок в ApiRequestLog

-- Шаг 1: Добавить новые колонки (nullable)
ALTER TABLE "ApiRequestLog" ADD COLUMN "sourceLanguageId" INTEGER;
ALTER TABLE "ApiRequestLog" ADD COLUMN "targetLanguageId" INTEGER;

-- Шаг 2: Заполнить существующие записи значениями по умолчанию
-- Для записей перевода (translate) устанавливаем исходный язык и русский как целевой
-- Для записей примеров (search_examples) тоже устанавливаем исходный и целевой языки

-- Получаем ID языков для использования в UPDATE
-- Предполагаем, что основные языки уже существуют в таблице Language

-- Обновляем записи для испанского языка (es -> ru)
UPDATE "ApiRequestLog" 
SET 
    "sourceLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'es'),
    "targetLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'ru')
WHERE "requestData" LIKE '%es%' OR "requestData" LIKE '%spa%';

-- Обновляем записи для английского языка (en -> ru)
UPDATE "ApiRequestLog" 
SET 
    "sourceLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'en'),
    "targetLanguageId" = (SELECT "id" FROM "Language" WHERE "code" = 'ru')
WHERE "requestData" LIKE '%en%' OR "requestData" LIKE '%eng%'
    AND "sourceLanguageId" IS NULL;

-- Для остальных записей без языка устанавливаем NULL (это допустимо по схеме)
-- Записи без языков остаются с NULL значениями

-- Шаг 3: Создать индексы для новых колонок
CREATE INDEX "ApiRequestLog_sourceLanguageId_idx" ON "ApiRequestLog"("sourceLanguageId");
CREATE INDEX "ApiRequestLog_targetLanguageId_idx" ON "ApiRequestLog"("targetLanguageId");

-- Шаг 4: Добавить внешние ключи
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_sourceLanguageId_fkey" FOREIGN KEY ("sourceLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApiRequestLog" ADD CONSTRAINT "ApiRequestLog_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

