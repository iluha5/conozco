# Интеграция AI-сервисов для поиска слов

Этот документ описывает интеграцию внешних сервисов для автоматического поиска переводов и примеров предложений.

## Используемые сервисы

### 1. LibreTranslate - Перевод слов

- **Назначение**: Получение перевода слова на целевой язык
- **API**: https://libretranslate.com
- **Документация**: https://docs.libretranslate.com

#### Варианты использования:

**A) Публичный сервер (по умолчанию)**

- Бесплатно с ограничениями (10-20 запросов/минуту)
- Не требует настройки
- Используется по умолчанию

**B) С API ключом**

1. Зарегистрируйтесь на https://portal.libretranslate.com/
2. Получите API ключ
3. Добавьте в `.env`:

```
LIBRETRANSLATE_API_KEY="your-api-key-here"
```

**C) Локальный сервер (рекомендуется для продакшн)**

Через Python:

```bash
pip install libretranslate
libretranslate --host 0.0.0.0 --port 5000
```

Через Docker (добавить в docker-compose.yml):

```yaml
libretranslate:
    image: libretranslate/libretranslate:latest
    restart: unless-stopped
    ports:
        - '5000:5000'
    environment:
        LT_HOST: '0.0.0.0'
```

Затем добавить в `.env`:

```
LIBRETRANSLATE_URL="http://localhost:5000"
```

### 2. Tatoeba - Примеры предложений

- **Назначение**: Получение примеров использования слова в контексте
- **API**: https://tatoeba.org/en/api_v0
- **Документация**: https://api.dev.tatoeba.org
- **Бесплатно**: ✅ Не требует регистрации и API ключей

## Функциональность

### Кнопка "Найти" в диалоге добавления слова

#### Когда кнопка активна:

- Поле поиска не пустое
- В базе данных НЕТ точного совпадения слова
- Не выполняется поиск в данный момент

#### Когда кнопка неактивна:

- Поле поиска пустое
- Найдено точное совпадение в базе
- Выполняется поиск

#### Принцип работы:

1. **Пользователь вводит слово** в поле поиска
2. **Система проверяет** наличие точных совпадений в базе
3. **Если совпадений нет** - кнопка "Найти" становится активной
4. **При клике на "Найти"**:
    - Параллельно запрашиваются LibreTranslate и Tatoeba
    - Таймаут для LibreTranslate: 10 секунд
    - Если LibreTranslate не вернул результат - показывается ошибка
    - Если LibreTranslate вернул перевод, но Tatoeba не вернул примеры:
        - Слово добавляется с переводами
        - В фоне делается до 3 попыток получить примеры из Tatoeba
5. **После успешного добавления**:
    - Слово появляется в списке пользователя
    - Показывается уведомление с количеством найденных примеров
    - Поле поиска очищается

### Логирование запросов

Все запросы к внешним API логируются в таблицу `ApiRequestLog`:

- ID пользователя
- Название сервиса (LibreTranslate / Tatoeba)
- Тип запроса (translate / search_examples)
- Данные запроса и ответа (JSON)
- HTTP статус код
- Сообщение об ошибке (если есть)
- Длительность запроса (мс)
- Время создания

#### Просмотр логов:

```sql
-- Последние 10 запросов
SELECT * FROM "ApiRequestLog" ORDER BY "createdAt" DESC LIMIT 10;

-- Статистика по сервисам
SELECT
  "serviceName",
  COUNT(*) as total,
  AVG("duration") as avg_duration_ms,
  COUNT(CASE WHEN "statusCode" >= 200 AND "statusCode" < 300 THEN 1 END) as success_count,
  COUNT(CASE WHEN "errorMessage" IS NOT NULL THEN 1 END) as error_count
FROM "ApiRequestLog"
GROUP BY "serviceName";
```

## Архитектура

### Файлы:

1. **lib/translation-api.ts** - Сервис для работы с API
    - `translateWord()` - перевод через LibreTranslate
    - `searchExamples()` - поиск примеров в Tatoeba (с повторными попытками)
    - `getWordData()` - комбинированный метод
    - `logApiRequest()` - логирование запросов

2. **app/api/ai-search/route.ts** - API endpoint для поиска
    - POST `/api/ai-search`
    - Параметры: `{ word, languageCode }`
    - Создает BaseWord, переводы, примеры и добавляет в словарь пользователя

3. **components/add-word-dialog.tsx** - UI компонент
    - Кнопка "Найти" рядом с полем поиска
    - Проверка наличия точных совпадений
    - Индикатор загрузки
    - Обработка ошибок

4. **prisma/schema.prisma** - Модель данных
    - Добавлена модель `ApiRequestLog`

## Настройка окружения

### Минимальная настройка (использует публичные сервисы):

```env
# Ничего дополнительного не требуется!
# LibreTranslate: https://libretranslate.com (публичный)
# Tatoeba: https://tatoeba.org (публичный)
```

### Рекомендуемая настройка для разработки:

```env
# Используем публичный LibreTranslate с API ключом
LIBRETRANSLATE_API_KEY="ваш-ключ"
```

### Продакшн настройка:

```env
# Используем локальный LibreTranslate
LIBRETRANSLATE_URL="http://libretranslate:5000"
```

## Ограничения и особенности

### LibreTranslate:

- Таймаут: 10 секунд
- Возвращает основной перевод + до 3 альтернатив
- Качество перевода: хорошее для основных языков

### Tatoeba:

- До 3 попыток с интервалом 2 секунды
- Возвращает до 10 примеров предложений
- Примеры - реальные предложения от носителей языка
- Качество: отличное, но не для всех слов есть примеры

## Примеры использования

### Из компонента:

```typescript
const handleAiSearch = async () => {
    const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            word: 'casa',
            languageCode: 'es',
        }),
    });
    const data = await response.json();
};
```

### Из сервиса (на бэкенде):

```typescript
import { getWordData } from '@/lib/translation-api';

const result = await getWordData('casa', 'es', 'ru', userId);
// result: {
//   word: 'casa',
//   mainTranslation: 'дом',
//   alternativeTranslations: ['дома', 'здание'],
//   examples: [
//     { sentence: 'Mi casa es grande', translation: 'Мой дом большой' }
//   ]
// }
```

## Мониторинг и отладка

### Логи в консоли:

- `LibreTranslate API error: ...` - ошибка перевода
- `Tatoeba error (attempt N/3): ...` - ошибка поиска примеров
- `Found N examples in background for "..."` - найдены примеры в фоновом режиме

### Логи в БД:

```sql
-- Ошибки за последний час
SELECT * FROM "ApiRequestLog"
WHERE "errorMessage" IS NOT NULL
  AND "createdAt" > NOW() - INTERVAL '1 hour'
ORDER BY "createdAt" DESC;
```

## Будущие улучшения

- [ ] Определение части речи через AI
- [ ] Кэширование популярных переводов
- [ ] Поддержка дополнительных языков
- [ ] Уведомление пользователя когда фоновый поиск нашел примеры
- [ ] Fallback на другие сервисы при недоступности основных
- [ ] Rate limiting для предотвращения злоупотреблений
- [ ] Дашборд для просмотра статистики API запросов
