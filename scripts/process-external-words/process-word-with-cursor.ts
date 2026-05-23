import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let inputFilePath = '';
let outputDir = '';

const counterFile = path.join(__dirname, 'temp', 'pipeline-counter.txt');

async function getCurrentCounter(): Promise<number> {
    try {
        const counterData = await fs.readFile(counterFile, 'utf8');
        return parseInt(counterData.trim());
    } catch {
        return 1;
    }
}

let logFilePath = '';
let currentCounter = 1;
let timestamp = '';
let dateFolder = '';

async function ensureDateFolder(
    basePath: string,
    dateStr: string,
): Promise<string> {
    const datePath = path.join(basePath, dateStr);
    try {
        await fs.access(datePath);
    } catch {
        await fs.mkdir(datePath, { recursive: true });
    }
    return datePath;
}

async function initializeLogger(): Promise<void> {
    const now = new Date();
    timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    dateFolder = now.toISOString().slice(0, 10);

    currentCounter = await getCurrentCounter();

    const logsDatePath = await ensureDateFolder(
        path.join(__dirname, 'logs'),
        dateFolder,
    );
    const tempDatePath = await ensureDateFolder(
        path.join(__dirname, 'temp'),
        dateFolder,
    );

    const logFileName = `${currentCounter}-process-word-cursor-${timestamp}.log`;
    logFilePath = path.join(logsDatePath, logFileName);

    inputFilePath = path.join(tempDatePath, 'external-words-output.json');
    outputDir = tempDatePath;
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
    language: { id: string; code: string; name: string };
    translationLanguage: { id: string; code: string; name: string };
    partOfSpeech?: { name: string };
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

        if (!Array.isArray(words) || words.length === 0) {
            throw new Error('File is empty or not an array');
        }

        const firstWord = words[0];
        if (!firstWord || typeof firstWord.word !== 'string') {
            throw new Error('Invalid word structure - missing word field');
        }

        return firstWord;
    } catch (error) {
        if (
            error &&
            typeof error === 'object' &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            throw new Error(`File ${inputFilePath} does not exist`);
        }
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        throw new Error(
            `Error reading or parsing ${inputFilePath}: ${errorMessage}`,
        );
    }
}

async function processWordWithCursor(
    wordData: WordData,
): Promise<ProcessResult> {
    const word = wordData.word;
    const language = wordData.language.name;
    const languageCode = wordData.language.code;
    const translationLanguage = wordData.translationLanguage.name;
    const partOfSpeech = wordData.partOfSpeech?.name || 'NOUN';

    await log(
        `Processing "${word}" (${language} -> ${translationLanguage}, POS: ${partOfSpeech})`,
    );

    const promptTemplatePath = path.join(
        __dirname,
        '..',
        'cursor',
        'prompts',
        'process-external-words-simple.txt',
    );
    let prompt = '';

    try {
        prompt = await fs.readFile(promptTemplatePath, 'utf8');
    } catch (error) {
        await log(`Error reading prompt template: ${error}`);
        throw new Error(`Failed to read prompt template: ${error}`);
    }

    prompt = prompt.replace(/\$\{word\}/g, word);
    prompt = prompt.replace(/\$\{language\}/g, language);
    prompt = prompt.replace(/\$\{languageCode\}/g, languageCode);

    const tempDatePath = await ensureDateFolder(
        path.join(__dirname, 'temp'),
        dateFolder,
    );

    const promptFile = path.join(
        tempDatePath,
        `${currentCounter}-${word}-prompt-${timestamp}.txt`,
    );
    await fs.writeFile(promptFile, prompt, 'utf8');

    const instructionsFile = path.join(
        tempDatePath,
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

    await log(`Prompt: ${promptFile}`);
    await log(`Instructions: ${instructionsFile}`);

    return { word, promptFile, instructionsFile };
}

async function main(): Promise<void> {
    await initializeLogger();

    try {
        const wordData = await readExternalWordsOutput();
        const result = await processWordWithCursor(wordData);
        await log(`Done. Result: ${result.promptFile}. Log: ${logFilePath}.`);
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await log(`Script failed: ${errorMessage}`);
        console.error('Error details:', error);
        process.exit(1);
    }
}

main();
