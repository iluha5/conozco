#!/usr/bin/env node

/**
 * Daily Code Review Script
 * This script runs a code review prompt daily via cron/launchd
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { readdirSync, unlinkSync, statSync } from 'fs';
import { PROJECT_ROOT, LOGS_DIR, LOG_RETENTION_DAYS } from '../config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CURSOR_SCRIPT = join(__dirname, '../run-prompt.mjs');

async function cleanupOldLogs() {
    try {
        const files = readdirSync(LOGS_DIR);
        const now = Date.now();
        const retentionMs = LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;

        for (const file of files) {
            if (file.endsWith('.log')) {
                const filePath = join(LOGS_DIR, file);
                const stats = statSync(filePath);
                const age = now - stats.mtimeMs;

                if (age > retentionMs) {
                    unlinkSync(filePath);
                    console.log(`Deleted old log: ${file}`);
                }
            }
        }
    } catch (err) {
        console.error(`Error cleaning up logs: ${err.message}`);
    }
}

async function main() {
    try {
        console.log(
            `Starting daily code review at ${new Date().toISOString()}`,
        );

        // Run code review prompt
        execSync(
            `node "${CURSOR_SCRIPT}" "example-code-review.txt" --non-interactive --log`,
            {
                cwd: PROJECT_ROOT,
                stdio: 'inherit',
            },
        );

        // Cleanup old logs
        await cleanupOldLogs();

        console.log(
            `Daily code review completed at ${new Date().toISOString()}`,
        );
    } catch (err) {
        console.error(`Error in daily code review: ${err.message}`);
        process.exit(1);
    }
}

main();
