# Russian to English Language Migration Plan

## Overview

This plan covers the systematic translation of all Russian text in the codebase to English, excluding Russian word examples in documentation files (which serve as database examples).

## Scope Analysis

Based on codebase analysis:
- **208 files** contain Russian text in comments
- **7 files** contain Russian text in console.log statements
- **11 markdown documentation files** need translation
- **~20 script files** in `scripts/` directory with Russian comments and logs
- **E2E test files** with Russian descriptions

## Phase 1: Scripts Directory (`scripts/`)

### Priority Files
1. `scripts/check-a1-additional-status.ts` - Russian console.log messages and comments
2. `scripts/generate-and-process-word.ts` - Russian JSDoc comments and inline comments
3. `scripts/auto-process-a1-additional-words.ts` - Russian comments and logs
4. `scripts/process-a1-additional-words.ts` - Russian comments
5. `scripts/check-a1-generation-status.ts` - Russian logs
6. `scripts/rename-spanish-word-groups.ts` - Russian comments
7. `scripts/fix-english-words-in-spanish-groups.ts` - Russian comments
8. `scripts/auto-generate-a1-word-data.ts` - Russian comments
9. `scripts/generate-a1-additional-word-data.ts` - Russian comments
10. `scripts/auto-process-all-words.ts` - Russian comments
11. `scripts/process-words-with-llm.ts` - Russian comments
12. `scripts/process-word-llm.ts` - Russian comments
13. `scripts/process-all-words-batch.ts` - Russian comments
14. `scripts/process-all-a1-words.ts` - Russian comments
15. `scripts/process-a1-words.ts` - Russian comments
16. `scripts/generate-remaining-words.ts` - Russian comments
17. `scripts/generate-and-process-all-words.ts` - Russian comments
18. `scripts/generate-all-words-batch.ts` - Russian comments
19. `scripts/generate-all-word-data.ts` - Russian comments
20. `scripts/create-all-word-data-files.ts` - Russian comments
21. `scripts/batch-generate-words.ts` - Russian comments
22. `scripts/add-word-from-json.ts` - Russian comments
23. `scripts/start-a1-additional-processing.sh` - Russian comments (if any)

### Subdirectories
- `scripts/add-word/` - Translate README and comments
- `scripts/backup-db/` - Translate README and comments
- `scripts/cursor/prompts/` - Translate prompt files (keep Russian word examples)
- `scripts/process-external-words/` - Translate all TypeScript files

### Actions
- Translate all JSDoc comments (`/** */`)
- Translate inline comments (`//`)
- Translate console.log/error/warn/info messages
- Translate error messages in try-catch blocks
- Keep Russian word examples in prompts (e.g., `"привет"` in documentation)

## Phase 2: Source Code Files

### Components (`components/`)
- Translate comments in all `.tsx` and `.ts` files
- Translate console.log statements
- Files with Russian: ~50+ component files

### Hooks (`hooks/`)
- Translate comments in all hook files
- Translate console.log statements
- Files with Russian: ~15+ hook files

### Application Code (`app/`)
- Translate comments in API routes (`app/api/**/*.ts`)
- Translate comments in page components (`app/**/*.tsx`)
- Translate console.log statements
- Files with Russian: ~10+ files

### Library Code (`lib/`)
- Translate comments in utility files
- Translate console.log statements
- Files with Russian: ~10+ files

### Types (`types/`)
- Translate comments in type definition files
- Files with Russian: ~5+ files

## Phase 3: Documentation Files

### Root Documentation
1. `USAGE.md` - Complete translation (keep Russian word examples)
2. `WORD_GROUPS_USAGE.md` - Complete translation (keep Russian word examples)
3. `WORD_GROUPS_SCHEMA.md` - Translate if contains Russian
4. `README.md` - Translate if contains Russian

### Script Documentation
1. `scripts/README-A1-ADDITIONAL.md` - Complete translation
2. `scripts/add-word/README-add-word.md` - Complete translation
3. `scripts/backup-db/README.md` - Translate if contains Russian

### Other Documentation
1. `e2e/README.md` - Complete translation
2. `hooks/README.md` - Translate if contains Russian
3. `docs/guidelines/*.md` - Translate if contains Russian

### Exclusions
- `docs/lists/**/*.txt` - Word lists (data files, keep as-is)
- Russian word examples in documentation (e.g., `"привет"` in code examples)

## Phase 4: E2E Tests (`e2e/`)

### Test Files
- Translate test descriptions in `e2e/tests/**/*.spec.ts`
- Translate comments in test files
- Translate page object descriptions
- Translate fixture comments
- Files with Russian: ~20+ test files

### Test Utilities
- Translate comments in `e2e/utils/**/*.ts`
- Translate comments in `e2e/fixtures/**/*.ts`
- Translate comments in `e2e/page-objects/**/*.ts`

## Phase 5: Configuration Files

### Config Files
- `config/training-modes.ts` - Translate comments if any
- `config/training-stages.ts` - Translate comments if any
- `config/storage-keys.ts` - Translate comments if any
- `playwright.config.ts` - Translate comments if any
- Other config files with Russian comments

## Phase 6: Verification

### Automated Checks
1. Run grep to find remaining Cyrillic characters: `grep -r "[А-Яа-яЁё]" --exclude-dir=node_modules --exclude="*.txt" .`
2. Verify no Russian in:
   - Comments (`//`, `/* */`, `/** */`)
   - Console.log statements
   - Documentation (except word examples)
   - Error messages
   - Variable/function names (should already be English)

### Manual Review
1. Check that Russian word examples in documentation are preserved
2. Verify translations are contextually appropriate
3. Ensure technical terms are correctly translated
4. Check that code functionality is not affected

## Implementation Strategy

### Approach
1. **File-by-file translation** - Process files systematically by directory
2. **Preserve functionality** - Only change text, not code logic
3. **Maintain consistency** - Use consistent terminology across files
4. **Keep examples** - Preserve Russian word examples in documentation

### Translation Guidelines
- Use clear, concise English
- Maintain technical accuracy
- Preserve code formatting and structure
- Keep emoji in console.log if present (translate text only)
- Translate error messages to be helpful in English

### Quality Assurance
- Review each file after translation
- Test scripts after translation to ensure logs are readable
- Verify documentation is clear and accurate
- Check that no functionality is broken

## Estimated File Count

- Scripts: ~25 files
- Source code: ~100+ files
- Documentation: ~11 files
- E2E tests: ~30 files
- Configuration: ~5 files

**Total: ~170+ files requiring translation**

## Implementation Todos

- [ ] **Phase 1**: Translate all Russian text in scripts/ directory: comments, console.log messages, JSDoc, error messages (~25 files)
- [ ] **Phase 2**: Translate Russian comments and logs in source code: components/, hooks/, app/, lib/, types/ (~100+ files)
- [ ] **Phase 3**: Translate all markdown documentation files while preserving Russian word examples (~11 files)
- [ ] **Phase 4**: Translate Russian text in E2E test files: descriptions, comments, page objects (~30 files)
- [ ] **Phase 5**: Translate Russian comments in configuration files (~5 files)
- [ ] **Phase 6**: Run verification checks: grep for remaining Cyrillic, manual review, test scripts

## Notes

- Russian word examples in `docs/lists/` and documentation examples should be preserved
- Translation should be done systematically to avoid missing files
- Consider using consistent terminology (e.g., "word" vs "vocabulary", "training" vs "exercise")
- Some technical terms may need research to ensure correct translation








