# Add Word

Adds words to the database via Cursor CLI: it generates translations / examples / grammatical forms with a Cursor prompt, then imports the resulting JSON. Existing words are updated, new ones inserted.

```bash
./scripts/add-word.sh <word> <lang>           # single word
./scripts/add-word.sh my-words.es.txt          # batch (one word per line)
```

Languages: `en`, `es`, `ru`. Filename must end with `.<lang>.txt`. See `example.es.txt`.

Requires `cursor-agent` in PATH, a running PostgreSQL, and project deps installed.
