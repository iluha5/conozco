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

// Создаем timestamp для лог-файла
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const logFileName = `process-word-cursor-${timestamp}.log`;
const logFilePath = path.join(__dirname, 'logs', logFileName);

async function log(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    console.log(message);
    await fs.appendFile(logFilePath, logEntry);
}

async function readExternalWordsOutput() {
    try {
        const data = await fs.readFile(inputFilePath, 'utf8');
        const words = JSON.parse(data);

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
        if (error.code === 'ENOENT') {
            throw new Error(`File ${inputFilePath} does not exist`);
        }
        throw new Error(
            `Error reading or parsing ${inputFilePath}: ${error.message}`,
        );
    }
}

async function processWordWithCursor(wordData) {
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

1. THREE high-quality, accurate translations to ${translationLanguage}
2. FIVE random, natural sentences using this word (each sentence should be no more than 6 words long)`;

    // Расширенный промпт для глаголов
    if (partOfSpeech === 'VERB') {
        if (languageCode === 'es') {
            // Испанский глагол
            prompt += `

Since "${word}" is a Spanish verb, please also provide additional grammatical examples:

3. Examples in different tenses:
   - Presente de indicativo (Present Indicative)
   - Futuro próximo (ir a + infinitivo)
   - Pretérito indefinido (Simple Past)
   - One negative sentence
   - One question sentence

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": ["sentence1", "sentence2", "sentence3", "sentence4", "sentence5"],
  "grammaticalExamples": {
    "Presente de indicativo": ["example1", "example2"],
    "Futuro próximo": ["example1", "example2"],
    "Pretérito indefinido": ["example1", "example2"],
    "negative": "negative sentence",
    "question": "question sentence"
  }
}`;
        } else if (languageCode === 'en') {
            // Английский глагол
            prompt += `

Since "${word}" is an English verb, please also provide additional grammatical examples:

3. Examples in different tenses:
   - Present Simple
   - Past Simple
   - Future Simple
   - One negative sentence
   - One question sentence

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": ["sentence1", "sentence2", "sentence3", "sentence4", "sentence5"],
  "grammaticalExamples": {
    "Present Simple": ["example1", "example2"],
    "Past Simple": ["example1", "example2"],
    "Future Simple": ["example1", "example2"],
    "negative": "negative sentence",
    "question": "question sentence"
  }
}`;
        }
    } else {
        // Для не-глаголов используем базовый промпт
        prompt += `

Format your response as a simple JSON object with this structure:
{
  "word": "${word}",
  "translations": ["translation1", "translation2", "translation3"],
  "sentences": ["sentence1", "sentence2", "sentence3", "sentence4", "sentence5"]
}`;
    }

    prompt += `

Make sure all translations are accurate and contextually appropriate. All sentences should be natural, grammatically correct, and demonstrate different uses of the word. Avoid any meta-commentary or explanations - just provide the JSON.`;

    // Сохраняем промпт в файл
    const promptFile = path.join(outputDir, `prompt-${word}-${timestamp}.txt`);
    await fs.writeFile(promptFile, prompt, 'utf8');

    await log(`📝 Created prompt file: ${promptFile}`);

    // Создаем инструкции для выполнения
    const instructionsFile = path.join(
        outputDir,
        `cursor-instructions-${word}-${timestamp}.txt`,
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

async function main() {
    await log('🚀 Starting word processing with Cursor CLI');

    try {
        // Читаем входной файл
        const wordData = await readExternalWordsOutput();
        await log(`📖 Successfully read word data from ${inputFilePath}`);

        // Обрабатываем слово через Cursor CLI
        const result = await processWordWithCursor(wordData);

        await log(`🎉 Processing completed successfully!`);
        await log(`📝 Log saved to: ${logFilePath}`);
        await log(`📄 Result file: ${result.outputFile}`);
    } catch (error) {
        await log(`❌ Script failed: ${error.message}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
