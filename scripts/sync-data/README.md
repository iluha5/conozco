# Data Sync

`sync-to-prod.sh` syncs reference tables (BaseWord, WordTranslation, WordExample, WordGroup, Pronoun, Tense, GrammaticalExample, Language, SentenceType, WordSource, PartOfSpeech, BaseWordOnWordGroup) from local DB to production. User-owned tables (User, Session, Account, Word, TrainingSession, TrainingLog) are not synced.

A production backup is created before sync.

```bash
docker compose up -d postgres
./scripts/sync-data/sync-to-prod.sh
```

Requires SSH access to the production server and a running local DB. Inserts only (no upsert) — re-running may produce duplicates.
