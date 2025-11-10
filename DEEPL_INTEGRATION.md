# 🌐 Интеграция DeepL API

## 📋 Обзор

Система переводов теперь использует **DeepL API** как основной источник переводов с автоматическим fallback на **MyMemory Translation API**, если DeepL недоступен или превышена квота.

## 🏗️ Архитектура

### Модули

1. **`lib/deepl-api.ts`** - DeepL Translation API интеграция
    - 3 попытки при ошибках
    - 10-секундный timeout
    - Логирование всех запросов

2. **`lib/mymemory-api.ts`** - MyMemory Translation API (fallback)
    - Используется когда DeepL недоступен
    - Бесплатный, без API ключа

3. **`lib/translation-api.ts`** - Главный модуль переводов
    - Координирует DeepL + MyMemory + Tatoeba
    - Фильтрация и валидация переводов

## 🔄 Логика работы

```
1. Пользователь ищет слово
   ↓
2. DeepL API (попытка 1)
   ├─ Успех → Возвращаем перевод [source: DEEPL]
   └─ Ошибка → Попытка 2
      ├─ Успех → Возвращаем перевод [source: DEEPL]
      └─ Ошибка → Попытка 3
         ├─ Успех → Возвращаем перевод [source: DEEPL]
         └─ Ошибка → Fallback на MyMemory
            ├─ Успех → Возвращаем перевод [source: MYMEMORY]
            └─ Ошибка → Показываем ошибку пользователю
   ↓
3. Параллельно: Tatoeba API (примеры предложений)
   ↓
4. Сохранение в БД с указанием источника (sourceId)
```

## 📊 Источники в БД

Таблица `WordSource`:

| code       | displayName              | Использование                         |
| ---------- | ------------------------ | ------------------------------------- |
| `native`   | Вручную                  | Слова из seed или добавленные вручную |
| `DEEPL`    | DeepL Translation API    | Переводы от DeepL                     |
| `MYMEMORY` | MyMemory Translation API | Переводы от MyMemory (fallback)       |
| `TATOEBA`  | Tatoeba                  | Примеры предложений                   |

## 🔧 Настройка

### 1. API ключ DeepL

Добавьте в `.env`:

```env
DEEPL_API_KEY=your-deepl-api-key-here:fx
```

> **Важно:** Ключ Free плана имеет суффикс `:fx`

### 2. Проверка настроек

```bash
# Убедитесь что ключ в .env
grep DEEPL_API_KEY .env

# Должно вывести:
# DEEPL_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
```

## 📈 Мониторинг

### Логи API запросов

Все запросы к DeepL, MyMemory и Tatoeba логируются в таблицу `ApiRequestLog`:

```sql
SELECT
    "serviceName",
    "requestType",
    "statusCode",
    "duration",
    "errorMessage",
    "createdAt"
FROM "ApiRequestLog"
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Проверка использованных источников

```sql
SELECT
    ws."displayName" as source,
    COUNT(*) as count
FROM "BaseWord" bw
JOIN "WordSource" ws ON bw."sourceId" = ws.id
GROUP BY ws."displayName"
ORDER BY count DESC;
```

## 🚨 Обработка ошибок

### DeepL API ошибки

1. **Превышена квота (456)** - автоматический fallback на MyMemory
2. **Timeout** - retry (до 3 попыток)
3. **Недоступен** - fallback на MyMemory
4. **Неверный API ключ (403)** - fallback на MyMemory

### MyMemory API ошибки

1. **Timeout** - ошибка возвращается пользователю
2. **Недоступен** - ошибка возвращается пользователю

## 📝 Фильтрация переводов

Автоматически применяется:

1. ✂️ Удаление trailing знаков препинания (`, . ; : ! ?`)
2. 🔤 Фильтрация переводов с латинскими символами (для MyMemory)
3. 🔄 Удаление дубликатов
4. 📊 Ограничение до 3 вариантов перевода

## 🧪 Тестирование

### Ручное тестирование

1. Откройте приложение
2. Перейдите в "Добавить слово из словаря"
3. Введите испанское слово (например, `gato`)
4. Нажмите "Добавить"
5. Проверьте:
    - ✅ Перевод получен
    - ✅ Примеры предложений загружены
    - ✅ Слово добавлено в словарь

### Проверка логов

```bash
# В консоли Docker logs должны появиться:
# [Translation] Starting translation for "gato"
# [DeepL] Translation successful on attempt 1/3
# [Translation] DeepL translation successful
```

## 💰 Лимиты

### DeepL API Free

- 500,000 символов/месяц (~16,600 символов/день)
- Примерно 5-10 слов с переводами и примерами в день

### MyMemory API

- Без ограничений (community)
- Качество переводов ниже чем у DeepL

## 🔮 Будущие улучшения

1. **Кэширование** - кэшировать переводы чтобы снизить нагрузку на API
2. **Мониторинг квоты** - показывать пользователю остаток квоты DeepL
3. **Выбор источника** - позволить пользователю выбрать DeepL или MyMemory
4. **Batch запросы** - отправлять несколько слов за один запрос

## 📚 Полезные ссылки

- [DeepL API Documentation](https://www.deepl.com/docs-api)
- [MyMemory API Documentation](https://mymemory.translated.net/doc/spec.php)
- [Tatoeba API Documentation](https://tatoeba.org/en/downloads)
