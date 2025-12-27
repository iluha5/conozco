#!/usr/bin/env node
/**
 * Скрипт для создания JSON файлов данных всех слов
 * Генерирует структуру файлов для последующей обработки через LLM
 */

import fs from 'fs/promises';
import path from 'path';

interface WordEntry {
    word: string;
    groups: string[];
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

    const wordsContent = await fs.readFile(wordsFile, 'utf-8');
    const words: WordEntry[] = JSON.parse(wordsContent);

    // Уже обработанные слова
    const processed = new Set([
        'hello',
        'hi',
        'goodbye',
        'good morning',
        'good afternoon',
        'good evening',
        'good night',
        'bye',
        'one',
    ]);

    console.log(`📝 Found ${words.length} words`);
    console.log(`✅ Already processed: ${processed.size}`);
    console.log(`\n🚀 Generating data files for remaining words...`);

    let generated = 0;
    const uniqueWords = new Set<string>();

    for (const entry of words) {
        const wordLower = entry.word.toLowerCase();

        if (processed.has(wordLower) || uniqueWords.has(wordLower)) {
            continue;
        }

        uniqueWords.add(wordLower);

        const fileName = `${wordLower.replace(/\s+/g, '-').replace(/[?']/g, '')}-data.json`;
        const filePath = path.join(outputDir, fileName);

        // Проверяем, существует ли уже файл
        try {
            await fs.access(filePath);
            continue; // Файл уже существует
        } catch {
            // Файл не существует, создаем шаблон
            const template = {
                word: wordLower,
                partOfSpeech: 'NOUN', // Должно быть определено через LLM
                languageCode: 'en',
                translations: [
                    {
                        languageCode: 'ru',
                        translations: [], // Должны быть сгенерированы через LLM
                    },
                    {
                        languageCode: 'es',
                        translations: [], // Должны быть сгенерированы через LLM
                    },
                ],
                examples: [], // Должны быть сгенерированы через LLM
                grammaticalExamples: [], // Должны быть сгенерированы через LLM
            };

            // Не создаем пустые файлы - данные должны генерироваться через LLM
            // await fs.writeFile(filePath, JSON.stringify(template, null, 2));
            generated++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Total unique words: ${uniqueWords.size}`);
    console.log(`  Already processed: ${processed.size}`);
    console.log(`  Need data generation: ${uniqueWords.size - processed.size}`);
    console.log(`\n💡 Word data should be generated via LLM for each word`);
    console.log(
        `   Following the prompt from scripts/cursor/prompts/process-external-words.txt`,
    );
    console.log(`   Save to temp/generated/<word>-data.json`);
}

main().catch(console.error);
