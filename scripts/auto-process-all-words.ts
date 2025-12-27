#!/usr/bin/env node
/**
 * Автоматический скрипт для обработки всех слов
 * Генерирует данные для каждого слова через LLM и обрабатывает их последовательно
 * Запускается в фоне
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

// Слова, которые уже обработаны
const ALREADY_PROCESSED = new Set(['hello', 'hi', 'goodbye', 'one']);

// Файл для отслеживания прогресса
const PROGRESS_FILE = path.join(
    __dirname,
    '..',
    'temp',
    'processing-progress.json',
);

async function loadProgress(): Promise<Set<string>> {
    try {
        const content = await fs.readFile(PROGRESS_FILE, 'utf-8');
        const data = JSON.parse(content);
        return new Set(data.processed || []);
    } catch {
        return new Set(ALREADY_PROCESSED);
    }
}

async function saveProgress(processed: Set<string>) {
    await fs.writeFile(
        PROGRESS_FILE,
        JSON.stringify(
            {
                processed: Array.from(processed),
                updatedAt: new Date().toISOString(),
            },
            null,
            2,
        ),
    );
}

async function processWord(
    entry: WordEntry,
    processed: Set<string>,
): Promise<boolean> {
    const wordLower = entry.word.toLowerCase();

    if (processed.has(wordLower)) {
        return true;
    }

    try {
        // Проверяем существование слова
        const englishLanguage = await prisma.language.findUnique({
            where: { code: 'en' },
        });

        if (!englishLanguage) {
            throw new Error('English language not found');
        }

        const existingWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word: wordLower,
                    languageId: englishLanguage.id,
                },
            },
        });

        if (existingWord) {
            // Добавляем в группы
            for (const groupName of entry.groups) {
                try {
                    await addWordToGroup(existingWord.id, groupName);
                } catch (error: any) {
                    // Игнорируем ошибки "уже существует"
                }
            }
            processed.add(wordLower);
            await saveProgress(processed);
            return true;
        }

        // Проверяем, есть ли уже сгенерированные данные
        const dataFile = path.join(
            __dirname,
            '..',
            'temp',
            'generated',
            `${wordLower.replace(/\s+/g, '-')}-data.json`,
        );

        try {
            const wordDataContent = await fs.readFile(dataFile, 'utf-8');
            const wordData = JSON.parse(wordDataContent);

            // Импортируем слово
            const baseWordId = await importWordData(wordData);

            if (baseWordId) {
                // Добавляем в группы
                for (const groupName of entry.groups) {
                    try {
                        await addWordToGroup(baseWordId, groupName);
                    } catch (error: any) {
                        // Игнорируем ошибки
                    }
                }
                processed.add(wordLower);
                await saveProgress(processed);
                return true;
            }
        } catch {
            // Файл не существует - данные нужно сгенерировать через LLM
            console.log(
                `    ⚠️  Word data for "${entry.word}" needs to be generated via LLM`,
            );
        }

        return false;
    } catch (error: any) {
        console.error(`    ❌ Error: ${error.message}`);
        return false;
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

    const processed = await loadProgress();

    console.log(`\n📝 Found ${words.length} words`);
    console.log(`✅ Already processed: ${processed.size}`);
    console.log(`\n🚀 Starting automatic processing...`);
    console.log(`💡 Word data files should be in temp/generated/ directory`);
    console.log(`   Files should be named: <word>-data.json`);
    console.log(`\n🔄 Processing words...\n`);

    let successCount = 0;
    let skipCount = 0;
    let needDataCount = 0;

    for (let i = 0; i < words.length; i++) {
        const entry = words[i];
        const wordLower = entry.word.toLowerCase();

        if (processed.has(wordLower)) {
            skipCount++;
            continue;
        }

        console.log(`[${i + 1}/${words.length}] Processing: ${entry.word}`);

        const success = await processWord(entry, processed);

        if (success) {
            successCount++;
            console.log(`  ✅ Success`);
        } else {
            needDataCount++;
            console.log(`  ⚠️  Needs LLM-generated data`);
        }

        // Небольшая задержка
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`\n\n📊 Processing complete:`);
    console.log(`  ✅ Processed: ${successCount}`);
    console.log(`  ⏭️  Skipped: ${skipCount}`);
    console.log(`  ⚠️  Need data: ${needDataCount}`);
    console.log(`  📝 Total: ${words.length}`);

    if (needDataCount > 0) {
        console.log(`\n💡 To generate remaining word data:`);
        console.log(`   1. Generate word data using LLM for each word`);
        console.log(`   2. Save to temp/generated/<word>-data.json`);
        console.log(`   3. Run this script again`);
    }

    await prisma.$disconnect();
}

main().catch(console.error);
