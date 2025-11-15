import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем директорию текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Пути к файлам
const inputFilePath = path.join(
    __dirname,
    'temp',
    'external-words-output.json',
);
const outputDir = path.join(__dirname, 'temp');

// Счетчик пайплайна
const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');
let counter = 1;

async function getCurrentCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        return parseInt(counterData.trim());
    } catch (error) {
        // Файл не существует, начинаем с 1
        return 1;
    }
}

// Глобальные переменные для логов (будут инициализированы асинхронно)
let logFilePath = '';
let currentCounter = 1;
let timestamp = '';

async function initializeLogger(): Promise<void> {
    timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    currentCounter = await getCurrentCounter();
    const logFileName = `${currentCounter}-process-word-cursor-${timestamp}.log`;
    logFilePath = path.join(__dirname, 'logs', logFileName);
}

async function log(message: string): Promise<void> {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    if (logFilePath) {
        await fs.appendFile(logFilePath, logEntry);
    }
}

interface WordData {
    id: string;
    word: string;
    language: {
        id: string;
        code: string;
        name: string;
    };
    translationLanguage: {
        id: string;
        code: string;
        name: string;
    };
    partOfSpeech?: {
        name: string;
    };
}

interface ProcessResult {
    word: string;
    promptFile: string;
    instructionsFile: string;
}

async function readExternalWordsOutput(): Promise<WordData> {
    try {
        const data = await fs.readFile(inputFilePath, 'utf8');
        const words: WordData[] = JSON.parse(data);

        // Проверяем структуру файла
        if (!Array.isArray(words) || words.length === 0) {
            throw new Error('File is empty or not an array');
        }

        const firstWord = words[0];
        if (!firstWord || typeof firstWord.word !== 'string') {
            throw new Error('Invalid word structure - missing word field');
        }

        return firstWord;
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            throw new Error(`File ${inputFilePath} does not exist`);
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(
            `Error reading or parsing ${inputFilePath}: ${errorMessage}`,
        );
    }
}

