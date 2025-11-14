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
3. Сохраняет промпт в файл `temp/prompt-{word}-{timestamp}.txt`
4. Создает инструкции в файле `temp/cursor-instructions-{word}-{timestamp}.txt`

**Использование:**

```bash
./scripts/process-external-words/run-process-cursor.sh
```

**Выходные файлы:**

- `temp/prompt-{word}-{timestamp}.txt` - промпт для Cursor CLI
- `temp/cursor-instructions-{word}-{timestamp}.txt` - инструкции по использованию
- `logs/process-word-cursor-{timestamp}.log` - лог выполнения

## Структура папок

```
scripts/process-external-words/
├── temp/                    # Временные файлы и JSON для импорта
│   ├── external-words-output.json
│   ├── example-word-data.json
│   ├── prompt-{word}-{timestamp}.txt
│   ├── cursor-instructions-{word}-{timestamp}.txt
│   └── cursor-result-{word}-{timestamp}.json (ожидается от Cursor)
├── logs/                    # Лог-файлы с timestamp
│   ├── get-external-words-YYYY-MM-DDTHH-MM-SS.log
│   ├── import-word-data-YYYY-MM-DDTHH-MM-SS.log
│   └── process-word-cursor-YYYY-MM-DDTHH-MM-SS.log
├── get-external-words.mjs   # Скрипт получения внешних слов
├── import-word-data.mjs     # Скрипт импорта данных
├── process-word-with-cursor.mjs # Скрипт подготовки промпта для Cursor
├── run.sh                   # Запуск получения слов
├── run-import.sh           # Запуск импорта данных
├── run-process-cursor.sh   # Запуск подготовки промпта
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
- **process-word-with-cursor.mjs**: Подготовка промптов для обработки слов через Cursor CLI с последующим импортом результатов
