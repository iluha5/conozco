#!/usr/bin/env node

/**
 * Cursor Agent Automation Script (JavaScript version)
 * Usage: node run-prompt.mjs <prompt-file> [options]
 * Options:
 *   --non-interactive  Run in non-interactive mode (auto-confirm)
 *   --log              Save output to log file
 *   --dry-run          Show what would be executed without running
 */

import { spawn, execSync } from 'child_process';
import {
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
    createWriteStream,
} from 'fs';
import { join, dirname, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import { readdir } from 'fs/promises';
import {
    PROJECT_ROOT,
    PROMPTS_DIR,
    LOGS_DIR,
    CURSOR_OUTPUT_DIR,
    CURSOR_AGENT_CMD,
} from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`Error: ${message}`, 'red');
    process.exit(1);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        nonInteractive: false,
        logOutput: false,
        dryRun: false,
        promptFile: null,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        switch (arg) {
            case '--non-interactive':
                options.nonInteractive = true;
                break;
            case '--log':
                options.logOutput = true;
                break;
            case '--dry-run':
                options.dryRun = true;
                break;
            default:
                if (!options.promptFile && !arg.startsWith('--')) {
                    options.promptFile = arg;
                } else if (arg.startsWith('--')) {
                    error(`Unknown argument: ${arg}`);
                }
                break;
        }
    }

    return options;
}

function findPromptFile(promptFile) {
    // Absolute path
    if (promptFile.startsWith('/')) {
        if (existsSync(promptFile)) {
            return promptFile;
        }
    }
    // Relative to prompts directory
    const promptsPath = join(PROMPTS_DIR, promptFile);
    if (existsSync(promptsPath)) {
        return promptsPath;
    }
    // Relative to current directory
    if (existsSync(promptFile)) {
        return resolve(promptFile);
    }

    return null;
}