async function processWordWithCursor(wordData: WordData): Promise<ProcessResult> {
    const word = wordData.word;
    const language = wordData.language.name;
    const languageCode = wordData.language.code;
    const translationLanguage = wordData.translationLanguage.name;
    const partOfSpeech = wordData.partOfSpeech?.name || 'NOUN'; // По умолчанию существительное

    await log(
        `🎯 Processing word: "${word}" (${language} -> ${translationLanguage}, POS: ${partOfSpeech})`,
    );

    // Базовый промпт
    let prompt = `You are a professional linguist and translator. For the ${language} word "${word}", please provide:

1. The part of speech (one word: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection)
2. THREE high-quality, accurate translations to ${translationLanguage}
3. FIVE random, natural sentences using this word (each sentence should be no more than 6 words long)`;

    // Расширенный промпт для глаголов
    if (partOfSpeech === 'VERB') {
        if (languageCode === 'es') {
            // Испанский глагол
            prompt += `

Since "${word}" is a Spanish verb, please also provide additional grammatical examples:

4. Examples in different tenses:
   - Presente de indicativo (Present Indicative) - 2 examples with translations
   - Futuro próximo (ir a + infinitivo) - 2 examples with translations
   - Pretérito indefinido (Simple Past) - 2 examples with translations
   - One negative sentence with translation
   - One question sentence with translation

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "partOfSpeech": "verb",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": [
    {"text": "sentence1", "translation": "translation1"},
    {"text": "sentence2", "translation": "translation2"},
    {"text": "sentence3", "translation": "translation3"},
    {"text": "sentence4", "translation": "translation4"},
    {"text": "sentence5", "translation": "translation5"}
  ],
  "grammaticalExamples": {
    "Presente de indicativo": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "Futuro próximo": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "Pretérito indefinido": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "negative": {"text": "negative sentence", "translation": "negative translation"},
    "question": {"text": "question sentence", "translation": "question translation"}
  }
}`;
        } else if (languageCode === 'en') {
            // Английский глагол
            prompt += `

Since "${word}" is an English verb, please also provide additional grammatical examples:

4. Examples in different tenses:
   - Present Simple - 2 examples with translations
   - Past Simple - 2 examples with translations
   - Future Simple - 2 examples with translations
   - One negative sentence with translation
   - One question sentence with translation

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "partOfSpeech": "verb",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": [
    {"text": "sentence1", "translation": "translation1"},
    {"text": "sentence2", "translation": "translation2"},
    {"text": "sentence3", "translation": "translation3"},
    {"text": "sentence4", "translation": "translation4"},
    {"text": "sentence5", "translation": "translation5"}
  ],
  "grammaticalExamples": {
    "Present Simple": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "Past Simple": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "Future Simple": [
      {"text": "example1", "translation": "translation1"},
      {"text": "example2", "translation": "translation2"}
    ],
    "negative": {"text": "negative sentence", "translation": "negative translation"},
    "question": {"text": "question sentence", "translation": "question translation"}
  }
}`;
        }
    } else {
        // Для не-глаголов используем базовый промпт с переводами
        prompt += `

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "partOfSpeech": "noun",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": [
    {"text": "sentence1", "translation": "translation1"},
    {"text": "sentence2", "translation": "translation2"},
    {"text": "sentence3", "translation": "translation3"},
    {"text": "sentence4", "translation": "translation4"},
    {"text": "sentence5", "translation": "translation5"}
  ]
}`;
    }

    prompt += `

Make sure all translations are accurate and contextually appropriate. All sentences should be natural, grammatically correct, and demonstrate different uses of the word. Avoid any meta-commentary or explanations - just provide the JSON.`;

    // Сохраняем промпт в файл
    const promptFile = path.join(outputDir, `${currentCounter}-${word}-prompt-${timestamp}.txt`);
    await fs.writeFile(promptFile, prompt, 'utf8');

    await log(`📝 Created prompt file: ${promptFile}`);

    // Создаем инструкции для выполнения
    const instructionsFile = path.join(
        outputDir,
        `${currentCounter}-${word}-cursor-instructions-${timestamp}.txt`,
    );
    const instructions = `# Instructions for processing word "${word}"
#
# 1. Copy the content of the prompt file: ${promptFile}
# 2. Run Cursor CLI command:
#    cursor run-prompt "${promptFile}" --output-format json
#
# 3. Or manually copy the prompt content to Cursor and run it
#
# 4. Save the JSON result to: ${path.join(outputDir, `cursor-result-${word}-${timestamp}.json`)}
#
# Expected JSON format:
# {
#   "word": "${word}",
#   "translations": ["translation1", "translation2", "translation3"],
#   "sentences": ["sentence1", "sentence2", "sentence3", "sentence4", "sentence5"]
# }

Prompt created at: ${new Date().toISOString()}
Word: ${word} (${language} -> ${translationLanguage})`;

    await fs.writeFile(instructionsFile, instructions, 'utf8');
    await log(`📋 Created instructions file: ${instructionsFile}`);

    await log(`✅ Prompt preparation completed!`);
    await log(`📋 Check instructions: ${instructionsFile}`);
    await log(`📝 Use prompt file: ${promptFile}`);

    return {
        word,
        promptFile,
        instructionsFile,
    };
}

async function main(): Promise<void> {
    await initializeLogger();
    await log('🚀 Starting word processing with Cursor CLI');

    try {
        // Читаем входной файл
        const wordData = await readExternalWordsOutput();
        await log(`📖 Successfully read word data from ${inputFilePath}`);

        // Обрабатываем слово через Cursor CLI
        const result = await processWordWithCursor(wordData);

        await log(`🎉 Processing completed successfully!`);
        await log(`📝 Log saved to: ${logFilePath}`);
        await log(`📄 Result file: ${result.promptFile}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        await log(`❌ Script failed: ${errorMessage}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
