# Word Groups (Группы слов) - Руководство по использованию

## Обзор

Система групп слов позволяет организовывать слова из `BaseWord` по различным категориям (пресетам). Каждое слово может находиться в нескольких группах одновременно (связь many-to-many).

## Структура базы данных

### Таблица `WordGroup`

- `id` - уникальный идентификатор группы
- `name` - название группы (уникальное)
- `createdByUserId` - ID пользователя, создавшего группу
- `visibility` - тип видимости группы (PUBLIC, PRIVATE, SHARED)
- `isApproved` - одобрена ли группа администратором (по умолчанию false)
- `createdAt` - дата создания
- `updatedAt` - дата последнего обновления

### Enum `WordGroupVisibility`

- `PUBLIC` - группа видна всем пользователям (требует одобрения администратора)
- `PRIVATE` - группа видна только создателю (по умолчанию)
- `SHARED` - группа видна определенным пользователям (список в `WordGroupAccess`)

### Поле `isApproved` (модерация)

- Используется для контроля публичных групп
- По умолчанию `false` при создании группы
- Для `PUBLIC` групп: группа видна всем только если `isApproved = true`
- Для `PRIVATE` и `SHARED` групп: поле игнорируется (доступ определяется создателем и списком в `WordGroupAccess`)
- Одобрение группы выполняется администратором

### Таблица `BaseWordOnWordGroup` (промежуточная)

- `baseWordId` - ID слова из BaseWord
- `wordGroupId` - ID группы
- `assignedAt` - дата добавления слова в группу

### Таблица `WordGroupAccess` (управление доступом)

- `id` - уникальный идентификатор
- `wordGroupId` - ID группы
- `userId` - ID пользователя с доступом
- `grantedAt` - дата предоставления доступа

### Таблица `UserWordGroup` (активные группы пользователя)

- `id` - уникальный идентификатор
- `userId` - ID пользователя
- `wordGroupId` - ID группы
- `activatedAt` - дата добавления группы в активные

**Важно:** Эта таблица отличается от `WordGroupAccess`:

- `WordGroupAccess` = К каким группам пользователь имеет **доступ** (для SHARED)
- `UserWordGroup` = Какие группы **активны** для пользователя (работа/фильтры)

**Правила:**

- Группы, созданные пользователем, автоматически активны (нельзя удалить)
- Доступные группы (PUBLIC/SHARED) можно добавлять/удалять из активных
- В фильтрах показываются только активные группы

## Примеры использования

### 1. Создание новой группы слов (автоматически активируется для создателя)

```typescript
import { prisma } from '@/lib/prisma';

// Создать приватную группу "Еда" и автоматически активировать для создателя
const userId = 1;

const foodGroup = await prisma.$transaction(async tx => {
    // Создаем группу
    const group = await tx.wordGroup.create({
        data: {
            name: 'Еда',
            createdByUserId: userId,
            visibility: 'PRIVATE',
        },
    });

    // Автоматически добавляем в активные группы создателя
    await tx.userWordGroup.create({
        data: {
            userId: userId,
            wordGroupId: group.id,
        },
    });

    return group;
});

// Или через вложенное создание
const travelGroup = await prisma.wordGroup.create({
    data: {
        name: 'Путешествия',
        createdByUserId: userId,
        visibility: 'PUBLIC',
        activeUsers: {
            create: {
                userId: userId, // Автоматически активна для создателя
            },
        },
    },
});

// Создать группу с ограниченным доступом
const businessGroup = await prisma.wordGroup.create({
    data: {
        name: 'Бизнес',
        createdByUserId: userId,
        visibility: 'SHARED',
        sharedWith: {
            create: [
                { userId: 2 }, // Предоставить доступ пользователю 2
                { userId: 3 }, // Предоставить доступ пользователю 3
            ],
        },
        activeUsers: {
            create: {
                userId: userId, // Активна для создателя
            },
        },
    },
});
```

### 2. Добавление слов в группу

