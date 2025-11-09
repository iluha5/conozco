# 🔐 Настройка системы авторизации

## ✅ Что было добавлено

Полная система авторизации с использованием NextAuth.js v4:

### 1. База данных

- ✅ Таблица `User` (пользователи с ролями ADMIN/USER)
- ✅ Таблица `Account` (для NextAuth)
- ✅ Таблица `Session` (сессии пользователей)
- ✅ Связь `Word` → `User` (слова привязаны к пользователям)

### 2. API

- ✅ `/api/auth/[...nextauth]` - NextAuth endpoints
- ✅ `/api/auth/register` - регистрация с паролем администратора
- ✅ Все `/api/words/*` endpoints теперь требуют авторизацию

### 3. Страницы

- ✅ `/auth/login` - форма входа
- ✅ `/auth/register` - форма регистрации (защищена паролем admin)
- ✅ Все основные страницы защищены middleware

### 4. UI Компоненты

- ✅ Header с информацией о пользователе и кнопкой выхода
- ✅ Защита роутов через NextAuth middleware

---

## 📦 Установка и запуск

### 1. Обновить .env файл

Добавьте в `.env`:

```env
DATABASE_URL="postgresql://flashcards:flashcards_password@localhost:5433/flashcards"
NEXTAUTH_SECRET="your-secret-key-change-in-production-use-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:8000"
ADMIN_REGISTRATION_PASSWORD="admin123"
```

**Генерация NEXTAUTH_SECRET (для production):**

```bash
openssl rand -base64 32
```

### 2. Остановить Docker контейнеры

```bash
docker compose down
```

### 3. Пересобрать образ с новыми зависимостями

```bash
docker compose build app
```

### 4. Запустить контейнеры

```bash
docker compose up -d
```

### 5. Применить миграции базы данных

```bash
docker compose exec app npx prisma migrate dev --name add_auth
```

### 6. Заполнить базу начальными данными (seed)

```bash
docker compose exec app npm run prisma:seed
```

---

## 👥 Начальные пользователи

После выполнения seed будут созданы 2 пользователя:

### Администратор

- **Email**: `ilya.rovda@gmail.com`
- **Пароль**: `12345678`
- **Роль**: ADMIN

### Обычный пользователь

- **Email**: `user@example.com`
- **Пароль**: `12345678`
- **Роль**: USER

---

## 🔑 Функции авторизации

### Вход в систему

1. Перейдите на http://localhost:8000/auth/login
2. Введите email и пароль
3. После успешного входа вы будете перенаправлены на главную страницу

### Регистрация нового пользователя (только для администратора)

1. Перейдите на http://localhost:8000/auth/register
2. Введите данные нового пользователя
3. **Введите пароль администратора**: `admin123`
4. Пользователь будет создан и сможет войти

### Выход

Нажмите кнопку "Выйти" в header

---

## 🔒 Безопасность

### Хеширование паролей

- Используется **bcryptjs** с cost factor = 10
- Пароли никогда не хранятся в открытом виде
- При миграции данных пароли автоматически хешируются

### Защита роутов

Middleware автоматически защищает:

- `/` - главная страница
- `/words/*` - все страницы словаря
- `/training/*` - все страницы тренировок

Публичные страницы:

- `/auth/login` - вход
- `/auth/register` - регистрация

### Разделение данных

- Каждый пользователь видит только свои слова
- API автоматически фильтрует данные по `userId`
- Невозможно получить доступ к словам другого пользователя

---

## 🛠 Настройка в production

### 1. Изменить пароли

```env
ADMIN_REGISTRATION_PASSWORD="secure-password-here"
```

### 2. Генерировать секрет

```bash
openssl rand -base64 32
```

### 3. Установить правильный URL

```env
NEXTAUTH_URL="https://your-domain.com"
```

### 4. Использовать переменные окружения

Не коммитить `.env` файл в git!

---

## 📚 API Примеры

### Вход (используется NextAuth)

```typescript
import { signIn } from 'next-auth/react';

await signIn('credentials', {
    email: 'user@example.com',
    password: 'password123',
    redirect: false,
});
```

### Регистрация

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "adminPassword": "admin123"
  }'
```

### Получение текущей сессии

```typescript
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
```

---

## 🔧 Troubleshooting

### Ошибка "Unauthorized" при запросах к API

- Убедитесь, что вы вошли в систему
- Проверьте, что сессия активна
- Попробуйте перелогиниться

### Не работает вход

- Проверьте правильность email и пароля
- Убедитесь, что пользователь существует в БД
- Проверьте логи: `docker compose logs -f app`

### Не могу зарегистрировать пользователя

- Убедитесь, что вводите правильный пароль администратора (`admin123`)
- Проверьте, что пользователь с таким email еще не существует

### После миграции пропали старые слова

Слова требуют связи с пользователем. Если у вас были слова до миграции:

```sql
-- Привязать все слова к конкретному пользователю
UPDATE "Word" SET "userId" = 'USER_ID_HERE' WHERE "userId" IS NULL;
```

---

## 📊 Структура базы данных

```
User
├── id (UUID)
├── email (unique)
├── password (hashed)
├── name
├── role (USER | ADMIN)
├── createdAt
└── updatedAt

Word
├── id (UUID)
├── userId (FK → User)  [НОВОЕ!]
├── foreignWord
├── translation
├── language
├── status
├── examples
├── createdAt
└── updatedAt
```

---

**Версия**: 0.2.0  
**Дата**: 24 октября 2024
