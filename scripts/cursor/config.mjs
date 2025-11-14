import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project root directory (two levels up from scripts/cursor/)
export const PROJECT_ROOT = join(__dirname, '../..');

// Directories
export const PROMPTS_DIR = join(__dirname, 'prompts');
export const SCHEDULED_DIR = join(__dirname, 'scheduled');
export const LOGS_DIR = join(__dirname, 'logs');
export const CURSOR_OUTPUT_DIR = join(PROJECT_ROOT, 'cursor_output');

// Cursor Agent settings
export const CURSOR_AGENT_CMD = 'cursor-agent';
export const CURSOR_AGENT_TIMEOUT = 3600 * 1000; // Timeout in milliseconds (1 hour)

// AI Model configuration
// To change the model used by scripts, modify DEFAULT_AI_MODEL below
// Available models: 'grok-code-fast-1' (Grok from xAI) or 'sonnet-4.5' (Claude from Anthropic)
export const DEFAULT_AI_MODEL = 'grok-code-fast-1'; // Default model for processing
export const SUPPORTED_MODELS = ['grok-code-fast-1', 'sonnet-4.5']; // Available models

// Default execution options
export const DEFAULT_NON_INTERACTIVE = false;
export const DEFAULT_LOG_OUTPUT = true;
export const DEFAULT_DRY_RUN = false;

// Logging settings
export const LOG_RETENTION_DAYS = 30; // Keep logs for 30 days
export const LOG_MAX_SIZE_MB = 100; // Maximum log file size in MB

// Notification settings (optional)
export const ENABLE_NOTIFICATIONS = false;
export const NOTIFICATION_EMAIL = ''; // Email for notifications

// Ensure directories exist
if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
}
if (!existsSync(CURSOR_OUTPUT_DIR)) {
    mkdirSync(CURSOR_OUTPUT_DIR, { recursive: true });
}
