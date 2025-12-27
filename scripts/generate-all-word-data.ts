#!/usr/bin/env node
/**
 * Скрипт для автоматической генерации данных всех слов через LLM
 * Генерирует данные для каждого слова в соответствии с промптом
 * Работает в фоне
 */

import fs from 'fs/promises';
import path from 'path';

interface WordEntry {
    word: string;
    groups: string[];
}

// Функция для генерации данных слова через LLM
// В реальности здесь должен быть вызов LLM API
async function generateWordData(word: string): Promise<any> {
    // Эта функция должна вызывать LLM для генерации данных
    // Пока возвращаем структуру для заполнения
    return {
        word: word.toLowerCase(),
        partOfSpeech: 'NOUN', // Должно определяться через LLM
        languageCode: 'en',
        translations: [
            {
                languageCode: 'ru',
                translations: [], // Должны генерироваться через LLM
            },
            {
                languageCode: 'es',
                translations: [], // Должны генерироваться через LLM
            },
        ],
        examples: [], // Должны генерироваться через LLM
        grammaticalExamples: [], // Должны генерироваться через LLM
    };
}

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
    console.log('🚀 Starting data generation via LLM...');
    console.log('⚠️  This script requires LLM API integration.');
    console.log(
        '💡 Word data should be generated using the prompt from scripts/cursor/prompts/process-external-words.txt',
    );
    console.log('\n📋 Words to process:');

    words.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.word}`);
    });

    console.log(`\n💡 To generate data for each word:`);
    console.log(`   1. Use LLM to generate word data following the prompt`);
    console.log(`   2. Save to temp/generated/<word>-data.json`);
    console.log(`   3. Run: npx tsx scripts/auto-process-all-words.ts`);
}

main().catch(console.error);
