# Process External Words Scripts

В этой папке находятся скрипты для обработки внешних слов из базы данных и импорта новых данных.

## Скрипты

### 1. get-external-words.mjs - Получение внешних слов

**Описание:** Получает первые 10 слов из таблицы BaseWord, которые были добавлены не вручную (source.code !== 'native').

**Использование:**

```bash
./scripts/process-external-words/run.sh
```

### 2. import-word-data.mjs - Импорт данных слова

**Описание:** Импортирует данные слова из JSON файла в базу данных. Формат JSON взят из seed-файла `lib/words-seed-data-es.ts` или `lib/words-seed-data-en.ts`.

**Формат JSON:**

```json
[
    {
        "word": "correr",
        "partOfSpeech": "VERB",
        "languageCode": "es",
        "translations": [
            {
                "languageCode": "ru",
                "translations": ["бежать", "бегать", "работать"]
            }
        ],
        "examples": [
            {
                "pronoun": "yo",
                "example": "Corro por la mañana",
                "translation": "Я бегаю по утрам",
                "sentenceTypeCode": "AFFIRMATIVE"
            }
        ],
        "grammaticalExamples": [
            {
                "tenseName": "Presente de indicativo",
                "examples": [
                    {
                        "pronoun": "yo",
                        "example": "corro",
                        "translation": "бегаю"
                    }
                ]
            }
        ]
    }
]
```

**Использование:**

```bash
./scripts/process-external-words/run-import.sh <path-to-json-file>
```

**Пример:**

```bash
./scripts/process-external-words/run-import.sh ./temp/example-word-data.json
```

**Особенности:**

- Если слово уже существует в базе, старые данные удаляются
- Создаются все необходимые связанные сущности (языки, части речи, местоимения и т.д.)
- Поддерживается полный формат из seed-файлов

### 3. process-word-with-cursor.mjs - Подготовка промпта для Cursor CLI

**Описание:** Берет первое слово из `temp/external-words-output.json` и создает промпт для обработки через Cursor CLI. Создает файлы с инструкциями и промптом для ручного выполнения.

**Требования к входному файлу:**

- Файл `temp/external-words-output.json` должен существовать
- Файл должен содержать валидный JSON массив
- Первый элемент массива должен содержать поле `word`

**Что делает скрипт:**

1. Читает первое слово из external-words-output.json
2. Создает промпт для Cursor CLI с запросом на:
    - 3 качественных перевода слова
    - 5 случайных предложений с этим словом (не больше 6 слов каждое)
3. Сохраняет промпт в файл `temp/{counter}-{word}-prompt-{timestamp}.txt`
4. Создает инструкции в файле `temp/{counter}-{word}-cursor-instructions-{timestamp}.txt`

**Использование:**

```bash
./scripts/process-external-words/run-process-cursor.sh
```

**Выходные файлы:**

- `temp/{counter}-{word}-prompt-{timestamp}.txt` - промпт для Cursor CLI
- `temp/{counter}-{word}-cursor-instructions-{timestamp}.txt` - инструкции по использованию
- `logs/{counter}-process-word-cursor-{timestamp}.log` - лог выполнения

### 4. execute-cursor-prompt.mjs - Автоматическое выполнение промпта через Cursor Agent

**Описание:** Автоматически находит последний созданный промпт-файл и выполняет его через Cursor Agent CLI, получая результат в чистом JSON формате.

**Требования:**

- Должен существовать хотя бы один файл `temp/{counter}-{word}-prompt-{timestamp}.txt`
- Cursor Agent должен быть доступен в PATH (автоматически обнаруживается в `/Applications/Cursor.app`)

**Что делает скрипт:**

1. Находит последний промпт-файл по timestamp
2. Читает содержимое промпта
3. Извлекает слово из промпта
4. Выполняет `cursor agent --print --output-format json` с промптом через stdin
5. Парсит ответ от Cursor Agent и извлекает чистый JSON
6. Сохраняет результат в `temp/{counter}-{word}-cursor-result-{timestamp}.json`

**Использование:**

```bash
./scripts/process-external-words/run-execute-cursor.sh
```

**Выходные файлы:**

- `temp/{counter}-{word}-cursor-result-{timestamp}.json` - чистый JSON результат
- `logs/{counter}-execute-cursor-prompt-{timestamp}.log` - лог выполнения

### 5. run-full-pipeline.sh - Полный автоматизированный pipeline

**Описание:** Выполняет весь процесс обработки внешних слов от начала до конца в автоматическом режиме.

**Что делает скрипт:**

1. Извлекает внешние слова из базы данных
2. Создает промпт для обработки первого слова
3. Автоматически выполняет промпт через Cursor Agent
4. Импортирует результат обратно в базу данных

**Использование:**

