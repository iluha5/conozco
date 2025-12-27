import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface WordData {
    word: string;
    partOfSpeech: string;
    languageCode: string;
    translations: {
        languageCode: string;
        translations: string[];
    }[];
    examples: {
        pronoun: string;
        example: string;
        translations: {
            languageCode: string;
            translation: string;
        }[];
        sentenceTypeCode?: string;
        isNegative?: boolean;
        isQuestion?: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translations: {
                languageCode: string;
                translation: string;
            }[];
            sentenceTypeCode?: string;
            isNegative?: boolean;
            isQuestion?: boolean;
        }[];
    }[];
}

async function getOrCreateLanguage(code: string) {
    let language = await prisma.language.findUnique({
        where: { code },
    });

    if (!language) {
        const languageNames: Record<string, string> = {
            es: 'Spanish',
            en: 'English',
            ru: 'Russian',
        };

        language = await prisma.language.create({
            data: {
                code,
                name: languageNames[code] || code,
            },
        });
    }

    return language;
}

async function getOrCreatePartOfSpeech(name: string) {
    let partOfSpeech = await prisma.partOfSpeech.findUnique({
        where: { name },
    });

    if (!partOfSpeech) {
        partOfSpeech = await prisma.partOfSpeech.create({
            data: { name },
        });
    }

    return partOfSpeech;
}

async function getOrCreateSentenceType(
    code: string,
    isNegative: boolean,
    isQuestion: boolean,
) {
    let sentenceType = await prisma.sentenceType.findUnique({
        where: {
            isNegative_isQuestion: {
                isNegative,
                isQuestion,
            },
        },
    });

    if (!sentenceType) {
        sentenceType = await prisma.sentenceType.create({
            data: {
                code,
                displayName: code.toLowerCase().replace('_', ' '),
                isNegative,
                isQuestion,
            },
        });
    }

    return sentenceType;
}

async function getOrCreatePronoun(pronoun: string, languageId: number) {
    let pronounRecord = await prisma.pronoun.findUnique({
        where: {
            pronoun_languageId: {
                pronoun,
                languageId,
            },
        },
    });

    if (!pronounRecord) {
        pronounRecord = await prisma.pronoun.create({
            data: {
                pronoun,
                languageId,
            },
        });
    }

    return pronounRecord;
}

async function getOrCreateTense(tenseName: string, languageId: number) {
    let tense = await prisma.tense.findUnique({
        where: {
            name_languageId: {
                name: tenseName,
                languageId,
            },
        },
    });

    if (!tense) {
        tense = await prisma.tense.create({
            data: {
                name: tenseName,
                languageId,
            },
        });
    }

    return tense;
}

async function getWordSource(sourceCode: string = 'native') {
    const source = await prisma.wordSource.findUnique({
        where: { code: sourceCode },
    });

    if (!source) {
        throw new Error(`Word source with code '${sourceCode}' not found`);
    }

    return source;
}

