import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '../..');

function parseEnvLine(line: string): { key: string; value: string } | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
        return null;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
        return null;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1);
    }

    return { key, value };
}

function loadEnvFile(filePath: string, override: boolean): void {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
        const parsed = parseEnvLine(line);
        if (!parsed) {
            continue;
        }

        if (override || process.env[parsed.key] === undefined) {
            process.env[parsed.key] = parsed.value;
        }
    }
}

/**
 * Loads .env then .env.local (local overrides). No-op when vars are already set
 * (e.g. via dotenv-cli in npm scripts).
 */
export function loadMigrationEnv(): void {
    loadEnvFile(path.join(PROJECT_ROOT, '.env'), false);
    loadEnvFile(path.join(PROJECT_ROOT, '.env.local'), true);
}

export function getProjectRoot(): string {
    return PROJECT_ROOT;
}
