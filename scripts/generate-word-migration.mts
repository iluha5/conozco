#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface WordData {
    word: string;
    partOfSpeech: string;
    languageCode: string;
    translations: {
        languageCode: string;
        translations: string[];
    }[];
    examples: {
        pronoun: string;
        example: string;
        translations: {
            languageCode: string;
            translation: string;
        }[];
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }[];
    grammaticalExamples: {
        tenseName: string;
        examples: {
            pronoun: string;
            example: string;
            translations: {
                languageCode: string;
                translation: string;
            }[];
            sentenceTypeCode: string;
            isNegative: boolean;
            isQuestion: boolean;
        }[];
    }[];
}

interface MigrationMetadata {
    name: string;
    description: string;
    timestamp: string;
    wordsCount: number;
    language: string;
}

/**
 * Escape SQL string for PostgreSQL
 */
function escapeSqlString(value: string): string {
    return value.replace(/'/g, "''").replace(/\\/g, '\\\\');
}

/**
 * Generate migration SQL from WordData array
 */
export function generateMigrationSQL(
    wordDataArray: WordData[],
    metadata: MigrationMetadata,
): string {
    const { name, timestamp, wordsCount, language } = metadata;
    const migrationSourceCode = `dm_${timestamp}_${name}`;
    const BATCH_SIZE = 200; // Batch size for SQL inserts

    const lines: string[] = [];

    // Header
    lines.push(`-- Migration: ${name}`);
    lines.push(
        `-- Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
    );
    lines.push(`-- Words count: ${wordsCount}`);
    lines.push(`-- Language: ${language}`);
    lines.push(
        `-- Strategy: UPSERT (insert or update existing, preserve existing IDs)`,
    );
    lines.push('');

    // Transaction start
    lines.push('BEGIN;');
    lines.push(
        `SELECT pg_advisory_lock(hashtext('data_migrations_global_lock'));`,
    );
    lines.push(`SET LOCAL statement_timeout = '10min';`);
    lines.push(`SET LOCAL lock_timeout = '60s';`);
    lines.push(`SET LOCAL client_min_messages = warning;`);
    lines.push('');

    // Ensure languages exist
    const languages = new Set<string>();
    wordDataArray.forEach(wordData => {
        languages.add(wordData.languageCode);
        wordData.translations.forEach(t => languages.add(t.languageCode));
        wordData.examples.forEach(e =>
            e.translations.forEach(t => languages.add(t.languageCode)),
        );
        wordData.grammaticalExamples.forEach(ge =>
            ge.examples.forEach(e =>
                e.translations.forEach(t => languages.add(t.languageCode)),
            ),
        );
    });

    const languageNames: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        ru: 'Russian',
    };

    if (languages.size > 0) {
        lines.push('-- Ensure languages exist (idempotent)');
        const languageValues = Array.from(languages)
            .map(
                code =>
                    `('${code}', '${languageNames[code] || code.toUpperCase()}')`,
            )
            .join(', ');
        lines.push(
            `INSERT INTO "Language" ("code", "name") VALUES ${languageValues}`,
        );
        lines.push(`ON CONFLICT ("code") DO NOTHING;`);
        lines.push('');
    }

    // Ensure parts of speech exist
    const partsOfSpeech = new Set<string>();
    wordDataArray.forEach(wordData => {
        partsOfSpeech.add(wordData.partOfSpeech);
    });

    if (partsOfSpeech.size > 0) {
        lines.push('-- Ensure part of speech exists');
        const posValues = Array.from(partsOfSpeech)
            .map(pos => `('${escapeSqlString(pos)}')`)
            .join(', ');
        lines.push(`INSERT INTO "PartOfSpeech" ("name") VALUES ${posValues}`);
        lines.push(`ON CONFLICT ("name") DO NOTHING;`);
        lines.push('');
    }

    // Ensure word source exists (migration label)
    lines.push('-- Ensure word sources exist (including migration label)');
    lines.push(
        `INSERT INTO "WordSource" ("code", "displayName") VALUES ('native', 'Native'), ('${migrationSourceCode}', 'Data Migration ${name}')`,
    );
    lines.push(`ON CONFLICT ("code") DO NOTHING;`);
    lines.push('');

    // Collect all words for batch processing
    const words = wordDataArray.map(w => ({
        word: w.word,
        languageCode: w.languageCode,
        partOfSpeech: w.partOfSpeech,
    }));

    // UPSERT BaseWord records
    if (words.length > 0) {
        lines.push('-- UPSERT BaseWord records');
        lines.push(
            '-- Новые слова получают sourceId = dm_...; существующие слова не меняют sourceId (чтобы rollback не удалил их)',
        );

        // Process in batches
        for (let i = 0; i < words.length; i += BATCH_SIZE) {
            const batch = words.slice(i, i + BATCH_SIZE);
            const values = batch
                .map(
                    w =>
                        `('${escapeSqlString(w.word)}', (SELECT "id" FROM "Language" WHERE "code" = '${w.languageCode}'), (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}'))`,
                )
                .join(',\n  ');

            lines.push(
                `INSERT INTO "BaseWord" ("word", "languageId", "sourceId") VALUES`,
            );
            lines.push(`  ${values}`);
            lines.push(`ON CONFLICT ("word", "languageId") DO NOTHING;`);
            lines.push('');
        }
    }

    // UPSERT WordTranslation records
    lines.push(
        '-- UPSERT WordTranslation records (используем подзапрос для получения baseWordId)',
    );

    const translationBatches: Array<{
        word: string;
        languageCode: string;
        translation: string;
        priority: number;
        partOfSpeech: string;
        targetLanguageCode: string;
    }> = [];

    wordDataArray.forEach(wordData => {
        wordData.translations.forEach(translationGroup => {
            translationGroup.translations
                .slice(0, 3)
                .forEach((translation, index) => {
                    translationBatches.push({
                        word: wordData.word,
                        languageCode: wordData.languageCode,
                        translation,
                        priority: index + 1,
                        partOfSpeech: wordData.partOfSpeech,
                        targetLanguageCode: translationGroup.languageCode,
                    });
                });
        });
    });

    if (translationBatches.length > 0) {
        // Process in batches
        for (let i = 0; i < translationBatches.length; i += BATCH_SIZE) {
            const batch = translationBatches.slice(i, i + BATCH_SIZE);
            const values = batch
                .map(
                    t =>
                        `((SELECT "id" FROM "BaseWord" WHERE "word" = '${escapeSqlString(t.word)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${t.languageCode}')), (SELECT "id" FROM "Language" WHERE "code" = '${t.targetLanguageCode}'), '${escapeSqlString(t.translation)}', ${t.priority}, (SELECT "id" FROM "PartOfSpeech" WHERE "name" = '${escapeSqlString(t.partOfSpeech)}'))`,
                )
                .join(',\n  ');

            lines.push(
                `INSERT INTO "WordTranslation" ("baseWordId", "languageId", "translation", "priority", "partOfSpeechId") VALUES`,
            );
            lines.push(`  ${values}`);
            lines.push(
                `ON CONFLICT ("baseWordId", "languageId", "priority") DO UPDATE SET`,
            );
            lines.push(`  "translation" = EXCLUDED."translation",`);
            lines.push(`  "partOfSpeechId" = EXCLUDED."partOfSpeechId";`);
            lines.push('');
        }
    }

    // Delete and insert WordExample records
    if (words.length > 0) {
        lines.push('-- Заменяем примеры: удаляем старые и вставляем новые.');
        lines.push(
            '-- Новые примеры помечаем sourceId = dm_... (для выборочного удаления при rollback)',
        );

        const wordList = words
            .map(w => `'${escapeSqlString(w.word)}'`)
            .join(', ');
        const languageIdSubquery = words[0]
            ? `(SELECT "id" FROM "Language" WHERE "code" = '${words[0].languageCode}')`
            : 'NULL';

        lines.push(`DELETE FROM "WordExample"`);
        lines.push(`WHERE "baseWordId" IN (`);
        lines.push(`  SELECT "id" FROM "BaseWord"`);
        lines.push(`  WHERE "word" IN (${wordList})`);
        lines.push(`  AND "languageId" = ${languageIdSubquery}`);
        lines.push(`);`);
        lines.push('');
    }

    // Insert WordExample records
    const exampleBatches: Array<{
        word: string;
        languageCode: string;
        pronoun: string;
        example: string;
        translation: string;
        translationLanguageCode: string;
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }> = [];

    wordDataArray.forEach(wordData => {
        wordData.examples.forEach(example => {
            example.translations.forEach(translation => {
                exampleBatches.push({
                    word: wordData.word,
                    languageCode: wordData.languageCode,
                    pronoun: example.pronoun,
                    example: example.example,
                    translation: translation.translation,
                    translationLanguageCode: translation.languageCode,
                    sentenceTypeCode: example.sentenceTypeCode,
                    isNegative: example.isNegative,
                    isQuestion: example.isQuestion,
                });
            });
        });
    });

    if (exampleBatches.length > 0) {
        // Get or create sentence types
        const sentenceTypes = new Set<string>();
        exampleBatches.forEach(e => {
            sentenceTypes.add(e.sentenceTypeCode);
        });

        lines.push('-- Ensure sentence types exist');
        for (const stCode of Array.from(sentenceTypes)) {
            const example = exampleBatches.find(
                e => e.sentenceTypeCode === stCode,
            );
            if (example) {
                lines.push(
                    `INSERT INTO "SentenceType" ("code", "displayName", "isNegative", "isQuestion") VALUES ('${stCode}', '${stCode.toLowerCase().replace('_', ' ')}', ${example.isNegative}, ${example.isQuestion})`,
                );
                lines.push(`ON CONFLICT ("code") DO NOTHING;`);
            }
        }
        lines.push('');

        // Process examples in batches
        for (let i = 0; i < exampleBatches.length; i += BATCH_SIZE) {
            const batch = exampleBatches.slice(i, i + BATCH_SIZE);
            const values = batch
                .map(
                    e =>
                        `((SELECT "id" FROM "BaseWord" WHERE "word" = '${escapeSqlString(e.word)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${e.languageCode}')), (SELECT "id" FROM "Pronoun" WHERE "pronoun" = '${escapeSqlString(e.pronoun)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${e.languageCode}')), '${escapeSqlString(e.example)}', '${escapeSqlString(e.translation)}', (SELECT "id" FROM "Language" WHERE "code" = '${e.translationLanguageCode}'), (SELECT "id" FROM "SentenceType" WHERE "code" = '${e.sentenceTypeCode}'), (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}'))`,
                )
                .join(',\n  ');

            lines.push(
                `INSERT INTO "WordExample" ("baseWordId", "pronounId", "example", "translation", "translationLanguageId", "sentenceTypeId", "sourceId") VALUES`,
            );
            lines.push(`  ${values}`);
            lines.push(`ON CONFLICT DO NOTHING;`);
            lines.push('');
        }
    }

    // Delete and insert GrammaticalExample records
    if (words.length > 0) {
        lines.push(`DELETE FROM "GrammaticalExample"`);
        lines.push(`WHERE "baseWordId" IN (`);
        lines.push(`  SELECT "id" FROM "BaseWord"`);
        const wordList = words
            .map(w => `'${escapeSqlString(w.word)}'`)
            .join(', ');
        const languageIdSubquery = words[0]
            ? `(SELECT "id" FROM "Language" WHERE "code" = '${words[0].languageCode}')`
            : 'NULL';
        lines.push(`  WHERE "word" IN (${wordList})`);
        lines.push(`  AND "languageId" = ${languageIdSubquery}`);
        lines.push(`);`);
        lines.push('');
    }

    // Insert GrammaticalExample records
    const grammaticalExampleBatches: Array<{
        word: string;
        languageCode: string;
        tenseName: string;
        pronoun: string;
        example: string;
        translation: string;
        translationLanguageCode: string;
        sentenceTypeCode: string;
        isNegative: boolean;
        isQuestion: boolean;
    }> = [];

    wordDataArray.forEach(wordData => {
        wordData.grammaticalExamples.forEach(grammaticalExample => {
            grammaticalExample.examples.forEach(example => {
                example.translations.forEach(translation => {
                    grammaticalExampleBatches.push({
                        word: wordData.word,
                        languageCode: wordData.languageCode,
                        tenseName: grammaticalExample.tenseName,
                        pronoun: example.pronoun,
                        example: example.example,
                        translation: translation.translation,
                        translationLanguageCode: translation.languageCode,
                        sentenceTypeCode: example.sentenceTypeCode,
                        isNegative: example.isNegative,
                        isQuestion: example.isQuestion,
                    });
                });
            });
        });
    });

    if (grammaticalExampleBatches.length > 0) {
        // Ensure tenses exist
        const tenses = new Set<string>();
        grammaticalExampleBatches.forEach(ge => {
            tenses.add(ge.tenseName);
        });

        lines.push('-- Ensure tenses exist');
        for (const tenseName of Array.from(tenses)) {
            const example = grammaticalExampleBatches.find(
                e => e.tenseName === tenseName,
            );
            if (example) {
                lines.push(
                    `INSERT INTO "Tense" ("name", "languageId") VALUES ('${escapeSqlString(tenseName)}', (SELECT "id" FROM "Language" WHERE "code" = '${example.languageCode}'))`,
                );
                lines.push(`ON CONFLICT ("name", "languageId") DO NOTHING;`);
            }
        }
        lines.push('');

        // Ensure pronouns exist
        const pronouns = new Set<{ pronoun: string; languageCode: string }>();
        grammaticalExampleBatches.forEach(ge => {
            pronouns.add({
                pronoun: ge.pronoun,
                languageCode: ge.languageCode,
            });
        });

        lines.push('-- Ensure pronouns exist');
        for (const pronoun of Array.from(pronouns)) {
            lines.push(
                `INSERT INTO "Pronoun" ("pronoun", "languageId") VALUES ('${escapeSqlString(pronoun.pronoun)}', (SELECT "id" FROM "Language" WHERE "code" = '${pronoun.languageCode}'))`,
            );
            lines.push(`ON CONFLICT ("pronoun", "languageId") DO NOTHING;`);
        }
        lines.push('');

        // Process grammatical examples in batches
        for (let i = 0; i < grammaticalExampleBatches.length; i += BATCH_SIZE) {
            const batch = grammaticalExampleBatches.slice(i, i + BATCH_SIZE);
            const values = batch
                .map(
                    ge =>
                        `((SELECT "id" FROM "BaseWord" WHERE "word" = '${escapeSqlString(ge.word)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${ge.languageCode}')), (SELECT "id" FROM "Tense" WHERE "name" = '${escapeSqlString(ge.tenseName)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${ge.languageCode}')), (SELECT "id" FROM "Pronoun" WHERE "pronoun" = '${escapeSqlString(ge.pronoun)}' AND "languageId" = (SELECT "id" FROM "Language" WHERE "code" = '${ge.languageCode}')), '${escapeSqlString(ge.example)}', '${escapeSqlString(ge.translation)}', (SELECT "id" FROM "Language" WHERE "code" = '${ge.translationLanguageCode}'), (SELECT "id" FROM "SentenceType" WHERE "code" = '${ge.sentenceTypeCode}'), (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}'))`,
                )
                .join(',\n  ');

            lines.push(
                `INSERT INTO "GrammaticalExample" ("baseWordId", "tenseId", "pronounId", "example", "translation", "translationLanguageId", "sentenceTypeId", "sourceId") VALUES`,
            );
            lines.push(`  ${values}`);
            lines.push(`ON CONFLICT DO NOTHING;`);
            lines.push('');
        }
    }

    // Transaction end
    lines.push(
        '-- Запись о применении, времени, checksum и gitSha выполняется apply-скриптом параметрами после успешного выполнения',
    );
    lines.push('');
    lines.push(
        `SELECT pg_advisory_unlock(hashtext('data_migrations_global_lock'));`,
    );
    lines.push('COMMIT;');

    return lines.join('\n');
}

