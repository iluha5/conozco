#!/usr/bin/env node
/**
 * Скрипт для генерации данных всех оставшихся слов через LLM
 * Генерирует данные пакетами и сохраняет в JSON файлы
 */

import fs from 'fs/promises';
import path from 'path';

// Список всех уникальных слов из файлов
const ALL_WORDS = [
    // Greetings - уже обработаны: hello, hi, goodbye, good morning, good afternoon, good evening, good night, bye
    'see you later',
    'see you tomorrow',
    'see you soon',
    'see you',
    'farewell',
    'take care',
    'have a nice day',
    'have a good evening',
    'have a good weekend',
    'how are you?',
    'how are you doing?',
    "how's it going?",
    "what's up?",
    "what's new?",
    "how's everything?",
    "how's life?",
    "i'm fine",
    "i'm good",
    "i'm well",
    "i'm okay",
    "i'm great",
    "i'm doing well",
    "i'm doing fine",
    'not bad',
    'so-so',
    'could be better',
    'could be worse',
    'please',
    'thank you',
    'thanks',
    'thank you very much',
    'thanks a lot',
    'many thanks',
    "you're welcome",
    "don't mention it",
    'not at all',
    'no problem',
    'my pleasure',
    'excuse me',
    'sorry',
    "i'm sorry",
    'i apologize',
    'pardon me',
    'pardon',
    'forgive me',
    'welcome',
    'nice to meet you',
    'pleased to meet you',
    'glad to meet you',
    "it's a pleasure",
    'nice to see you',
    'good to see you',
    'long time no see',
    // Numbers - уже обработан: one
    'zero',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
    'one hundred',
    'one thousand',
    'one million',
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
    'eleventh',
    'twelfth',
    'twentieth',
    'hundredth',
    'thousandth',
    'plus',
    'minus',
    'times',
    'divided by',
    'equals',
    'is equal to',
    'more than',
    'less than',
    'half',
    'a half',
    'quarter',
    'a quarter',
    'a third',
    'percent',
    'point',
];

const PROCESSED = new Set([
    'hello',
    'hi',
    'goodbye',
    'good morning',
    'good afternoon',
    'good evening',
    'good night',
    'bye',
    'one',
    'see you later',
    'see you tomorrow',
    'see you soon',
    'see you',
    'farewell',
]);

async function main() {
    const outputDir = path.join(__dirname, '..', 'temp', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const remaining = ALL_WORDS.filter(w => !PROCESSED.has(w.toLowerCase()));

    console.log(`📝 Total words: ${ALL_WORDS.length}`);
    console.log(`✅ Processed: ${PROCESSED.size}`);
    console.log(`🔄 Remaining: ${remaining.length}`);
    console.log(
        `\n💡 Word data should be generated via LLM for each remaining word`,
    );
    console.log(
        `   Following the prompt from scripts/cursor/prompts/process-external-words.txt`,
    );
    console.log(`   Save to temp/generated/<word>-data.json`);
    console.log(`\n📋 Remaining words (${remaining.length}):`);
    remaining.forEach((word, i) => {
        console.log(`  ${i + 1}. ${word}`);
    });
}

main().catch(console.error);
