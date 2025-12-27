#!/usr/bin/env node
/**
 * Главный скрипт для генерации данных всех слов через LLM и их обработки
 * Генерирует данные для каждого слова последовательно и обрабатывает их
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

// Уже обработанные слова
const PROCESSED_WORDS = new Set(['hello', 'hi', 'goodbye', 'one']);

async function generateWordDataViaLLM(word: string): Promise<any> {
    // Эта функция должна вызывать LLM для генерации данных
    // Пока возвращаем null - данные будут генерироваться вручную через LLM
    console.log(`    🤖 Generating data for "${word}" via LLM...`);
    return null;
}

async function processSingleWord(entry: WordEntry): Promise<boolean> {
    const wordLower = entry.word.toLowerCase();

    if (PROCESSED_WORDS.has(wordLower)) {
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
            PROCESSED_WORDS.add(wordLower);
            return true;
        }

        // Генерируем данные через LLM
        const wordData = await generateWordDataViaLLM(entry.word);

        if (!wordData) {
            // Данные не сгенерированы - пропускаем
            return false;
        }

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
            PROCESSED_WORDS.add(wordLower);
            return true;
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

    console.log(`\n📝 Found ${words.length} words`);
    console.log(
        `✅ Already processed: ${Array.from(PROCESSED_WORDS).join(', ')}`,
    );
    console.log(`\n🚀 Starting processing...`);
    console.log(`⚠️  Word data will be generated via LLM for each word`);
    console.log(
        `\n💡 This script requires LLM integration to generate word data.`,
    );
    console.log(
        `   Please implement LLM API calls in generateWordDataViaLLM function.`,
    );

    await prisma.$disconnect();
}

main().catch(console.error);
