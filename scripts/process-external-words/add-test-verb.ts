#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestVerb() {
    try {
        const language = await prisma.language.upsert({
            where: { code: 'es' },
            update: {},
            create: { code: 'es', name: 'Spanish' },
        });

        await prisma.partOfSpeech.upsert({
            where: { name: 'VERB' },
            update: {},
            create: { name: 'VERB' },
        });

        const wordSource = await prisma.wordSource.upsert({
            where: { code: 'DEEPL' },
            update: {},
            create: { code: 'DEEPL', displayName: 'DeepL Translation' },
        });

        const existingWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word: 'cantar',
                    languageId: language.id,
                },
            },
        });

        if (existingWord) {
            await prisma.baseWord.update({
                where: { id: existingWord.id },
                data: { sourceId: wordSource.id },
            });
            console.log(
                `Updated "cantar" (id=${existingWord.id}) source to DEEPL.`,
            );
        } else {
            const newWord = await prisma.baseWord.create({
                data: {
                    word: 'cantar',
                    languageId: language.id,
                    sourceId: wordSource.id,
                },
            });
            console.log(
                `Created "cantar" (id=${newWord.id}) with DEEPL source.`,
            );
        }
    } catch (error) {
        console.error('Error adding test verb:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

addTestVerb();