```typescript
// Добавить несколько слов в группу "Еда"
await prisma.baseWordOnWordGroup.createMany({
    data: [
        { baseWordId: 1, wordGroupId: foodGroup.id },
        { baseWordId: 2, wordGroupId: foodGroup.id },
        { baseWordId: 3, wordGroupId: foodGroup.id },
    ],
});

// Или добавить через связь
await prisma.wordGroup.update({
    where: { id: foodGroup.id },
    data: {
        baseWords: {
            create: [{ baseWordId: 4 }, { baseWordId: 5 }],
        },
    },
});
```

### 3. Получение всех слов из группы

```typescript
// Получить группу со всеми словами
const groupWithWords = await prisma.wordGroup.findUnique({
    where: { id: foodGroup.id },
    include: {
        baseWords: {
            include: {
                baseWord: {
                    include: {
                        translations: true,
                        language: true,
                    },
                },
            },
        },
    },
});

console.log('Группа:', groupWithWords.name);
console.log(
    'Слова:',
    groupWithWords.baseWords.map(bw => bw.baseWord.word),
);
```

### 4. Получение всех групп, к которым принадлежит слово

```typescript
const wordWithGroups = await prisma.baseWord.findUnique({
    where: { id: 1 },
    include: {
        wordGroups: {
            include: {
                wordGroup: true,
            },
        },
    },
});

console.log('Слово:', wordWithGroups.word);
console.log(
    'Группы:',
    wordWithGroups.wordGroups.map(wg => wg.wordGroup.name),
);
```

### 5. Получение всех групп

```typescript
const allGroups = await prisma.wordGroup.findMany({
    include: {
        _count: {
            select: { baseWords: true },
        },
    },
});

allGroups.forEach(group => {
    console.log(`${group.name}: ${group._count.baseWords} слов`);
});
```

### 6. Удаление слова из группы

```typescript
await prisma.baseWordOnWordGroup.delete({
    where: {
        baseWordId_wordGroupId: {
            baseWordId: 1,
            wordGroupId: foodGroup.id,
        },
    },
});
```

### 7. Удаление группы (слова останутся)

```typescript
// Благодаря CASCADE, все связи в BaseWordOnWordGroup автоматически удалятся
await prisma.wordGroup.delete({
    where: { id: foodGroup.id },
});
```

### 8. Получение слов из нескольких групп (пересечение)

```typescript
// Найти слова, которые находятся в обеих группах
const wordsInBothGroups = await prisma.baseWord.findMany({
    where: {
        wordGroups: {
            some: {
                wordGroupId: {
                    in: [foodGroup.id, travelGroup.id],
                },
            },
        },
    },
    include: {
        wordGroups: {
            include: {
                wordGroup: true,
            },
        },
    },
});
```

### 9. Поиск слов только в одной конкретной группе

```typescript
const wordsOnlyInFood = await prisma.baseWord.findMany({
    where: {
        wordGroups: {
            some: {
                wordGroupId: foodGroup.id,
            },
            none: {
                wordGroupId: {
                    not: foodGroup.id,
                },
            },
        },
    },
});
```

### 10. Управление доступом к группе

```typescript
// Предоставить доступ пользователю к группе
await prisma.wordGroupAccess.create({
    data: {
        wordGroupId: businessGroup.id,
        userId: 4,
    },
});

// Предоставить доступ нескольким пользователям
await prisma.wordGroupAccess.createMany({
    data: [
        { wordGroupId: businessGroup.id, userId: 5 },
        { wordGroupId: businessGroup.id, userId: 6 },
    ],
    skipDuplicates: true, // Пропустить, если доступ уже есть
});

// Отозвать доступ у пользователя
await prisma.wordGroupAccess.delete({
    where: {
        wordGroupId_userId: {
            wordGroupId: businessGroup.id,
            userId: 4,
        },
    },
});

// Изменить видимость группы
await prisma.wordGroup.update({
    where: { id: businessGroup.id },
    data: {
        visibility: 'PUBLIC', // Сделать группу публичной
    },
});
```

