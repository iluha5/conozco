import { PrismaClient } from '@prisma/client';
import { importWordData, addWordToGroup } from './process-word-llm';

const prisma = new PrismaClient();

interface WordEntry {
    word: string;
    groups: string[];
    wordData: any; // WordData from LLM
}

async function processBatch(words: WordEntry[]) {
    for (const entry of words) {
        try {
            console.log(`\n🔄 Processing: ${entry.word}`);
            const baseWordId = await importWordData(entry.wordData);

            if (baseWordId) {
                for (const groupName of entry.groups) {
                    try {
                        await addWordToGroup(baseWordId, groupName);
                        console.log(`  ✅ Added to ${groupName}`);
                    } catch (error) {
                        console.error(
                            `  ❌ Error adding to ${groupName}:`,
                            error,
                        );
                    }
                }
            } else {
                console.log(`  ⚠️  Word already exists, adding to groups only`);
                // Try to find existing word and add to groups
                const englishLanguage = await prisma.language.findUnique({
                    where: { code: 'en' },
                });
                if (englishLanguage) {
                    const baseWord = await prisma.baseWord.findUnique({
                        where: {
                            word_languageId: {
                                word: entry.word,
                                languageId: englishLanguage.id,
                            },
                        },
                    });
                    if (baseWord) {
                        for (const groupName of entry.groups) {
                            try {
                                await addWordToGroup(baseWord.id, groupName);
                                console.log(`  ✅ Added to ${groupName}`);
                            } catch (error) {
                                console.error(`  ❌ Error:`, error);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error(`❌ Error processing ${entry.word}:`, error);
        }
    }
}

async function main() {
    // Words will be added here as WordEntry objects
    // This is a template - words should be added with their LLM-generated data
    const words: WordEntry[] = [];

    if (words.length === 0) {
        console.log('No words to process. Add words to the words array.');
        return;
    }

    try {
        await processBatch(words);
        console.log('\n✅ Batch processing completed');
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
