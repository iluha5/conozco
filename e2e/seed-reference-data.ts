import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('🌱 Seeding reference data for E2E tests...');

    // Create user roles
    const userRolesData = [
        { code: 'USER', displayName: 'Пользователь' },
        { code: 'ADMIN', displayName: 'Администратор' },
    ];

    for (const role of userRolesData) {
        await prisma.userRole.upsert({
            where: { code: role.code },
            update: {
                displayName: role.displayName,
            },
            create: role,
        });
    }
    console.log('✅ Ensured user roles');

    // Create word statuses
    const wordStatusesData = [
        { code: 'NOT_LEARNED', displayName: 'Не выучено' },
        { code: 'LEARNED', displayName: 'Выучено' },
    ];

    for (const status of wordStatusesData) {
        await prisma.wordStatus.upsert({
            where: { code: status.code },
            update: {
                displayName: status.displayName,
            },
            create: status,
        });
    }
    console.log('✅ Ensured word statuses');

    // Create languages
    const languagesData = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'ru', name: 'Russian' },
    ];

    for (const lang of languagesData) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: {},
            create: lang,
        });
    }
    console.log('✅ Ensured languages');

    // Create word sources
    const wordSourcesData = [
        { code: 'native', displayName: 'Вручную' },
        { code: 'DEEPL', displayName: 'DeepL Translation API' },
        { code: 'MYMEMORY', displayName: 'MyMemory Translation API' },
        { code: 'TATOEBA', displayName: 'Tatoeba' },
    ];

    for (const source of wordSourcesData) {
        await prisma.wordSource.upsert({
            where: { code: source.code },
            update: {
                displayName: source.displayName,
            },
            create: source,
        });
    }
    console.log('✅ Ensured word sources');

    console.log('✅ Reference data seeding completed!');
}

main()
    .catch(e => {
        console.error('❌ Error seeding reference data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