### 11. Получение групп, доступных пользователю

```typescript
// Получить все группы, которые видит пользователь
const userId = 1;

const visibleGroups = await prisma.wordGroup.findMany({
    where: {
        OR: [
            {
                visibility: 'PUBLIC',
                isApproved: true, // Только одобренные публичные группы
            },
            { createdByUserId: userId }, // Группы, созданные пользователем (любые)
            {
                visibility: 'SHARED',
                sharedWith: {
                    some: { userId }, // Группы, к которым предоставлен доступ
                },
            },
        ],
    },
    include: {
        createdBy: {
            select: { id: true, name: true, email: true },
        },
        _count: {
            select: { baseWords: true },
        },
    },
});
```

### 12. Проверка доступа пользователя к группе

```typescript
async function canUserAccessGroup(
    userId: number,
    groupId: number,
): Promise<boolean> {
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
        include: {
            sharedWith: {
                where: { userId },
            },
        },
    });

    if (!group) return false;

    // Публичная группа доступна только если одобрена
    if (group.visibility === 'PUBLIC' && group.isApproved) return true;

    // Создатель имеет доступ к своим группам всегда
    if (group.createdByUserId === userId) return true;

    // Проверка доступа для SHARED групп
    if (group.visibility === 'SHARED' && group.sharedWith.length > 0)
        return true;

    return false;
}
```

### 13. Получение групп, созданных пользователем

```typescript
const myGroups = await prisma.wordGroup.findMany({
    where: {
        createdByUserId: 1,
    },
    include: {
        _count: {
            select: {
                baseWords: true,
                sharedWith: true, // Количество пользователей с доступом
            },
        },
    },
});
```

### 14. Получение активных групп пользователя (для фильтрации)

```typescript
// Получить только активные группы пользователя
const activeGroups = await prisma.userWordGroup.findMany({
    where: { userId: 1 },
    include: {
        wordGroup: {
            include: {
                _count: {
                    select: { baseWords: true },
                },
            },
        },
    },
});

console.log('Активные группы для фильтрации:');
activeGroups.forEach(ag => {
    console.log(
        `- ${ag.wordGroup.name} (${ag.wordGroup._count.baseWords} слов)`,
    );
});
```

### 15. Получение доступных групп (не активированных)

```typescript
// Получить группы, к которым есть доступ, но еще не активированы
const userId = 1;

const availableGroups = await prisma.wordGroup.findMany({
    where: {
        OR: [
            { visibility: 'PUBLIC', isApproved: true },
            {
                visibility: 'SHARED',
                sharedWith: { some: { userId } },
            },
        ],
        // Исключаем уже активированные группы
        NOT: {
            activeUsers: { some: { userId } },
        },
        // Исключаем свои группы (они всегда активны автоматически)
        NOT: {
            createdByUserId: userId,
        },
    },
    include: {
        createdBy: {
            select: { name: true },
        },
        _count: {
            select: { baseWords: true },
        },
    },
});

console.log('Доступные для добавления группы:');
availableGroups.forEach(g => {
    console.log(
        `- ${g.name} (${g._count.baseWords} слов) by ${g.createdBy.name}`,
    );
});
```

### 16. Активация (добавление) группы к себе

```typescript
// Пользователь добавляет доступную группу к себе
async function activateGroup(userId: number, groupId: number) {
    // Проверить, что группа доступна пользователю
    const group = await prisma.wordGroup.findFirst({
        where: {
            id: groupId,
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                { visibility: 'SHARED', sharedWith: { some: { userId } } },
            ],
        },
    });

    if (!group) {
        throw new Error('Group not available');
    }

    // Добавить в активные
    return await prisma.userWordGroup.create({
        data: {
            userId,
            wordGroupId: groupId,
        },
    });
}

// Использование
await activateGroup(1, 5); // Активировать группу ID 5
```

### 17. Деактивация (удаление) группы из активных

