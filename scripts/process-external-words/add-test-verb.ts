#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestVerb() {
    console.log('🚀 Adding test verb "cantar" (to sing) to database...');

    try {
        // 1. Получаем или создаем язык (испанский)
        const language = await prisma.language.upsert({
            where: { code: 'es' },
            update: {},
            create: {
                code: 'es',
                name: 'Spanish',
            },
        });
        console.log(`✅ Language: Spanish (ID: ${language.id})`);

        // 2. Получаем или создаем часть речи (глагол)
        const partOfSpeech = await prisma.partOfSpeech.upsert({
            where: {
                name_languageId: {
                    name: 'verb',
                    languageId: language.id,
                },
            },
            update: {},
            create: {
                name: 'verb',
                displayName: 'Verb',
                languageId: language.id,
            },
        });
        console.log(`✅ Part of Speech: verb (ID: ${partOfSpeech.id})`);

        // 3. Получаем или создаем источник (DEEPL для тестирования)
        const wordSource = await prisma.wordSource.upsert({
            where: { code: 'DEEPL' },
            update: {},
            create: {
                code: 'DEEPL',
                displayName: 'DeepL Translation',
            },
        });
        console.log(`✅ Word Source: DEEPL (ID: ${wordSource.id})`);

        // 4. Проверяем, существует ли уже слово
        const existingWord = await prisma.baseWord.findUnique({
            where: {
                word_languageId: {
                    word: 'cantar',
                    languageId: language.id,
                },
            },
        });

        if (existingWord) {
            // Если слово уже существует, обновляем его source на DEEPL
            await prisma.baseWord.update({
                where: { id: existingWord.id },
                data: {
                    sourceId: wordSource.id,
                },
            });
            console.log(
                `✅ Updated existing word "cantar" (ID: ${existingWord.id}) - set source to DEEPL`,
            );
        } else {
            // Создаем новое слово
            const newWord = await prisma.baseWord.create({
                data: {
                    word: 'cantar',
                    languageId: language.id,
                    sourceId: wordSource.id,
                },
            });
            console.log(
                `✅ Created new word "cantar" (ID: ${newWord.id}) with DEEPL source`,
            );
        }

        console.log('\n🎉 Test verb "cantar" is ready for processing!');
        console.log('📝 You can now run the pipeline to process it:');
        console.log('   ./scripts/process-external-words/run-full-pipeline.sh');
    } catch (error) {
        console.error('❌ Error adding test verb:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

addTestVerb();
