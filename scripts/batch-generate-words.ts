#!/usr/bin/env node
/**
 * Скрипт для пакетной генерации данных слов через LLM
 * Генерирует данные для всех слов из списка и сохраняет в JSON файлы
 */

import fs from 'fs/promises';
import path from 'path';

interface WordEntry {
    word: string;
    groups: string[];
}

// Этот скрипт будет использоваться для генерации данных слов
// Данные генерируются через LLM для каждого слова отдельно

async function main() {
    const wordsFile = path.join(
        __dirname,
        '..',
        'temp',
        'words-to-process.json',
    );
    const outputDir = path.join(__dirname, '..', 'temp', 'generated');

    await fs.mkdir(outputDir, { recursive: true });

    console.log('📖 Reading words list...');
    const wordsContent = await fs.readFile(wordsFile, 'utf-8');
    const words: WordEntry[] = JSON.parse(wordsContent);

    console.log(`\n📝 Found ${words.length} words`);
    console.log(
        '⚠️  This script requires LLM integration to generate word data.',
    );
    console.log('Word data should be generated using LLM for each word.');
    console.log(`\nWords to process:`);

    words.forEach((entry, index) => {
        console.log(
            `${index + 1}. ${entry.word} -> ${entry.groups.join(', ')}`,
        );
    });

    console.log(
        `\n💡 Use the LLM to generate word data for each word following the prompt from scripts/cursor/prompts/process-external-words.txt`,
    );
}

main().catch(console.error);