```typescript
// Удалить группу из активных (только если не создатель)
async function deactivateGroup(userId: number, groupId: number) {
    // Проверить, что пользователь не создатель
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.createdByUserId === userId) {
        throw new Error('Cannot remove your own group from active groups');
    }

    // Удалить из активных
    return await prisma.userWordGroup.delete({
        where: {
            userId_wordGroupId: {
                userId,
                wordGroupId: groupId,
            },
        },
    });
}

// Использование
await deactivateGroup(1, 5); // Деактивировать группу ID 5
```

### 18. Полная картина для пользователя

```typescript
// Получить полную информацию о группах для пользователя
async function getUserGroupsOverview(userId: number) {
    // 1. Активные группы (в работе)
    const active = await prisma.userWordGroup.findMany({
        where: { userId },
        include: {
            wordGroup: {
                include: {
                    _count: { select: { baseWords: true } },
                },
            },
        },
    });

    // 2. Доступные для добавления
    const available = await prisma.wordGroup.findMany({
        where: {
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                { visibility: 'SHARED', sharedWith: { some: { userId } } },
            ],
            NOT: {
                OR: [
                    { activeUsers: { some: { userId } } },
                    { createdByUserId: userId },
                ],
            },
        },
        include: {
            createdBy: { select: { name: true } },
            _count: { select: { baseWords: true } },
        },
    });

    // 3. Созданные пользователем
    const created = await prisma.wordGroup.findMany({
        where: { createdByUserId: userId },
        include: {
            _count: { select: { baseWords: true } },
        },
    });

    return {
        active: active.map(a => ({
            id: a.wordGroup.id,
            name: a.wordGroup.name,
            wordsCount: a.wordGroup._count.baseWords,
            activatedAt: a.activatedAt,
            isOwner: a.wordGroup.createdByUserId === userId,
            canRemove: a.wordGroup.createdByUserId !== userId,
        })),
        available: available.map(g => ({
            id: g.id,
            name: g.name,
            wordsCount: g._count.baseWords,
            createdBy: g.createdBy.name,
            visibility: g.visibility,
        })),
        created: created.map(g => ({
            id: g.id,
            name: g.name,
            wordsCount: g._count.baseWords,
            visibility: g.visibility,
            isApproved: g.isApproved,
        })),
    };
}
```

### 19. Одобрение/отклонение групп администратором

```typescript
// Получить все группы, ожидающие одобрения
async function getPendingApprovalGroups() {
    return await prisma.wordGroup.findMany({
        where: {
            visibility: 'PUBLIC',
            isApproved: false,
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { baseWords: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });
}

// Одобрить группу (только для администраторов)
async function approveGroup(groupId: number, adminUserId: number) {
    // Проверить, что пользователь - администратор
    const admin = await prisma.user.findUnique({
        where: { id: adminUserId },
        include: { role: true },
    });

    if (!admin || admin.role.code !== 'ADMIN') {
        throw new Error('Only administrators can approve groups');
    }

    return await prisma.wordGroup.update({
        where: { id: groupId },
        data: { isApproved: true },
    });
}

// Отклонить группу (опционально можно удалить или сменить visibility на PRIVATE)
async function rejectGroup(groupId: number, adminUserId: number) {
    const admin = await prisma.user.findUnique({
        where: { id: adminUserId },
        include: { role: true },
    });

    if (!admin || admin.role.code !== 'ADMIN') {
        throw new Error('Only administrators can reject groups');
    }

    // Вариант 1: Вернуть группу в приватный режим
    return await prisma.wordGroup.update({
        where: { id: groupId },
        data: {
            visibility: 'PRIVATE',
            isApproved: false,
        },
    });

    // Вариант 2: Удалить группу (раскомментировать при необходимости)
    // return await prisma.wordGroup.delete({
    //   where: { id: groupId },
    // });
}

// Запрос пользователя на публикацию группы (требует последующего одобрения)
async function requestPublicGroup(groupId: number, userId: number) {
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group || group.createdByUserId !== userId) {
        throw new Error('You can only request publication for your own groups');
    }

    return await prisma.wordGroup.update({
        where: { id: groupId },
        data: {
            visibility: 'PUBLIC',
            isApproved: false, // Ожидает одобрения
        },
    });
}
```

