# Word Groups - Схема базы данных

## Диаграмма связей

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ id (PK)             │
│ email               │
│ name                │
│ ...                 │
└─────────────────────┘
         │ 1
         │ creates
         │
         ↓ *
┌─────────────────────┐         ┌──────────────────────┐
│     WordGroup       │    *    │  WordGroupAccess     │
│─────────────────────│────────▶│──────────────────────│
│ id (PK)             │         │ id (PK)              │
│ name (UNIQUE)       │         │ wordGroupId (FK)     │
│ createdByUserId(FK) │         │ userId (FK)          │
│ visibility (ENUM)   │    *    │ grantedAt            │
│ isApproved (BOOL)   │◀────────│                      │
│ createdAt           │         └──────────────────────┘
│ updatedAt           │
└─────────────────────┘                    │
         │ *                               │ *
         │                                 │
         │                                 ↓ 1
         │                          ┌─────────────────┐
         │                          │      User       │
         │                          │─────────────────│
         │                          │ id (PK)         │
         │                          └─────────────────┘
         ↓
┌──────────────────────┐
│BaseWordOnWordGroup   │
│──────────────────────│
│ baseWordId (PK,FK)   │
│ wordGroupId (PK,FK)  │
│ assignedAt           │
└──────────────────────┘
         │ *
         │
         ↓ 1
┌─────────────────────┐
│      BaseWord       │
│─────────────────────│
│ id (PK)             │
│ word                │
│ languageId (FK)     │
│ sourceId (FK)       │
└─────────────────────┘
```

## Enum: WordGroupVisibility

```
┌────────────────────────┐
│ WordGroupVisibility    │
├────────────────────────┤
│ • PUBLIC               │  → Видна всем
│ • PRIVATE (default)    │  → Видна только создателю
│ • SHARED               │  → Видна определенным пользователям
└────────────────────────┘
```

## Примеры сценариев

### Сценарий 1: Публичная группа

```
User (id=1, role=admin) создает группу:
  └─ WordGroup (name="Еда", visibility=PUBLIC, createdByUserId=1)
       └─ BaseWordOnWordGroup → связывает слова

Любой User может видеть и использовать эту группу
```

### Сценарий 2: Личная группа

```
User (id=2) создает группу:
  └─ WordGroup (name="Мои слова", visibility=PRIVATE, createdByUserId=2)
       └─ BaseWordOnWordGroup → связывает слова

Только User (id=2) может видеть эту группу
```

### Сценарий 3: Группа с ограниченным доступом

```
User (id=3) создает группу:
  └─ WordGroup (name="Групповое обучение", visibility=SHARED, createdByUserId=3)
       ├─ BaseWordOnWordGroup → связывает слова
       └─ WordGroupAccess (userId=4) → доступ для User (id=4)
       └─ WordGroupAccess (userId=5) → доступ для User (id=5)

Группу видят: User (id=3, 4, 5)
```

## SQL запросы для проверки

### Получить все группы с количеством слов

```sql
SELECT
  wg.id,
  wg.name,
  wg.visibility,
  u.name as creator_name,
  COUNT(bwwg."baseWordId") as words_count
FROM "WordGroup" wg
LEFT JOIN "User" u ON u.id = wg."createdByUserId"
LEFT JOIN "BaseWordOnWordGroup" bwwg ON bwwg."wordGroupId" = wg.id
GROUP BY wg.id, u.name
ORDER BY wg."createdAt" DESC;
```

### Получить группы, доступные пользователю

```sql
-- Для userId = 1
SELECT DISTINCT wg.*
FROM "WordGroup" wg
LEFT JOIN "WordGroupAccess" wga ON wga."wordGroupId" = wg.id
WHERE
  wg.visibility = 'PUBLIC'
  OR wg."createdByUserId" = 1
  OR (wg.visibility = 'SHARED' AND wga."userId" = 1);
```

### Получить список пользователей с доступом к группе

```sql
-- Для groupId = 1
SELECT
  u.id,
  u.name,
  u.email,
  wga."grantedAt"
FROM "WordGroupAccess" wga
JOIN "User" u ON u.id = wga."userId"
WHERE wga."wordGroupId" = 1;
```

## Индексы (для производительности)

```
WordGroup:
  ├─ PRIMARY KEY (id)
  ├─ UNIQUE INDEX (name)
  ├─ INDEX (name) - для поиска
  ├─ INDEX (createdByUserId) - для фильтрации групп пользователя
  ├─ INDEX (visibility) - для фильтрации по типу
  ├─ INDEX (isApproved) - для фильтрации одобренных групп
  └─ INDEX (visibility, isApproved) - комбинированный для PUBLIC одобренных групп

BaseWordOnWordGroup:
  ├─ PRIMARY KEY (baseWordId, wordGroupId)
  ├─ INDEX (baseWordId) - для поиска групп по слову
  └─ INDEX (wordGroupId) - для поиска слов по группе

WordGroupAccess:
  ├─ PRIMARY KEY (id)
  ├─ UNIQUE (wordGroupId, userId) - один доступ на пользователя
  ├─ INDEX (wordGroupId) - для списка пользователей группы
  └─ INDEX (userId) - для списка групп пользователя
```

## Foreign Keys и каскады

```
WordGroup.createdByUserId → User.id
  ON DELETE CASCADE  (удаление пользователя → удаление его групп)

BaseWordOnWordGroup.baseWordId → BaseWord.id
  ON DELETE CASCADE  (удаление слова → удаление связей)

BaseWordOnWordGroup.wordGroupId → WordGroup.id
  ON DELETE CASCADE  (удаление группы → удаление связей)

WordGroupAccess.wordGroupId → WordGroup.id
  ON DELETE CASCADE  (удаление группы → удаление доступов)

WordGroupAccess.userId → User.id
  ON DELETE CASCADE  (удаление пользователя → удаление доступов)
```

## Правила бизнес-логики

1. **Название группы уникально** - нельзя создать две группы с одинаковым названием
2. **По умолчанию PRIVATE** - новые группы приватные
3. **По умолчанию неодобренные** - `isApproved = false` при создании
4. **Создатель всегда имеет доступ** - не нужно добавлять в WordGroupAccess
5. **PUBLIC группы требуют одобрения** - видны всем только если `isApproved = true`
6. **Модерация только для PUBLIC** - для PRIVATE и SHARED поле `isApproved` игнорируется
7. **SHARED требует WordGroupAccess** - список пользователей обязателен
8. **Одно слово в группе один раз** - PRIMARY KEY (baseWordId, wordGroupId)
9. **Один пользователь один доступ** - UNIQUE (wordGroupId, userId)

## Правила модерации (isApproved)

### Для PUBLIC групп:

```sql
-- Группа видна всем, только если одобрена
SELECT * FROM "WordGroup"
WHERE visibility = 'PUBLIC' AND "isApproved" = true;

-- Создатель видит свою неодобренную PUBLIC группу
SELECT * FROM "WordGroup"
WHERE "createdByUserId" = :userId;
```

### Для PRIVATE и SHARED групп:

```sql
-- Поле isApproved игнорируется
-- Доступ определяется createdByUserId или WordGroupAccess
```

### Workflow модерации:

1. Пользователь создает группу → `visibility = 'PRIVATE'`, `isApproved = false`
2. Пользователь запрашивает публикацию → `visibility = 'PUBLIC'`, `isApproved = false`
3. Администратор одобряет → `isApproved = true` (группа видна всем)
4. Администратор отклоняет → `visibility = 'PRIVATE'`, `isApproved = false`