/**
 * Generate rollback SQL
 */
export function generateRollbackSQL(
    wordDataArray: WordData[],
    metadata: MigrationMetadata,
): string {
    const { name, timestamp } = metadata;
    const migrationSourceCode = `dm_${timestamp}_${name}`;

    const lines: string[] = [];

    lines.push(`-- Rollback: ${name} (v1)`);
    lines.push(
        `-- Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`,
    );
    lines.push('');

    lines.push('BEGIN;');
    lines.push(`SET LOCAL statement_timeout = '10min';`);
    lines.push(`SET LOCAL lock_timeout = '60s';`);
    lines.push('');

    lines.push(
        '-- Удаляем только записи, созданные этой миграцией (помечены source = dm_...)',
    );
    lines.push('-- Примеры');

    lines.push(`DELETE FROM "GrammaticalExample"`);
    lines.push(
        `WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}');`,
    );
    lines.push('');

    lines.push(`DELETE FROM "WordExample"`);
    lines.push(
        `WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}');`,
    );
    lines.push('');

    lines.push(
        '-- Переводы: явной маркировки нет в схеме, откат переводов не выполняется в v1',
    );
    lines.push('');

    lines.push('-- Новые BaseWord, созданные этой миграцией');
    lines.push(`DELETE FROM "BaseWord"`);
    lines.push(
        `WHERE "sourceId" = (SELECT "id" FROM "WordSource" WHERE "code" = '${migrationSourceCode}');`,
    );
    lines.push('');

    lines.push('COMMIT;');

    return lines.join('\n');
}

/**
 * Calculate checksum for migration SQL
 */
export function calculateChecksum(sql: string): string {
    return crypto.createHash('sha256').update(sql).digest('hex');
}