## API Endpoints (пример)

### POST `/api/word-groups` - Создать группу

```typescript
// app/api/word-groups/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
        name,
        visibility = 'PRIVATE',
        sharedWithUserIds = [],
    } = await request.json();

    const group = await prisma.wordGroup.create({
        data: {
            name,
            createdByUserId: session.user.id,
            visibility,
            ...(visibility === 'SHARED' &&
                sharedWithUserIds.length > 0 && {
                    sharedWith: {
                        create: sharedWithUserIds.map((userId: number) => ({
                            userId,
                        })),
                    },
                }),
            // Автоматически активировать для создателя
            activeUsers: {
                create: {
                    userId: session.user.id,
                },
            },
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { baseWords: true, sharedWith: true },
            },
        },
    });

    return NextResponse.json(group);
}
```

### GET `/api/word-groups` - Получить доступные группы

```typescript
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Получить только группы, доступные пользователю
    const groups = await prisma.wordGroup.findMany({
        where: {
            OR: [
                {
                    visibility: 'PUBLIC',
                    isApproved: true, // Только одобренные публичные группы
                },
                { createdByUserId: userId }, // Свои группы (в любом статусе)
                {
                    visibility: 'SHARED',
                    sharedWith: { some: { userId } },
                },
            ],
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: {
                    baseWords: true,
                    sharedWith: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(groups);
}
```

### POST `/api/word-groups/[id]/words` - Добавить слова в группу

```typescript
// app/api/word-groups/[id]/words/route.ts
export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { baseWordIds } = await request.json();
    const groupId = parseInt(params.id);

    // Проверить, что пользователь является владельцем группы
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group || group.createdByUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.baseWordOnWordGroup.createMany({
        data: baseWordIds.map((baseWordId: number) => ({
            baseWordId,
            wordGroupId: groupId,
        })),
        skipDuplicates: true,
    });

    return NextResponse.json({ success: true });
}
```

### POST `/api/word-groups/[id]/access` - Управление доступом к группе

```typescript
// app/api/word-groups/[id]/access/route.ts
export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const { action, userIds } = await request.json(); // action: 'grant' | 'revoke'

    // Проверить, что пользователь является владельцем группы
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group || group.createdByUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'grant') {
        // Предоставить доступ
        await prisma.wordGroupAccess.createMany({
            data: userIds.map((userId: number) => ({
                wordGroupId: groupId,
                userId,
            })),
            skipDuplicates: true,
        });
    } else if (action === 'revoke') {
        // Отозвать доступ
        await prisma.wordGroupAccess.deleteMany({
            where: {
                wordGroupId: groupId,
                userId: { in: userIds },
            },
        });
    }

    return NextResponse.json({ success: true });
}

// Получить список пользователей с доступом к группе
export async function GET(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);

    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group || group.createdByUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const access = await prisma.wordGroupAccess.findMany({
        where: { wordGroupId: groupId },
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    return NextResponse.json(access);
}
```

### PATCH `/api/word-groups/[id]` - Изменить группу

```typescript
// app/api/word-groups/[id]/route.ts
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const { name, visibility } = await request.json();

    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group || group.createdByUserId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // При смене на PUBLIC - сбросить isApproved (потребуется новое одобрение)
    const updateData: any = {
        ...(name && { name }),
        ...(visibility && { visibility }),
    };

    if (visibility === 'PUBLIC' && group.visibility !== 'PUBLIC') {
        updateData.isApproved = false; // Требуется одобрение администратора
    }

    const updated = await prisma.wordGroup.update({
        where: { id: groupId },
        data: updateData,
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { baseWords: true, sharedWith: true },
            },
        },
    });

    return NextResponse.json(updated);
}
```

