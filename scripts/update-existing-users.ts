#!/usr/bin/env ts-node

// One-shot post-auth-migration backfill: marks legacy users as ADMIN_CREATED with verified email.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            registrationMethod: true,
            emailVerified: true,
            password: true,
        },
    });

    if (users.length === 0) {
        console.log('No users found.');
        return;
    }

    const usersToUpdate = users.filter(
        user =>
            user.registrationMethod === 'EMAIL_PASSWORD' ||
            user.emailVerified === null,
    );

    if (usersToUpdate.length === 0) {
        console.log(`${users.length} users — already up to date.`);
        return;
    }

    const now = new Date();

    for (const user of usersToUpdate) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                registrationMethod: 'ADMIN_CREATED',
                emailVerified: now,
            },
        });
    }

    console.log(`Updated ${usersToUpdate.length} of ${users.length} users.`);
}

main()
    .catch(error => {
        console.error('Update failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
