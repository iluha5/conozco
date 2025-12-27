import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { importWordData, addWordToGroup } from './process-word-llm';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error(
            'Usage: npx tsx scripts/add-word-from-json.ts <json-file> [group-name-1] [group-name-2] ...',
        );
        process.exit(1);
    }

    const jsonFilePath = args[0];
    const groupNames = args.slice(1);

    try {
        console.log(`📖 Reading word data from: ${jsonFilePath}`);
        const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
        const wordData = JSON.parse(jsonContent);

        console.log(`🔄 Processing word: ${wordData.word}`);
        const baseWordId = await importWordData(wordData);

        if (baseWordId) {
            console.log(`✅ Word processed successfully (ID: ${baseWordId})`);

            // Добавляем в группы
            for (const groupName of groupNames) {
                try {
                    const added = await addWordToGroup(baseWordId, groupName);
                    if (added) {
                        console.log(`➕ Added word to group: ${groupName}`);
                    } else {
                        console.log(`📝 Word already in group: ${groupName}`);
                    }
                } catch (error) {
                    console.error(
                        `❌ Error adding to group ${groupName}:`,
                        error,
                    );
                }
            }
        } else {
            console.log(`⚠️  Word already exists, skipping data import`);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
