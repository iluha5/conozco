#!/usr/bin/env node
/**
 * Скрипт для обработки всех слов из списка с генерацией данных через LLM
 * Запускается в фоне и обрабатывает слова последовательно
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

// Функция для определения части речи на основе слова
function guessPartOfSpeech(word: string): string {
    const lowerWord = word.toLowerCase();

    // Числа
    if (
        /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|twentieth|hundredth|thousandth)$/.test(
            lowerWord,
        )
    ) {
        return 'NUMERAL';
    }

    // Математические операции
    if (
        /^(plus|minus|times|equals|divided|more|less|half|quarter|third|percent|point)$/.test(
            lowerWord,
        )
    ) {
        if (
            ['plus', 'minus', 'times', 'equals', 'divided'].includes(lowerWord)
        ) {
            return 'PREPOSITION';
        }
        if (['more', 'less'].includes(lowerWord)) {
            return 'ADVERB';
        }
        return 'NOUN';
    }

    // Приветствия и прощания (обычно interjections или phrases)
    const greetings = ['hello', 'hi', 'goodbye', 'bye', 'farewell', 'welcome'];
    if (greetings.includes(lowerWord)) {
        return 'INTERJECTION';
    }

    // Фразы с пробелами
    if (word.includes(' ')) {
        return 'PHRASE';
    }

    // Глаголы (проверяем по окончаниям или известным словам)
    const verbs = ['apologize', 'forgive', 'meet', 'see', 'care', 'have', 'do'];
    if (verbs.some(v => lowerWord.includes(v))) {
        return 'VERB';
    }

    // Прилагательные
    const adjectives = [
        'good',
        'nice',
        'glad',
        'pleased',
        'fine',
        'great',
        'well',
        'okay',
        'bad',
        'sorry',
    ];
    if (adjectives.includes(lowerWord)) {
        return 'ADJECTIVE';
    }

    // По умолчанию - существительное
    return 'NOUN';
}

// Генерируем базовые данные слова (упрощенная версия)
// В реальности это должно вызывать LLM API
async function generateBasicWordData(word: string): Promise<any> {
    const partOfSpeech = guessPartOfSpeech(word);

    // Базовые переводы (упрощенные, в реальности должны быть из LLM)
    const basicTranslations: Record<string, { ru: string[]; es: string[] }> = {
        hello: { ru: ['привет', 'здравствуй'], es: ['hola', 'buenos días'] },
        hi: { ru: ['привет'], es: ['hola'] },
        goodbye: {
            ru: ['до свидания', 'прощай'],
            es: ['adiós', 'hasta luego'],
        },
        bye: { ru: ['пока'], es: ['adiós', 'chao'] },
        one: { ru: ['один', 'одна', 'одно'], es: ['uno', 'una', 'un'] },
        two: { ru: ['два', 'две'], es: ['dos'] },
        three: { ru: ['три'], es: ['tres'] },
    };

    const translations = basicTranslations[word.toLowerCase()] || {
        ru: [`[перевод для ${word}]`],
        es: [`[traducción para ${word}]`],
    };

    return {
        word: word.toLowerCase(),
        partOfSpeech,
        languageCode: 'en',
        translations: [
            {
                languageCode: 'ru',
                translations: translations.ru.slice(0, 3),
            },
            {
                languageCode: 'es',
                translations: translations.es.slice(0, 3),
            },
        ],
        examples: [],
        grammaticalExamples: [],
    };
}

async function processWordEntry(
    entry: WordEntry,
    index: number,
    total: number,
): Promise<boolean> {
    try {
        console.log(`\n[${index + 1}/${total}] 🔄 Processing: ${entry.word}`);

        // Проверяем, существует ли уже слово
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
                `  ⚠️  Word already exists (ID: ${existingWord.id}), adding to groups`,
            );
            for (const groupName of entry.groups) {
                try {
                    await addWordToGroup(existingWord.id, groupName);
                    console.log(`  ✅ Added to ${groupName}`);
                } catch (error: any) {
                    if (!error.message?.includes('already')) {
                        console.log(`  ⚠️  ${groupName}: ${error.message}`);
                    }
                }
            }
            return true;
        }

        // Генерируем данные слова
        // В реальности здесь должен быть вызов LLM API
        console.log(`  🤖 Generating word data via LLM...`);
        const wordData = await generateBasicWordData(entry.word);

        // Сохраняем данные во временный файл
        const tempFile = path.join(
            __dirname,
            '..',
            'temp',
            'generated',
            `${entry.word}-data.json`,
        );
        await fs.mkdir(path.dirname(tempFile), { recursive: true });
        await fs.writeFile(tempFile, JSON.stringify(wordData, null, 2));

        // Импортируем слово
        const baseWordId = await importWordData(wordData);

        if (baseWordId) {
            console.log(`  ✅ Word created (ID: ${baseWordId})`);

            // Добавляем в группы
            for (const groupName of entry.groups) {
                try {
                    await addWordToGroup(baseWordId, groupName);
                    console.log(`  ✅ Added to ${groupName}`);
                } catch (error: any) {
                    console.log(`  ⚠️  ${groupName}: ${error.message}`);
                }
            }
            return true;
        }

        return false;
    } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}`);
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

    console.log(`\n📝 Found ${words.length} words to process`);
    console.log('🚀 Starting processing...\n');

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < words.length; i++) {
        const entry = words[i];
        const success = await processWordEntry(entry, i, words.length);

        if (success) {
            processed++;
        } else {
            errors++;
        }

        // Небольшая задержка между словами
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n\n📊 Processing complete:`);
    console.log(`  ✅ Processed: ${processed}`);
    console.log(`  ⚠️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📝 Total: ${words.length}`);

    await prisma.$disconnect();
}

main().catch(console.error);
