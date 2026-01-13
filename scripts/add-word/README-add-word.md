# Add Word Script

Script for adding words to flashcards database using Cursor CLI.

## Usage

### Adding a Single Word

```bash
./scripts/add-word.sh <word> <language_code>
```

Examples:

```bash
./scripts/add-word.sh hola es
./scripts/add-word.sh hello en
./scripts/add-word.sh привет ru
```

### Adding a List of Words from File

```bash
./scripts/add-word.sh <filename>.<language_code>.txt
```

Example:

```bash
./scripts/add-word.sh my-words.es.txt
```

## File Format

File must have format: `filename.<language_code>.txt`

Example content for `words.es.txt`:

```
hola
casa
comer
hablar
```

There's an example file `example.es.txt` in the script folder with several Spanish words.

## Supported Languages

- `en` - English
- `es` - Spanish
- `ru` - Russian

## How It Works

1. **Data Generation**: Script uses Cursor CLI with `process-external-words-simple.txt` prompt to generate complete word information (translations, examples, grammatical forms). Supports parsing responses in JSON and markdown block formats.

2. **Database Import**: Generated data is imported into the database. If word doesn't exist, it will be created; if it exists - updated.

3. **Error Handling**: If processing one word fails, script continues with remaining words. Includes 60-second timeout to prevent hanging.

## Requirements

- Node.js and npm
- tsx (installed automatically with project dependencies)
- Cursor CLI (`cursor-agent` must be in PATH)
- Running PostgreSQL database

## File Structure

- `scripts/add-word.sh` - shell wrapper for convenient launch
- `scripts/add-word/add-word.ts` - main TypeScript script
- `scripts/add-word/README-add-word.md` - documentation
- `scripts/add-word/example.es.txt` - example file with word list
- `scripts/cursor/prompts/process-external-words-simple.txt` - prompt for Cursor CLI
- `scripts/process-external-words/import-word-data.ts` - database import script

## Logging

Script creates temporary files in `scripts/temp/`:

- Prompt files for Cursor CLI
- JSON files for import

All temporary files are automatically deleted after execution.

## Usage Examples

### Adding a Spanish Word

```bash
./scripts/add-word.sh libro es
```

### Adding Multiple Words from File

```bash
# Using example from script folder
./scripts/add-word.sh scripts/add-word/example.es.txt

# Or creating your own file
echo -e "gato\nperro\ncasa" > my-words.es.txt
./scripts/add-word.sh my-words.es.txt
```
