#!/usr/bin/env node
/**
 * Скрипт для генерации данных слова через LLM и добавления в БД
 * Использование: npx tsx scripts/generate-and-process-word.ts <word> [group1] [group2] ...
 */

import { PrismaClient } from '@prisma/client';
import { importWordData, addWordToGroup } from './process-word-llm';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Промпт для генерации данных слова
const WORD_GENERATION_PROMPT = `You are a linguistic expert. Generate comprehensive word data for a given word in JSON format.

For the given word, provide translations and examples in multiple languages based on the word's source language:

- If the word is in Spanish: generate translations to Russian AND English
- If the word is in English: generate translations to Russian AND Spanish

Generate exactly this JSON structure:
{
  "word": string,
  "partOfSpeech": "NOUN" | "VERB" | "ADJECTIVE" | "ADVERB" | "PRONOUN" | "PREPOSITION" | "CONJUNCTION" | "INTERJECTION" | "NUMERAL",
  "languageCode": "en",
  "translations": [
    {
      "languageCode": "ru",
      "translations": ["translation1", "translation2", "translation3"]
    },
    {
      "languageCode": "es",
      "translations": ["translation1", "translation2", "translation3"]
    }
  ],
  "examples": [
    {
      "pronoun": "I",
      "example": "example sentence",
      "translations": [
        {"languageCode": "ru", "translation": "translation"},
        {"languageCode": "es", "translation": "translation"}
      ],
      "isQuestion": false,
      "isNegative": false
    }
  ],
  "grammaticalExamples": []
}

TRANSLATIONS:
- Generate up to 3 most popular/common translations for each word
- If the word is in English (languageCode: 'en'), generate translations in:
  * Russian (languageCode: 'ru') - up to 3 translations
  * Spanish (languageCode: 'es') - up to 3 translations

EXAMPLES GENERATION:
- Generate 5 examples for each word
- Rules:
  * 2 examples in Present Simple (affirmative)
  * 1 example in Past Simple (affirmative)
  * 1 example in Future Simple (affirmative)
  * 1 example should be interrogative (random tense)
  * 1 example should be negative (random tense)
- Sentences must be simple (maximum 5 words)
- Use only popular/common words
- Sentences should be natural and commonly used
- For each example, generate translations in Russian and Spanish
- Each translation must be a single, complete, natural sentence

GRAMMATICAL EXAMPLES (only for verbs):
- Check if word is a verb (partOfSpeech = VERB)
- For ALL tenses, generate examples for ALL pronouns appropriate for the language:
  * English: I, you, we, they, he/she/it
- For each tense, randomly select pronouns for variation:
  * ONE pronoun must be negative (isNegative: true)
  * ONE different pronoun must be interrogative (isQuestion: true)
  * All other pronouns should be affirmative
- Required tenses:
  * Present Simple
  * Past Simple
  * Future Simple
- Sentence structure: pronoun + word in correct form + necessary connectors/articles only
- Keep sentences simple and grammatically correct

IMPORTANT:
- Generate only valid JSON that matches this structure exactly
- Do not include any explanations, comments, or additional text
- Use only your linguistic knowledge (no external APIs)
- Ensure all content is natural and grammatically correct`;

async function generateWordDataUsingLLM(word: string): Promise<any> {
    // В реальной реализации здесь должен быть вызов LLM API
    // Для демонстрации возвращаем структуру, которая должна быть заполнена
    console.log(`\n🤖 Generating word data for: ${word}`);
    console.log(
        '⚠️  This requires LLM API call. Please implement LLM integration.',
    );

    // Пока возвращаем null - данные должны генерироваться через LLM
    return null;
}

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error(
            'Usage: npx tsx scripts/generate-and-process-word.ts <word> [group1] [group2] ...',
        );
        console.error(
            'Example: npx tsx scripts/generate-and-process-word.ts hello "A1: Greetings and Farewells" "A1: All Words"',
        );
        process.exit(1);
    }

    const word = args[0].toLowerCase();
    const groups = args.slice(1);

    if (groups.length === 0) {
        console.error('Error: At least one group name is required');
        process.exit(1);
    }

    try {
        console.log(`\n🔄 Processing word: ${word}`);
        console.log(`📁 Groups: ${groups.join(', ')}`);

        // Генерируем данные слова через LLM
        const wordData = await generateWordDataUsingLLM(word);

        if (!wordData) {
            console.error(
                '❌ Failed to generate word data. Please implement LLM integration.',
            );
            process.exit(1);
        }

        // Сохраняем данные во временный файл для отладки
        const tempFile = path.join(
            __dirname,
            '..',
            'temp',
            `${word}-word-data.json`,
        );
        await fs.mkdir(path.dirname(tempFile), { recursive: true });
        await fs.writeFile(tempFile, JSON.stringify(wordData, null, 2));
        console.log(`💾 Saved word data to: ${tempFile}`);

        // Импортируем слово в БД
        const baseWordId = await importWordData(wordData);

        if (baseWordId) {
            console.log(`✅ Word processed successfully (ID: ${baseWordId})`);

            // Добавляем в группы
            for (const groupName of groups) {
                try {
                    const added = await addWordToGroup(baseWordId, groupName);
                    if (added) {
                        console.log(`➕ Added word to group: ${groupName}`);
                    } else {
                        console.log(`📝 Word already in group: ${groupName}`);
                    }
                } catch (error: any) {
                    console.error(
                        `❌ Error adding to group ${groupName}:`,
                        error.message,
                    );
                }
            }
        } else {
            console.log(`⚠️  Word already exists, adding to groups only`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
