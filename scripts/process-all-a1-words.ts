import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { importWordData, addWordToGroup } from './process-word-llm';

const prisma = new PrismaClient();

interface WordEntry {
    word: string;
    groups: string[];
}

async function parseWordFile(filePath: string): Promise<WordEntry[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const words: WordEntry[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Пропускаем пустые строки, заголовки и секции
        if (
            !trimmed ||
            trimmed.includes('(') ||
            trimmed.includes(')') ||
            trimmed.includes(':') ||
            trimmed.toUpperCase() === trimmed ||
            trimmed.startsWith('#')
        ) {
            continue;
        }

        // Формат: "word - translation" или "word phrase - translation"
        const match = trimmed.match(/^([^-]+?)\s*-\s*/);
        if (match) {
            const word = match[1].trim().toLowerCase();
            if (word && word.length > 0) {
                words.push({ word, groups: [] });
            }
        }
    }

    return words;
}

async function generateWordData(word: string): Promise<any> {
    // Эта функция должна вызывать LLM для генерации данных слова
    // Пока возвращаем null, данные будут генерироваться через отдельный процесс
    return null;
}

async function processWord(
    word: string,
    groups: string[],
    wordData: any,
): Promise<boolean> {
    try {
        console.log(`\n🔄 Processing: ${word}`);
        const baseWordId = await importWordData(wordData);

        if (baseWordId) {
            for (const groupName of groups) {
                try {
                    await addWordToGroup(baseWordId, groupName);
                    console.log(`  ✅ Added to ${groupName}`);
                } catch (error: any) {
                    if (error.message?.includes('not found')) {
                        console.log(
                            `  ⚠️  Group ${groupName} not found, skipping`,
                        );
                    } else {
                        console.error(
                            `  ❌ Error adding to ${groupName}:`,
                            error,
                        );
                    }
                }
            }
            return true;
        } else {
            // Word already exists, try to add to groups
            console.log(`  ⚠️  Word already exists, adding to groups`);
            const englishLanguage = await prisma.language.findUnique({
                where: { code: 'en' },
            });
            if (englishLanguage) {
                const baseWord = await prisma.baseWord.findUnique({
                    where: {
                        word_languageId: {
                            word: word,
                            languageId: englishLanguage.id,
                        },
                    },
                });
                if (baseWord) {
                    for (const groupName of groups) {
                        try {
                            await addWordToGroup(baseWord.id, groupName);
                            console.log(`  ✅ Added to ${groupName}`);
                        } catch (error: any) {
                            if (error.message?.includes('not found')) {
                                console.log(
                                    `  ⚠️  Group ${groupName} not found`,
                                );
                            } else {
                                console.error(`  ❌ Error:`, error);
                            }
                        }
                    }
                }
            }
            return false;
        }
    } catch (error) {
        console.error(`❌ Error processing ${word}:`, error);
        return false;
    }
}

async function main() {
    const greetingsFile = 'docs/lists/english/a1/01-greetings-farewells.txt';
    const numbersFile = 'docs/lists/english/a1/02-numbers.txt';

    console.log('📖 Parsing word files...');
    const greetingsWords = await parseWordFile(greetingsFile);
    const numbersWords = await parseWordFile(numbersFile);

    // Добавляем группы к словам
    const greetingsEntries: WordEntry[] = greetingsWords.map(w => ({
        word: w.word,
        groups: ['A1: Greetings and Farewells', 'A1: All Words'],
    }));

    const numbersEntries: WordEntry[] = numbersWords.map(w => ({
        word: w.word,
        groups: ['A1: Numbers', 'A1: All Words'],
    }));

    const allWords = [...greetingsEntries, ...numbersEntries];

    console.log(`\n📝 Found ${allWords.length} words to process`);
    console.log(`  Greetings: ${greetingsEntries.length}`);
    console.log(`  Numbers: ${numbersEntries.length}`);

    // Сохраняем список слов для обработки
    const wordsListFile = path.join(
        __dirname,
        '..',
        'temp',
        'words-to-process.json',
    );
    await fs.mkdir(path.dirname(wordsListFile), { recursive: true });
    await fs.writeFile(wordsListFile, JSON.stringify(allWords, null, 2));
    console.log(`\n💾 Saved words list to: ${wordsListFile}`);

    console.log('\n⚠️  Word data should be generated using LLM for each word.');
    console.log(
        'Use the script scripts/generate-word-data.ts to generate data for each word.',
    );
    console.log(
        'Then use scripts/add-word-from-json.ts to add words to database.',
    );

    await prisma.$disconnect();
}

main().catch(console.error);
