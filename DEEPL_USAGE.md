# 🚀 Как использовать DeepL интеграцию

## ✅ Текущий статус

✅ DeepL API интегрирован  
✅ Fallback на MyMemory работает  
✅ Миграции применены  
✅ Seed обновлен  
✅ API endpoint обновлен

## 📝 Использование в интерфейсе

1. **Откройте приложение**

    ```bash
    npm run dev
    ```

2. **Перейдите в "Словарь" → "Добавить слово из словаря"**

3. **Введите испанское слово** (например: `casa`, `perro`, `amor`)

4. **Нажмите кнопку "Добавить"**

5. **Результат:**
    - 🔵 Если DeepL работает → слово будет добавлено с источником `DEEPL`
    - 🟡 Если DeepL недоступен → слово будет добавлено с источником `MYMEMORY`
    - 🟢 Примеры предложений будут добавлены с источником `TATOEBA`

## 🔍 Как проверить какой источник использовался

### Через БД:

```sql
-- Последние добавленные слова с источниками
SELECT
    bw.word,
    ws."displayName" as source,
    bw."createdAt"
FROM "BaseWord" bw
JOIN "WordSource" ws ON bw."sourceId" = ws.id
ORDER BY bw.id DESC
LIMIT 10;
```

### Через логи:

Смотрите в консоль Docker logs:

```bash
docker logs flashcards-app | grep "Translation"
```

Вы увидите:

```
[Translation] Starting translation for "casa"
[DeepL] Translation successful on attempt 1/3
[Translation] DeepL translation successful
```

Или при fallback:

```
[Translation] Starting translation for "casa"
[DeepL] Failed after 3 attempts: ...
[Translation] DeepL failed: ... Falling back to MyMemory...
[Translation] MyMemory fallback successful
```

## 📊 Мониторинг использования

### Логи API запросов:

```sql
-- Последние запросы к API
SELECT
    "serviceName",
    "requestType",
    "statusCode",
    "duration" || ' ms' as duration,
    LEFT("requestData", 50) || '...' as request,
    "createdAt"
FROM "ApiRequestLog"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### Статистика по источникам:

```sql
-- Сколько слов от каждого источника
SELECT
    ws."displayName",
    COUNT(*) as total_words
FROM "BaseWord" bw
JOIN "WordSource" ws ON bw."sourceId" = ws.id
GROUP BY ws."displayName"
ORDER BY total_words DESC;
```

## 🛠️ Troubleshooting

### Проблема: DeepL всегда использует fallback на MyMemory

**Решение:**

1. Проверьте что API ключ в `.env`:

    ```bash
    grep DEEPL_API_KEY .env
    ```

2. Проверьте формат ключа (должен иметь суффикс `:fx` для Free плана):

    ```
    DEEPL_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
    ```

3. Перезапустите приложение:
    ```bash
    docker-compose restart
    ```

### Проблема: Превышена квота DeepL

**Симптомы:**

```
[DeepL] Failed after 3 attempts: DeepL API error: 456 Quota exceeded
```

**Решение:**

- Система автоматически переключится на MyMemory
- Квота сбрасывается в первый день каждого месяца
- Проверьте использование: https://www.deepl.com/account/usage

### Проблема: Переводы странные/неправильные

**От DeepL:**

- DeepL дает качественные переводы, но иногда может добавлять контекст
- Проверьте что вы переводите отдельные слова, а не предложения

**От MyMemory:**

- MyMemory может давать странные переводы (community-driven)
- Это нормально для fallback варианта
- Рассмотрите возможность увеличения квоты DeepL или перехода на Pro план

## 📈 Рекомендации

1. **Мониторьте использование квоты DeepL** регулярно
2. **Используйте кэширование** для популярных слов (будущее улучшение)
3. **Анализируйте логи** для оптимизации запросов
4. **Рассмотрите DeepL Pro** если нужно больше 500k символов/месяц

## 🎯 Следующие шаги

- [ ] Добавить кэширование переводов
- [ ] Показывать пользователю источник перевода в UI
- [ ] Добавить мониторинг остатка квоты DeepL
- [ ] Batch запросы для нескольких слов