async function importWordData(wordData: WordData): Promise<number | null> {
    const language = await getOrCreateLanguage(wordData.languageCode);
    const partOfSpeech = await getOrCreatePartOfSpeech(wordData.partOfSpeech);
    const wordSource = await getWordSource('native');

    // Проверяем, существует ли слово
    let baseWord = await prisma.baseWord.findUnique({
        where: {
            word_languageId: {
                word: wordData.word,
                languageId: language.id,
            },
        },
    });

    if (!baseWord) {
        // Создаем новое слово
        baseWord = await prisma.baseWord.create({
            data: {
                word: wordData.word,
                languageId: language.id,
                sourceId: wordSource.id,
            },
        });
        console.log(
            `➕ Created new word: ${wordData.word} (ID: ${baseWord.id})`,
        );
    } else {
        console.log(
            `📝 Found existing word: ${wordData.word} (ID: ${baseWord.id})`,
        );
    }

    // Добавляем переводы (не более 3 на язык)
    for (const translationGroup of wordData.translations) {
        const translationLanguage = await getOrCreateLanguage(
            translationGroup.languageCode,
        );

        let priority = 1;
        for (const translation of translationGroup.translations.slice(0, 3)) {
            // Проверяем, существует ли уже такой перевод
            const existingTranslation = await prisma.wordTranslation.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    languageId: translationLanguage.id,
                    translation,
                },
            });

            if (!existingTranslation) {
                await prisma.wordTranslation.upsert({
                    where: {
                        baseWordId_languageId_priority: {
                            baseWordId: baseWord.id,
                            languageId: translationLanguage.id,
                            priority,
                        },
                    },
                    update: {
                        translation,
                        partOfSpeechId: partOfSpeech.id,
                    },
                    create: {
                        baseWordId: baseWord.id,
                        languageId: translationLanguage.id,
                        translation,
                        priority: priority++,
                        partOfSpeechId: partOfSpeech.id,
                    },
                });
            }
        }
    }

    // Добавляем примеры
    for (const example of wordData.examples) {
        const pronoun = await getOrCreatePronoun(example.pronoun, language.id);

        let sentenceTypeCode = 'AFFIRMATIVE';
        if (example.sentenceTypeCode) {
            sentenceTypeCode = example.sentenceTypeCode;
        } else if (example.isQuestion && example.isNegative) {
            sentenceTypeCode = 'NEGATIVE_QUESTION';
        } else if (example.isQuestion) {
            sentenceTypeCode = 'QUESTION';
        } else if (example.isNegative) {
            sentenceTypeCode = 'NEGATIVE';
        }

        const sentenceType = await getOrCreateSentenceType(
            sentenceTypeCode,
            example.isNegative || false,
            example.isQuestion || false,
        );

        for (const translation of example.translations) {
            const translationLanguage = await getOrCreateLanguage(
                translation.languageCode,
            );

            // Проверяем, существует ли уже такой пример
            const existingExample = await prisma.wordExample.findFirst({
                where: {
                    baseWordId: baseWord.id,
                    pronounId: pronoun.id,
                    example: example.example,
                    translationLanguageId: translationLanguage.id,
                },
            });

            if (!existingExample) {
                await prisma.wordExample.create({
                    data: {
                        baseWordId: baseWord.id,
                        pronounId: pronoun.id,
                        example: example.example,
                        translation: translation.translation,
                        translationLanguageId: translationLanguage.id,
                        sentenceTypeId: sentenceType.id,
                        sourceId: wordSource.id,
                    },
                });
            }
        }
    }

    // Добавляем грамматические примеры
    for (const grammaticalExample of wordData.grammaticalExamples) {
        const tense = await getOrCreateTense(
            grammaticalExample.tenseName,
            language.id,
        );

        for (const example of grammaticalExample.examples) {
            const pronoun = await getOrCreatePronoun(
                example.pronoun,
                language.id,
            );

            let sentenceTypeCode = 'AFFIRMATIVE';
            if (example.sentenceTypeCode) {
                sentenceTypeCode = example.sentenceTypeCode;
            } else if (example.isQuestion && example.isNegative) {
                sentenceTypeCode = 'NEGATIVE_QUESTION';
            } else if (example.isQuestion) {
                sentenceTypeCode = 'QUESTION';
            } else if (example.isNegative) {
                sentenceTypeCode = 'NEGATIVE';
            }

            const sentenceType = await getOrCreateSentenceType(
                sentenceTypeCode,
                example.isNegative || false,
                example.isQuestion || false,
            );

            for (const translation of example.translations) {
                const translationLanguage = await getOrCreateLanguage(
                    translation.languageCode,
                );

                // Проверяем, существует ли уже такой грамматический пример
                const existingGrammaticalExample =
                    await prisma.grammaticalExample.findFirst({
                        where: {
                            baseWordId: baseWord.id,
                            tenseId: tense.id,
                            pronounId: pronoun.id,
                            example: example.example,
                            translationLanguageId: translationLanguage.id,
                        },
                    });

                if (!existingGrammaticalExample) {
                    await prisma.grammaticalExample.create({
                        data: {
                            baseWordId: baseWord.id,
                            tenseId: tense.id,
                            pronounId: pronoun.id,
                            example: example.example,
                            translation: translation.translation,
                            translationLanguageId: translationLanguage.id,
                            sentenceTypeId: sentenceType.id,
                            sourceId: wordSource.id,
                        },
                    });
                }
            }
        }
    }

    return baseWord.id;
}

async function getOrCreateWordGroup(
    name: string,
    languageId: number,
    userId: number = 1,
) {
    let group = await prisma.wordGroup.findUnique({
        where: { name },
    });

    if (!group) {
        group = await prisma.wordGroup.create({
            data: {
                name,
                createdByUserId: userId,
                languageId,
                visibility: 'PRIVATE',
                activeUsers: {
                    create: {
                        userId,
                    },
                },
            },
        });
        console.log(`➕ Created word group: ${name}`);
    } else {
        console.log(`📝 Found existing word group: ${name}`);
    }

    return group;
}

async function addWordToGroup(baseWordId: number, wordGroupId: number) {
    const existing = await prisma.baseWordOnWordGroup.findUnique({
        where: {
            baseWordId_wordGroupId: {
                baseWordId,
                wordGroupId,
            },
        },
    });

    if (!existing) {
        await prisma.baseWordOnWordGroup.create({
            data: {
                baseWordId,
                wordGroupId,
            },
        });
        return true;
    }

    return false;
}

async function parseWordFile(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const words: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.includes(':')) {
            continue;
        }

        // Формат: "word - translation" или просто "word"
        const match = trimmed.match(/^([^-]+?)\s*-\s*/);
        if (match) {
            const word = match[1].trim().toLowerCase();
            if (word && !words.includes(word)) {
                words.push(word);
            }
        }
    }

    return words;
}

async function main() {
    try {
        const greetingsFile =
            'docs/lists/english/a1/01-greetings-farewells.txt';
        const numbersFile = 'docs/lists/english/a1/02-numbers.txt';

        console.log('📖 Parsing word files...');
        const greetingsWords = await parseWordFile(greetingsFile);
        const numbersWords = await parseWordFile(numbersFile);

        console.log(`Found ${greetingsWords.length} words in greetings file`);
        console.log(`Found ${numbersWords.length} words in numbers file`);

        // Получаем язык английский
        const englishLanguage = await getOrCreateLanguage('en');

        // Создаем группы
        const greetingsGroup = await getOrCreateWordGroup(
            'A1: Greetings and Farewells',
            englishLanguage.id,
        );
        const numbersGroup = await getOrCreateWordGroup(
            'A1: Numbers',
            englishLanguage.id,
        );
        const allWordsGroup = await getOrCreateWordGroup(
            'A1: All Words',
            englishLanguage.id,
        );

        console.log('\n✅ Groups created/verified');
        console.log('\n📝 Words to process:');
        console.log(`  Greetings: ${greetingsWords.join(', ')}`);
        console.log(`  Numbers: ${numbersWords.join(', ')}`);

        console.log(
            '\n⚠️  This script only parses words. Word data should be generated using LLM.',
        );
        console.log(
            'Please use the LLM to generate word data for each word using the prompt from scripts/cursor/prompts/process-external-words.txt',
        );
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