### GET `/api/admin/word-groups/pending` - Группы на модерации (Admin)

```typescript
// app/api/admin/word-groups/pending/route.ts
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверить права администратора
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (!user || user.role.code !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 },
        );
    }

    // Получить группы, ожидающие одобрения
    const pendingGroups = await prisma.wordGroup.findMany({
        where: {
            visibility: 'PUBLIC',
            isApproved: false,
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
            _count: {
                select: { baseWords: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(pendingGroups);
}
```

### POST `/api/admin/word-groups/[id]/approve` - Одобрить группу (Admin)

```typescript
// app/api/admin/word-groups/[id]/approve/route.ts
export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (!user || user.role.code !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 },
        );
    }

    const groupId = parseInt(params.id);

    const updated = await prisma.wordGroup.update({
        where: { id: groupId },
        data: { isApproved: true },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${updated.name}" has been approved`,
        group: updated,
    });
}
```

### POST `/api/admin/word-groups/[id]/reject` - Отклонить группу (Admin)

```typescript
// app/api/admin/word-groups/[id]/reject/route.ts
export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true },
    });

    if (!user || user.role.code !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 },
        );
    }

    const groupId = parseInt(params.id);

    // Вернуть группу в приватный режим
    const updated = await prisma.wordGroup.update({
        where: { id: groupId },
        data: {
            visibility: 'PRIVATE',
            isApproved: false,
        },
        include: {
            createdBy: {
                select: { id: true, name: true, email: true },
            },
        },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${updated.name}" has been rejected and set to private`,
        group: updated,
    });
}
```

### GET `/api/user/word-groups/active` - Получить активные группы пользователя

```typescript
// app/api/user/word-groups/active/route.ts
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeGroups = await prisma.userWordGroup.findMany({
        where: { userId: session.user.id },
        include: {
            wordGroup: {
                include: {
                    _count: {
                        select: { baseWords: true },
                    },
                },
            },
        },
        orderBy: { activatedAt: 'desc' },
    });

    return NextResponse.json(
        activeGroups.map(ag => ({
            id: ag.wordGroup.id,
            name: ag.wordGroup.name,
            wordsCount: ag.wordGroup._count.baseWords,
            visibility: ag.wordGroup.visibility,
            isOwner: ag.wordGroup.createdByUserId === session.user.id,
            canRemove: ag.wordGroup.createdByUserId !== session.user.id,
            activatedAt: ag.activatedAt,
        })),
    );
}
```

### GET `/api/user/word-groups/available` - Получить доступные для добавления группы

```typescript
// app/api/user/word-groups/available/route.ts
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const availableGroups = await prisma.wordGroup.findMany({
        where: {
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                {
                    visibility: 'SHARED',
                    sharedWith: { some: { userId } },
                },
            ],
            NOT: {
                OR: [
                    { activeUsers: { some: { userId } } },
                    { createdByUserId: userId },
                ],
            },
        },
        include: {
            createdBy: {
                select: { name: true },
            },
            _count: {
                select: { baseWords: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
        availableGroups.map(g => ({
            id: g.id,
            name: g.name,
            wordsCount: g._count.baseWords,
            visibility: g.visibility,
            createdBy: g.createdBy.name,
        })),
    );
}
```

### POST `/api/user/word-groups/[id]/activate` - Активировать группу

```typescript
// app/api/user/word-groups/[id]/activate/route.ts
export async function POST(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const userId = session.user.id;

    // Проверить, что группа доступна пользователю
    const group = await prisma.wordGroup.findFirst({
        where: {
            id: groupId,
            OR: [
                { visibility: 'PUBLIC', isApproved: true },
                { visibility: 'SHARED', sharedWith: { some: { userId } } },
            ],
        },
    });

    if (!group) {
        return NextResponse.json(
            { error: 'Group not available' },
            { status: 404 },
        );
    }

    // Проверить, что еще не активирована
    const existing = await prisma.userWordGroup.findUnique({
        where: {
            userId_wordGroupId: { userId, wordGroupId: groupId },
        },
    });

    if (existing) {
        return NextResponse.json(
            { error: 'Group already activated' },
            { status: 400 },
        );
    }

    // Активировать
    await prisma.userWordGroup.create({
        data: { userId, wordGroupId: groupId },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${group.name}" activated`,
    });
}
```

### DELETE `/api/user/word-groups/[id]/deactivate` - Деактивировать группу

```typescript
// app/api/user/word-groups/[id]/deactivate/route.ts
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } },
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groupId = parseInt(params.id);
    const userId = session.user.id;

    // Проверить, что пользователь не создатель
    const group = await prisma.wordGroup.findUnique({
        where: { id: groupId },
    });

    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.createdByUserId === userId) {
        return NextResponse.json(
            { error: 'Cannot remove your own group from active groups' },
            { status: 403 },
        );
    }

    // Удалить из активных
    await prisma.userWordGroup.delete({
        where: {
            userId_wordGroupId: { userId, wordGroupId: groupId },
        },
    });

    return NextResponse.json({
        success: true,
        message: `Group "${group.name}" deactivated`,
    });
}
```

## Примеры использования в приложении

### Компонент выбора группы при обучении

```typescript
'use client';