function checkCursorAgent() {
    try {
        execSync(`which ${CURSOR_AGENT_CMD}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

async function listAvailablePrompts() {
    try {
        const files = await readdir(PROMPTS_DIR);
        return files.filter(f => f.endsWith('.txt')).map(f => basename(f));
    } catch {
        return [];
    }
}

async function main() {
    const options = parseArgs();

    // Check if prompt file is provided
    if (!options.promptFile) {
        error('Prompt file is required');
        console.log(
            'Usage: node run-prompt.mjs <prompt-file> [--non-interactive] [--log] [--dry-run]',
        );
        console.log('');
        console.log('Available prompt files:');
        const prompts = await listAvailablePrompts();
        if (prompts.length > 0) {
            prompts.forEach(p => console.log(`  ${p}`));
        } else {
            console.log('  No prompt files found');
        }
        process.exit(1);
    }

    // Resolve prompt file path
    const promptPath = findPromptFile(options.promptFile);
    if (!promptPath) {
        error(`Prompt file not found: ${options.promptFile}`);
    }

    // Check if cursor-agent is available
    if (!checkCursorAgent()) {
        error(
            `${CURSOR_AGENT_CMD} not found in PATH. Please ensure Cursor CLI is installed and ~/.local/bin is in your PATH`,
        );
    }

  // Read prompt content
  let promptContent;
  try {
    promptContent = readFileSync(promptPath, 'utf-8');
    
    // Add timestamp to prompt if it contains placeholder instructions
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    promptContent = promptContent.replace(
      /YYYYMMDD/g,
      timestamp
    );
  } catch (err) {
    error(`Failed to read prompt file: ${err.message}`);
  }

    // Setup log file if logging is enabled
    let logFile = null;
    if (options.logOutput) {
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, -5);
        logFile = join(LOGS_DIR, `cursor_${timestamp}.log`);

        if (!existsSync(LOGS_DIR)) {
            mkdirSync(LOGS_DIR, { recursive: true });
        }

        const logHeader = [
            '=== Cursor Agent Execution Log ===',
            `Timestamp: ${new Date().toISOString()}`,
            `Prompt file: ${promptPath}`,
            `Non-interactive: ${options.nonInteractive}`,
            '=================================',
            '',
        ].join('\n');

        writeFileSync(logFile, logHeader);
    }

    // Display execution info
    log('=== Cursor Agent Automation ===', 'green');
    console.log(`Prompt file: ${promptPath}`);
    console.log(`Project root: ${PROJECT_ROOT}`);
    console.log(`Non-interactive: ${options.nonInteractive}`);
    console.log(`Logging: ${options.logOutput}`);
    if (options.logOutput) {
        console.log(`Log file: ${logFile}`);
    }
    console.log('');

    // Show prompt preview
    log('Prompt preview (first 200 chars):', 'yellow');
    const preview = promptContent.slice(0, 200);
    console.log(preview);
    if (promptContent.length > 200) {
        console.log('...');
    }
    console.log('');

    if (options.dryRun) {
        log('DRY RUN MODE - No actual execution', 'yellow');
        console.log('');
        console.log('Would execute:');
        console.log(`  cd ${PROJECT_ROOT}`);
        if (options.nonInteractive) {
            console.log(
                `  ${CURSOR_AGENT_CMD} -p "${promptContent.slice(0, 50)}..."`,
            );
        } else {
            console.log(`  ${CURSOR_AGENT_CMD}`);
            console.log(`  (with prompt: ${promptContent.slice(0, 50)}...)`);
        }
        process.exit(0);
    }

    // Change to project root
    process.chdir(PROJECT_ROOT);

  // Ensure cursor output directory exists
  if (!existsSync(CURSOR_OUTPUT_DIR)) {
    mkdirSync(CURSOR_OUTPUT_DIR, { recursive: true });
  }

  // Generate timestamp for filename reference
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const exampleFilename = `CODE_REVIEW_${timestamp}.md`;

  // Execute cursor-agent
  log('Executing cursor-agent...', 'green');
  console.log(`Output files will be saved to: ${CURSOR_OUTPUT_DIR}`);
  console.log(`Example filename format: ${exampleFilename}`);
  console.log('');

    return new Promise(resolve => {
        let logStream = null;
        if (options.logOutput && logFile) {
            logStream = createWriteStream(logFile, { flags: 'a' });
        }

        const writeLog = data => {
            if (logStream) {
                logStream.write(data);
            }
            process.stdout.write(data);
        };

        let childProcess;
        const spawnOptions = {
            stdio: options.nonInteractive
                ? ['ignore', 'pipe', 'pipe']
                : ['pipe', 'pipe', 'pipe'],
            shell: true,
            cwd: PROJECT_ROOT, // Set working directory to project root
            env: {
                ...process.env,
                CURSOR_OUTPUT_DIR: CURSOR_OUTPUT_DIR, // Pass output dir as env var
            },
        };

        if (options.nonInteractive) {
            // Non-interactive mode: use -p flag
            childProcess = spawn(
                CURSOR_AGENT_CMD,
                ['-p', promptContent],
                spawnOptions,
            );
        } else {
            // Interactive mode: pipe prompt to stdin
            childProcess = spawn(CURSOR_AGENT_CMD, [], spawnOptions);
            childProcess.stdin.write(promptContent);
            childProcess.stdin.end();
        }

        childProcess.stdout.on('data', writeLog);
        childProcess.stderr.on('data', writeLog);

        childProcess.on('close', code => {
            if (logStream) {
                logStream.end();
                const logFooter = [
                    '',
                    '=== Execution completed ===',
                    `Exit code: ${code}`,
                    `Timestamp: ${new Date().toISOString()}`,
                ].join('\n');
                writeFileSync(logFile, logFooter, { flag: 'a' });
            }

            if (code === 0) {
                console.log('');
                log('✓ Execution completed successfully', 'green');
                if (options.logOutput) {
                    console.log(`Log saved to: ${logFile}`);
                }
            } else {
                console.log('');
                log(`✗ Execution failed with exit code ${code}`, 'red');
                if (options.logOutput) {
                    console.log(`Check log file: ${logFile}`);
                }
            }

            resolve(code);
        });

        childProcess.on('error', err => {
            error(`Failed to execute ${CURSOR_AGENT_CMD}: ${err.message}`);
        });
    }).then(code => {
        process.exit(code);
    });
}

main().catch(err => {
    error(`Unexpected error: ${err.message}`);
    process.exit(1);
});
