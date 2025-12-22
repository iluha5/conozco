#!/usr/bin/env node

/**
 * Process External Words Script
 * Runs Cursor CLI with the external words processing prompt
 * This script allows Cursor to read database and generate WordData files
 *
 * Model Configuration:
 * - Forces use of specific AI model (default: grok-code-fast-1) for consistent results
 * - Model can be changed via DEFAULT_AI_MODEL in scripts/cursor/config.mjs
 * - Set via CURSOR_MODEL, MODEL, and AI_MODEL environment variables
 */

import { spawn } from 'child_process';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    PROJECT_ROOT,
    PROMPTS_DIR,
    CURSOR_OUTPUT_DIR,
    CURSOR_AGENT_CMD,
    DEFAULT_AI_MODEL,
} from '../cursor/config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
    const promptFile = join(PROMPTS_DIR, 'process-external-words.txt');

    // Check if prompt file exists
    if (!existsSync(promptFile)) {
        log(`Error: Prompt file not found: ${promptFile}`, 'red');
        process.exit(1);
    }

    // Read prompt content
    let promptContent;
    try {
        promptContent = readFileSync(promptFile, 'utf-8');

        // Add timestamp to prompt if it contains placeholder instructions
        const timestamp = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');
        const timeTimestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[:-]/g, '')
            .replace('T', '_');
        promptContent = promptContent.replace(/YYYYMMDD/g, timestamp);
        promptContent = promptContent.replace(
            /YYYYMMDD_HHMMSS/g,
            timeTimestamp,
        );
    } catch (err) {
        log(`Error: Failed to read prompt file: ${err.message}`, 'red');
        process.exit(1);
    }

    // Ensure cursor output directory exists
    if (!existsSync(CURSOR_OUTPUT_DIR)) {
        mkdirSync(CURSOR_OUTPUT_DIR, { recursive: true });
    }

    // Change to project root
    process.chdir(PROJECT_ROOT);

    log('=== Processing External Words with Cursor CLI ===', 'green');
    console.log(`Prompt file: ${promptFile}`);
    console.log(`Project root: ${PROJECT_ROOT}`);
    console.log(`Output directory: ${CURSOR_OUTPUT_DIR}`);
    console.log('');

    log('IMPORTANT: Cursor CLI has been granted permissions to:', 'yellow');
    console.log(
        '  - Read database (Prisma) - for finding words from external sources',
    );
    console.log(
        '  - Create files in scripts/cursor/temp/ - for generated WordData',
    );
    console.log('  - Create log files in cursor_output/');
    console.log('');
    log('AI MODEL CONFIGURATION:', 'yellow');
    console.log(`  - Forced to use: ${DEFAULT_AI_MODEL}`);
    console.log('  - For consistent and high-quality results');
    console.log('');

    // Execute cursor-agent with necessary permissions
    // Use stdin to pass prompt to avoid shell interpretation issues
    const childProcess = spawn(
        CURSOR_AGENT_CMD,
        [
            '--print', // Print mode for scripts
            '--model',
            DEFAULT_AI_MODEL, // Force specific AI model
        ],
        {
            stdio: ['pipe', 'inherit', 'inherit'], // stdin for prompt, stdout/stderr inherit
            shell: false, // Don't use shell to avoid interpretation issues
            cwd: PROJECT_ROOT,
            env: {
                ...process.env,
                CURSOR_OUTPUT_DIR: CURSOR_OUTPUT_DIR,
                PROJECT_ROOT: PROJECT_ROOT,
                // Grant permissions for database access
                DATABASE_URL: process.env.DATABASE_URL,
                // Force specific AI model for consistent results
                CURSOR_MODEL: DEFAULT_AI_MODEL,
                // Alternative model specification variables
                MODEL: DEFAULT_AI_MODEL,
                AI_MODEL: DEFAULT_AI_MODEL,
            },
        },
    );

    // Write prompt to stdin
    childProcess.stdin.write(promptContent);
    childProcess.stdin.end();

    childProcess.on('close', code => {
        if (code === 0) {
            console.log('');
            log('✓ Processing completed successfully', 'green');
            console.log(`Check log files in: ${CURSOR_OUTPUT_DIR}`);
        } else {
            console.log('');
            log(`✗ Processing failed with exit code ${code}`, 'red');
            console.log('Check the output above for error details');
        }
        process.exit(code);
    });

    childProcess.on('error', err => {
        log(
            `Error: Failed to execute ${CURSOR_AGENT_CMD}: ${err.message}`,
            'red',
        );
        process.exit(1);
    });
}

main().catch(err => {
    log(`Unexpected error: ${err.message}`, 'red');
    process.exit(1);
});