import { useState, useEffect } from 'react';

interface WordGroup {
  id: number;
  name: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'SHARED';
  createdBy: { name: string };
  _count: { baseWords: number };
}

export function TrainingGroupSelector() {
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/word-groups')
      .then(res => res.json())
      .then(setGroups);
  }, []);

  const startTraining = () => {
    if (selectedGroupId) {
      window.location.href = `/training?groupId=${selectedGroupId}`;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const badges = {
      PUBLIC: '🌐 Публичная',
      PRIVATE: '🔒 Личная',
      SHARED: '👥 Общая',
    };
    return badges[visibility as keyof typeof badges];
  };

  return (
    <div>
      <h2>Выберите группу слов для обучения</h2>
      <select
        value={selectedGroupId || ''}
        onChange={(e) => setSelectedGroupId(Number(e.target.value))}
      >
        <option value="">Все слова</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name} ({group._count.baseWords} слов) - {getVisibilityBadge(group.visibility)} - by {group.createdBy.name}
          </option>
        ))}
      </select>
      <button onClick={startTraining}>Начать тренировку</button>
    </div>
  );
}
```

### Компонент управления доступом к группе

```typescript
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface WordGroupAccessManager {
  groupId: number;
  groupName: string;
}

export function WordGroupAccessManager({ groupId, groupName }: WordGroupAccessManager) {
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'SHARED'>('PRIVATE');
  const [sharedUsers, setSharedUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    // Загрузить текущий список пользователей с доступом
    fetch(`/api/word-groups/${groupId}/access`)
      .then(res => res.json())
      .then(data => setSharedUsers(data.map((a: any) => a.user)));

    // Загрузить список всех пользователей (для выбора)
    fetch('/api/users')
      .then(res => res.json())
      .then(setAllUsers);
  }, [groupId]);

  const handleVisibilityChange = async (newVisibility: string) => {
    await fetch(`/api/word-groups/${groupId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: newVisibility }),
    });
    setVisibility(newVisibility as any);
  };

  const grantAccess = async () => {
    if (!selectedUserId) return;

    await fetch(`/api/word-groups/${groupId}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'grant', userIds: [selectedUserId] }),
    });

    const user = allUsers.find(u => u.id === selectedUserId);
    if (user) {
      setSharedUsers([...sharedUsers, user]);
    }
    setSelectedUserId(null);
  };

  const revokeAccess = async (userId: number) => {
    await fetch(`/api/word-groups/${groupId}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revoke', userIds: [userId] }),
    });

    setSharedUsers(sharedUsers.filter(u => u.id !== userId));
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Управление доступом: {groupName}</h3>

      <div className="mb-4">
        <label className="block mb-2">Видимость группы:</label>
        <select
          value={visibility}
          onChange={(e) => handleVisibilityChange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="PRIVATE">🔒 Личная (только я)</option>
          <option value="PUBLIC">🌐 Публичная (все пользователи)</option>
          <option value="SHARED">👥 Общая (выбранные пользователи)</option>
        </select>
      </div>

      {visibility === 'SHARED' && (
        <div>
          <h4 className="font-semibold mb-2">Пользователи с доступом:</h4>
          <ul className="mb-4">
            {sharedUsers.map(user => (
              <li key={user.id} className="flex justify-between items-center p-2 border-b">
                <span>{user.name} ({user.email})</span>
                <button
                  onClick={() => revokeAccess(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Отозвать доступ
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="border p-2 rounded flex-1"
            >
              <option value="">Выберите пользователя</option>
              {allUsers
                .filter(u => !sharedUsers.find(su => su.id === u.id))
                .map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
            </select>
            <button
              onClick={grantAccess}
              disabled={!selectedUserId}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              Предоставить доступ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Рекомендации

1. **Именование групп**: Используйте понятные названия на русском языке (например, "Еда", "Путешествия", "Бизнес")
2. **Предустановленные группы**: Создайте публичные группы от имени системного администратора для популярных категорий
3. **Права доступа**:
    - `PRIVATE` - по умолчанию для пользовательских групп
    - `PUBLIC` - для общедоступных тематических групп (требует модерации)
    - `SHARED` - для группового обучения или совместной работы
4. **Модерация PUBLIC групп**:
    - Все PUBLIC группы требуют одобрения администратора (`isApproved = true`)
    - Пользователи могут запрашивать публикацию своих групп
    - Администратор может одобрить или отклонить запрос
    - Неодобренные PUBLIC группы видны только создателю
5. **Производительность**: Индексы уже настроены для быстрого поиска по группам и проверки доступа
6. **Безопасность**: Всегда проверяйте права доступа перед изменением группы или её содержимого
7. **Каскадное удаление**: При удалении пользователя все его группы и доступы автоматически удаляются

## Workflow модерации PUBLIC групп

```
Пользователь                    Система                      Администратор
     │                              │                              │
     │  Создает группу              │                              │
     │  (visibility=PRIVATE)        │                              │
     │─────────────────────────────▶│                              │
     │                              │                              │
     │  Запрашивает публикацию      │                              │
     │  (visibility=PUBLIC,         │                              │
     │   isApproved=false)          │                              │
     │─────────────────────────────▶│                              │
     │                              │                              │
     │                              │  Уведомление о новой группе  │
     │                              │  на модерации                │
     │                              │─────────────────────────────▶│
     │                              │                              │
     │                              │         Проверка контента    │
     │                              │◀─────────────────────────────│
     │                              │                              │
     │                              │         Одобрение/Отклонение │
     │                              │◀─────────────────────────────│
     │                              │                              │
     │  Если одобрено:              │                              │
     │  isApproved=true             │                              │
     │  Группа видна всем           │                              │
     │◀─────────────────────────────│                              │
     │                              │                              │
     │  Если отклонено:             │                              │
     │  visibility=PRIVATE          │                              │
     │  Группа снова приватная      │                              │
     │◀─────────────────────────────│                              │
```

## Следующие шаги

- [ ] Создать API endpoints для управления группами (CRUD)
- [ ] Создать API endpoints для управления доступом к группам
- [ ] Добавить UI для создания и редактирования групп
- [ ] Добавить UI для управления видимостью и списком пользователей с доступом
- [ ] Добавить фильтр по группам в тренировках
- [ ] Создать seed-скрипт с предустановленными публичными группами
- [ ] Добавить возможность массового добавления слов в группы
- [ ] Добавить поиск групп по названию
- [ ] Добавить статистику по группам (сколько пользователей используют)
- [ ] Добавить возможность клонирования публичных групп в личные
