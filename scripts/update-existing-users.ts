#!/usr/bin/env ts-node

/**
 * Script to update existing users after auth migration
 * Sets registrationMethod to ADMIN_CREATED and emailVerified to current date
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking existing users...\n');

    // Get all users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            registrationMethod: true,
            emailVerified: true,
            password: true,
        },
    });

    console.log(`Found ${users.length} users\n`);

    if (users.length === 0) {
        console.log('✅ No existing users to update');
        return;
    }

    // Show current state
    console.log('Current state:');
    users.forEach(user => {
        console.log(`  - ${user.email}`);
        console.log(`    registrationMethod: ${user.registrationMethod}`);
        console.log(`    emailVerified: ${user.emailVerified}`);
        console.log(`    hasPassword: ${!!user.password}\n`);
    });

    // Update users that need updating
    const usersToUpdate = users.filter(
        u =>
            u.registrationMethod === 'EMAIL_PASSWORD' ||
            u.emailVerified === null,
    );

    if (usersToUpdate.length === 0) {
        console.log('✅ All users already have correct data');
        return;
    }

    console.log(
        `\n🔄 Updating ${usersToUpdate.length} users to ADMIN_CREATED with verified email...\n`,
    );

    const now = new Date();

    for (const user of usersToUpdate) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                registrationMethod: 'ADMIN_CREATED',
                emailVerified: now,
            },
        });
        console.log(`  ✅ Updated: ${user.email}`);
    }

    console.log('\n✨ All existing users updated successfully!');
    console.log(
        '   - registrationMethod: ADMIN_CREATED (были созданы через admin API)',
    );
    console.log('   - emailVerified: set to current timestamp');
}

main()
    .catch(e => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
