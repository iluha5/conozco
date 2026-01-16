# Data Sync Scripts

Скрипты для синхронизации данных между локальной и production базой данных.

## sync-to-prod.sh

Синхронизирует справочные данные из локальной БД в production:
- Автоматически создает бэкап production БД перед синхронизацией
- Экспортирует только справочные таблицы (BaseWord, WordTranslation, WordExample, и т.д.)
- Импортирует данные в production БД

**Синхронизируемые таблицы:**
- BaseWord
- WordTranslation
- WordExample
- WordGroup
- BaseWordOnWordGroup
- Pronoun
- Tense
- GrammaticalExample
- Language
- SentenceType
- WordSource
- PartOfSpeech

**НЕ синхронизируются:**
- User
- Session
- Account
- Word (пользовательские слова)
- TrainingSession
- TrainingLog

**Использование:**
```bash
# Убедитесь что локальная БД запущена
docker compose up -d postgres

# Запустите синхронизацию
./scripts/sync-data/sync-to-prod.sh
```

**Требования:**
- SSH доступ к production серверу
- Локальная БД должна быть запущена
- Production БД должна быть доступна через Docker

**Важно:**
- Скрипт использует только `INSERT`, без upsert
- Повторный импорт может создать дубликаты
- Для первичного переноса всех данных используйте data-only дамп (см. раздел 2 плана развертывания)
