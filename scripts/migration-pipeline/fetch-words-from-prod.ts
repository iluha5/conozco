import { PrismaClient } from '@prisma/client';
import { loadMigrationEnv } from './load-env';

export type WordSourceFilter = 'DEEPL' | 'MYMEMORY' | 'external';

const SUPPORTED_LANGUAGES = ['en', 'es', 'ru'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export interface FetchWordsOptions {
    languageCode: SupportedLanguage;
    source: WordSourceFilter;
    limit?: number;
    databaseUrl?: string;
}

function getProdDatabaseUrl(): string {
    loadMigrationEnv();
    const databaseUrl = process.env.PROD_DATABASE_URL?.trim();
    if (!databaseUrl) {
        throw new Error(
            'PROD_DATABASE_URL is not set. Add it to .env.local for --from-prod.',
        );
    }
    return databaseUrl;
}

function buildWhereClause(
    languageCode: SupportedLanguage,
    source: WordSourceFilter,
) {
    if (source === 'external') {
        return {
            language: { code: languageCode },
            source: { code: { not: 'native' } },
        };
    }

    return {
        language: { code: languageCode },
        source: { code: source },
    };
}

export function buildMigrationNameFromProd(
    source: WordSourceFilter,
    languageCode: SupportedLanguage,
): string {
    if (source === 'external') {
        return `external_${languageCode}`;
    }
    return `${source.toLowerCase()}_${languageCode}`;
}

export function validateLanguageCode(languageCode: string): SupportedLanguage {
    if (!SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
        throw new Error(
            `Unsupported language code: ${languageCode}. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
        );
    }
    return languageCode as SupportedLanguage;
}

export function validateSourceFilter(source: string): WordSourceFilter {
    const normalized = source.toUpperCase();
    if (normalized === 'EXTERNAL') {
        return 'external';
    }
    if (normalized === 'DEEPL' || normalized === 'MYMEMORY') {
        return normalized;
    }
    throw new Error(
        `Unsupported source filter: ${source}. Supported: DEEPL, MYMEMORY, external`,
    );
}

export async function fetchWordsFromProd(
    options: FetchWordsOptions,
): Promise<string[]> {
    validateLanguageCode(options.languageCode);
    const databaseUrl = options.databaseUrl ?? getProdDatabaseUrl();

    const prisma = new PrismaClient({
        datasources: {
            db: { url: databaseUrl },
        },
    });

    try {
        const records = await prisma.baseWord.findMany({
            where: buildWhereClause(options.languageCode, options.source),
            select: { word: true },
            orderBy: { word: 'asc' },
            ...(options.limit ? { take: options.limit } : {}),
        });

        return records.map(record => record.word);
    } finally {
        await prisma.$disconnect();
    }
}

export async function writeWordsToFile(
    words: string[],
    migrationName: string,
    languageCode: SupportedLanguage,
    outputDir: string,
): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(
        outputDir,
        `${migrationName}.${languageCode}.txt`,
    );
    const content = words.length > 0 ? `${words.join('\n')}\n` : '';
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
}
