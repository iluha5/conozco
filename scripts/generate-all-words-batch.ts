#!/usr/bin/env node
/**
 * Скрипт для пакетной генерации данных всех слов через LLM
 * Генерирует данные для каждого слова и сохраняет в JSON файлы
 */

import fs from 'fs/promises';
import path from 'path';

// Этот скрипт будет использоваться для генерации данных через LLM
// Данные генерируются для каждого слова отдельно в соответствии с промптом

async function main() {
    console.log('📝 This script generates word data via LLM for all words.');
    console.log(
        '💡 Word data is generated using the prompt from scripts/cursor/prompts/process-external-words.txt',
    );
    console.log(
        '📁 Generated files are saved to temp/generated/<word>-data.json',
    );
    console.log(
        '🚀 Run scripts/auto-process-all-words.ts to process generated files',
    );
}

main().catch(console.error);
