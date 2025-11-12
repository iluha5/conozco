#!/usr/bin/env node

/**
 * Setup Cron Jobs for Cursor Automation
 * This script helps set up cron jobs for scheduled Cursor CLI tasks
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { PROJECT_ROOT, SCHEDULED_DIR, LOGS_DIR } from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function isMacOS() {
    return process.platform === 'darwin';
}

function setupMacOS() {
    log('=== Cursor Automation Launchd Setup (macOS) ===', 'green');
    console.log('');

    const launchdDir = join(SCHEDULED_DIR, 'launchd');
    if (!existsSync(launchdDir)) {
        mkdirSync(launchdDir, { recursive: true });
    }

    const dailyScript = join(SCHEDULED_DIR, 'daily-code-review.mjs');

    // Try to find node path
    let nodePath = '/usr/local/bin/node';
    try {
        const whichNode = execSync('which node', { encoding: 'utf-8' }).trim();
        if (whichNode) {
            nodePath = whichNode;
        }
    } catch {
        // Ignore
    }

    // Create daily review plist
    const dailyPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.flashcards.daily-review</string>
    <key>ProgramArguments</key>
    <array>
        <string>${nodePath}</string>
        <string>${dailyScript}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_ROOT}</string>
    <key>StandardOutPath</key>
    <string>${join(LOGS_DIR, 'daily-review.out')}</string>
    <key>StandardErrorPath</key>
    <string>${join(LOGS_DIR, 'daily-review.err')}</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>RunAtLoad</key>
    <false/>
</dict>
</plist>`;

    const dailyPlistPath = join(
        launchdDir,
        'com.flashcards.daily-review.plist',
    );

    writeFileSync(dailyPlistPath, dailyPlist);

    console.log('Launchd plist file created:');
    console.log(`  - ${dailyPlistPath}`);
    console.log('');
    console.log(`Detected Node.js at: ${nodePath}`);
    console.log('');

    console.log('To install the launchd job, run:');
    console.log(`  cp ${dailyPlistPath} ~/Library/LaunchAgents/`);
    console.log(
        '  launchctl load ~/Library/LaunchAgents/com.flashcards.daily-review.plist',
    );
    console.log('');
    console.log('To check status:');
    console.log('  launchctl list | grep flashcards');
}

function setupLinux() {
    log('=== Cursor Automation Cron Setup (Linux/Unix) ===', 'green');
    console.log('');

    const cronFile = join(SCHEDULED_DIR, 'crontab.txt');
    const dailyScript = join(SCHEDULED_DIR, 'daily-code-review.mjs');

    const cronContent = `# Cursor Automation Cron Jobs
# Generated on ${new Date().toISOString()}
# 
# To install this cron job, run:
#   crontab ${cronFile}
#
# To view current cron jobs:
#   crontab -l
#
# To remove all cron jobs:
#   crontab -r

# Daily code review at 9:00 AM
0 9 * * * cd ${PROJECT_ROOT} && node ${dailyScript} >> ${join(LOGS_DIR, 'cron.log')} 2>&1
`;

    writeFileSync(cronFile, cronContent);

    console.log(`Cron configuration file created: ${cronFile}`);
    console.log('');
    console.log('To install the cron job, run:');
    console.log(`  crontab ${cronFile}`);
    console.log('');
    console.log('Cron schedule:');
    console.log('  - Daily code review: 9:00 AM every day');
}

function main() {
    if (isMacOS()) {
        setupMacOS();
    } else {
        setupLinux();
    }

    console.log('');
    log('Setup complete!', 'green');
}

main();
