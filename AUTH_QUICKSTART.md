# ⚡ Быстрый старт с авторизацией

## 🚀 За 5 шагов

### 1. Добавьте переменные окружения

Создайте или обновите файл `.env` в корне проекта:
```bash
DATABASE_URL="postgresql://flashcards:flashcards_password@localhost:5433/flashcards"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:8000"
ADMIN_REGISTRATION_PASSWORD="admin123"
```

### 2. Пересоберите и запустите
```bash
docker compose down
docker compose up --build -d
```

### 3. Примените миграции
```bash
docker compose exec app npx prisma migrate dev --name add_auth
```

### 4. Создайте начальных пользователей
```bash
docker compose exec app npm run prisma:seed
```

### 5. Откройте браузер и войдите

**Откройте**: http://localhost:8000

Вы будете перенаправлены на страницу входа.

**Войдите как администратор:**
- Email: `ilya.rovda@gmail.com`
- Пароль: `12345678`

**Или как обычный пользователь:**
- Email: `user@example.com`
- Пароль: `12345678`

---

## ✅ Готово!

После входа вы можете:
- Добавлять свои слова
- Проходить тренировки
- Управлять словарем
- Создавать новых пользователей (если вы admin)

---

## 🔑 Регистрация новых пользователей

1. Перейдите на http://localhost:8000/auth/register
2. Заполните форму
3. **Введите пароль администратора**: `admin123`
4. Новый пользователь создан!

---

## 📚 Подробная документация

См. `AUTH_SETUP.md` для детальной информации

---

**Все слова теперь привязаны к вашему аккаунту!** 🎉

