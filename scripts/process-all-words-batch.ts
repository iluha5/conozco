#!/usr/bin/env node
/**
 * Скрипт для обработки всех слов с генерацией данных через LLM
 * Обрабатывает слова пакетами, генерируя данные для каждого через LLM
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { importWordData, addWordToGroup } from './process-word-llm';

const prisma = new PrismaClient();

interface WordEntry {
    word: string;
    groups: string[];
}

// Список слов, которые уже обработаны
const PROCESSED_WORDS = ['hello', 'hi', 'goodbye', 'one'];

async function processWordBatch(
    words: WordEntry[],
    startIndex: number,
    batchSize: number = 10,
) {
    const endIndex = Math.min(startIndex + batchSize, words.length);
    const batch = words.slice(startIndex, endIndex);

    console.log(
        `\n📦 Processing batch ${Math.floor(startIndex / batchSize) + 1}: words ${startIndex + 1}-${endIndex}`,
    );

    for (const entry of batch) {
        if (PROCESSED_WORDS.includes(entry.word.toLowerCase())) {
            console.log(`  ⏭️  Skipping ${entry.word} (already processed)`);
            continue;
        }

        try {
            console.log(`\n  🔄 Processing: ${entry.word}`);

            // Проверяем, существует ли слово
            const englishLanguage = await prisma.language.findUnique({
                where: { code: 'en' },
            });

            if (!englishLanguage) {
                throw new Error('English language not found');
            }

            const existingWord = await prisma.baseWord.findUnique({
                where: {
                    word_languageId: {
                        word: entry.word.toLowerCase(),
                        languageId: englishLanguage.id,
                    },
                },
            });

            if (existingWord) {
                console.log(
                    `    ⚠️  Word already exists (ID: ${existingWord.id}), adding to groups`,
                );
                for (const groupName of entry.groups) {
                    try {
                        await addWordToGroup(existingWord.id, groupName);
                        console.log(`    ✅ Added to ${groupName}`);
                    } catch (error: any) {
                        if (
                            !error.message?.includes('already') &&
                            !error.message?.includes('not found')
                        ) {
                            console.log(
                                `    ⚠️  ${groupName}: ${error.message}`,
                            );
                        }
                    }
                }
                continue;
            }

            console.log(
                `    ⚠️  Word data for "${entry.word}" needs to be generated via LLM`,
            );
            console.log(
                `    💡 Please generate word data using the prompt and add it manually`,
            );
            console.log(
                `    📝 Use: npx tsx scripts/add-word-from-json.ts <json-file> ${entry.groups.map(g => `"${g}"`).join(' ')}`,
            );
        } catch (error: any) {
            console.error(
                `    ❌ Error processing ${entry.word}:`,
                error.message,
            );
        }
    }
}

async function main() {
    const wordsFile = path.join(
        __dirname,
        '..',
        'temp',
        'words-to-process.json',
    );

    console.log('📖 Reading words list...');
    const wordsContent = await fs.readFile(wordsFile, 'utf-8');
    const words: WordEntry[] = JSON.parse(wordsContent);

    console.log(`\n📝 Found ${words.length} words to process`);
    console.log(`✅ Already processed: ${PROCESSED_WORDS.join(', ')}`);
    console.log(`\n🚀 Starting batch processing...`);

    const BATCH_SIZE = 10;
    const totalBatches = Math.ceil(words.length / BATCH_SIZE);

    for (let i = 0; i < words.length; i += BATCH_SIZE) {
        await processWordBatch(words, i, BATCH_SIZE);

        if (i + BATCH_SIZE < words.length) {
            console.log(`\n⏳ Waiting before next batch...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`\n\n📊 Processing complete!`);
    console.log(`\n💡 To process remaining words:`);
    console.log(`   1. Generate word data using LLM for each word`);
    console.log(`   2. Save data to JSON file in temp/generated/`);
    console.log(
        `   3. Run: npx tsx scripts/add-word-from-json.ts <json-file> <group1> <group2> ...`,
    );

    await prisma.$disconnect();
}

main().catch(console.error);
