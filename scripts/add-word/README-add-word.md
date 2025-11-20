# Add Word Script

Скрипт для добавления слов в базу данных flashcards с использованием Cursor CLI.

## Использование

### Добавление одного слова

```bash
./scripts/add-word.sh <слово> <код_языка>
```

Примеры:

```bash
./scripts/add-word.sh hola es
./scripts/add-word.sh hello en
./scripts/add-word.sh привет ru
```

### Добавление списка слов из файла

```bash
./scripts/add-word.sh <имя_файла>.<код_языка>.txt
```

Пример:

```bash
./scripts/add-word.sh my-words.es.txt
```

## Формат файла

Файл должен иметь формат: `имя_файла.<код_языка>.txt`

Пример содержимого `words.es.txt`:

```
hola
casa
comer
hablar
```

В папке скрипта есть пример файла `example.es.txt` с несколькими испанскими словами.

## Поддерживаемые языки

- `en` - English
- `es` - Spanish
- `ru` - Russian

## Как это работает

1. **Генерация данных**: Скрипт использует Cursor CLI с промптом `process-external-words-simple.txt` для генерации полной информации о слове (переводы, примеры, грамматические формы). Поддерживает парсинг ответов в формате JSON и markdown блоков.

2. **Импорт в базу данных**: Сгенерированные данные импортируются в базу данных. Если слово не существует, оно будет создано; если существует - обновлено.

3. **Обработка ошибок**: Если обработка одного слова не удалась, скрипт продолжает с остальными словами. Включает таймаут 60 секунд для предотвращения зависаний.

## Требования

- Node.js и npm
- tsx (устанавливается автоматически с зависимостями проекта)
- Cursor CLI (`cursor-agent` должен быть в PATH)
- Запущенная база данных PostgreSQL

## Структура файлов

- `scripts/add-word.sh` - shell wrapper для удобного запуска
- `scripts/add-word/add-word.ts` - основной скрипт на TypeScript
- `scripts/add-word/README-add-word.md` - документация
- `scripts/add-word/example.es.txt` - пример файла со списком слов
- `scripts/cursor/prompts/process-external-words-simple.txt` - промпт для Cursor CLI
- `scripts/process-external-words/import-word-data.ts` - скрипт импорта в базу данных

## Логирование

Скрипт создает временные файлы в `scripts/temp/`:

- Промпт файлы для Cursor CLI
- JSON файлы для импорта

Все временные файлы автоматически удаляются после выполнения.

## Примеры использования

### Добавление испанского слова

```bash
./scripts/add-word.sh libro es
```

### Добавление нескольких слов из файла

```bash
# Использование примера из папки скрипта
./scripts/add-word.sh scripts/add-word/example.es.txt

# Или создание своего файла
echo -e "gato\nperro\ncasa" > my-words.es.txt
./scripts/add-word.sh my-words.es.txt
```