```bash
./scripts/process-external-words/run-full-pipeline.sh
```

**Особенности:**

- Полностью автоматизированный процесс
- Не требует ручного вмешательства
- Обрабатывает по одному слову за раз
- При повторном запуске возьмет следующее слово из списка
- Полностью автоматическое выполнение без ручного вмешательства
- Автоматическое извлечение JSON из ответа Cursor Agent
- Сохранение чистого JSON без дополнительного текста

### 6. run-multiple-pipelines.mjs - Множественные запуски pipeline

**Описание:** Запускает полный pipeline несколько раз подряд с задержкой между запусками.

**Использование:**

```bash
# Запустить 10 раз (по умолчанию)
node run-multiple-pipelines.mjs

# Запустить указанное количество раз
node run-multiple-pipelines.mjs 5
```

**Параметры:**

- `number_of_runs` (опционально): Количество запусков pipeline (по умолчанию: 10)

**Особенности:**

- Между запусками задержка 30 секунд
- Каждый запуск обрабатывает одно слово
- При ошибке в одном запуске останавливает выполнение
- Показывает прогресс выполнения

**Пример вывода:**

```
🚀 Starting 5 pipeline runs...

🏃 Starting pipeline run 1/5
══════════════════════════════════════════════════
✅ Pipeline run 1/5 completed successfully
⏳ Waiting 30 seconds before next run...
...
🎉 All pipeline runs completed successfully!
📊 Processed 5 words through the pipeline
```

## Структура папок

```
scripts/process-external-words/
├── temp/                    # Временные файлы и JSON для импорта
│   ├── external-words-output.json
│   ├── example-word-data.json
│   ├── {counter}-{word}-prompt-{timestamp}.txt
│   ├── {counter}-{word}-cursor-instructions-{timestamp}.txt
│   ├── {counter}-{word}-cursor-result-{timestamp}.json (ожидается от Cursor)
│   └── cursor-result-example.json (пример успешного результата)
├── logs/                    # Лог-файлы с counter и timestamp
│   ├── {counter}-get-external-words-{timestamp}.log
│   ├── {counter}-import-word-data-{timestamp}.log
│   ├── {counter}-process-word-cursor-{timestamp}.log
│   └── {counter}-execute-cursor-prompt-{timestamp}.log
├── get-external-words.mjs   # Скрипт получения внешних слов
├── import-word-data.mjs     # Скрипт импорта данных
├── process-word-with-cursor.mjs # Скрипт подготовки промпта для Cursor
├── execute-cursor-prompt.mjs # Скрипт выполнения промпта через Cursor
├── run-external-words.sh    # Запуск получения слов
├── run-import.sh           # Запуск импорта данных
├── run-process-cursor.sh   # Запуск подготовки промпта
├── run-execute-cursor.sh   # Запуск выполнения промпта
├── run-full-pipeline.sh    # Полный автоматизированный pipeline
├── run-multiple-pipelines.mjs # Множественные запуски pipeline
└── README.md               # Эта документация
```

## Логирование

Все скрипты создают детальные лог-файлы в папке `logs/` с названиями в формате `[script-name]-YYYY-MM-DDTHH-MM-SS.log`. Каждый лог-файл содержит:

- Время запуска скрипта
- Детальную информацию о выполняемых операциях
- Сообщения об ошибках (при наличии)
- Пути к созданным файлам

Все сообщения также выводятся в консоль во время выполнения.

## Назначение

- **get-external-words.mjs**: Извлечение слов, полученных из внешних источников (API DeepL, MyMemory, Tatoeba) для последующей обработки LLM-моделями
- **import-word-data.mjs**: Импорт обработанных данных обратно в базу данных с полной поддержкой всех связей и отношений
- **process-word-with-cursor.mjs**: Подготовка промптов для обработки слов через Cursor IDE
- **execute-cursor-prompt.mjs**: Полностью автоматическое выполнение промптов через Cursor Agent CLI
- **run-full-pipeline.sh**: Полностью автоматизированный pipeline обработки слов

## Полный рабочий процесс

### Вариант 1: Полностью автоматический (рекомендуется)

```bash
./scripts/process-external-words/run-full-pipeline.sh
```

Выполняет все шаги автоматически от начала до конца.

### Вариант 2: Пошаговое выполнение

1. **`./run-external-words.sh`** → извлекает внешние слова → `external-words-output.json`
2. **`./run-process-cursor.sh`** → создает промпт → `prompt-*.txt`
3. **`./run-execute-cursor.sh`** → автоматически выполняет промпт через Cursor Agent → `cursor-result-*.json`
4. **`./run-import.sh cursor-result-*.json`** → импортирует данные в БД

**Весь процесс полностью автоматизирован и не требует ручного вмешательства!** 🚀
