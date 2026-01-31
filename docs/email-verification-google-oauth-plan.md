---
name: Email verification and Google OAuth implementation
overview: План внедрения регистрации через email с обязательной верификацией и авторизации через Google OAuth, с сохранением функционала административной регистрации
todos:
  - id: db-migration
    content: "Создать миграцию БД: добавить VerificationToken модель, сделать password nullable, добавить emailVerified поле"
    status: pending
  - id: email-service-setup
    content: "Настроить Resend (бесплатный тариф): зарегистрироваться, добавить домен conozco.net, настроить DNS в Namecheap, получить API ключ"
    status: pending
  - id: google-oauth-setup
    content: "Настроить Google OAuth: создать проект в Google Cloud Console, получить Client ID и Secret"
    status: pending
  - id: update-auth-config
    content: "Обновить lib/auth.ts: добавить Email и Google провайдеры, обновить callbacks для проверки emailVerified"
    status: pending
  - id: public-registration-api
    content: Создать app/api/auth/register-public/route.ts для публичной регистрации с отправкой верификации
    status: pending
  - id: update-admin-registration
    content: "Обновить app/api/auth/register/route.ts: устанавливать emailVerified для админских пользователей"
    status: pending
  - id: email-verification-api
    content: Создать app/api/auth/verify-email/route.ts для подтверждения email по токену
    status: pending
  - id: resend-verification-api
    content: "Создать app/api/auth/resend-verification/route.ts: реализовать rate limiting через EmailResendLog (минимум 3 минуты между запросами для одного email)"
    status: pending
  - id: update-register-page
    content: "Обновить app/auth/register/page.tsx: добавить публичную регистрацию, Google OAuth, сохранить админскую форму"
    status: pending
  - id: update-login-page
    content: "Обновить app/auth/login/page.tsx: добавить Google OAuth кнопку, проверку emailVerified"
    status: pending
  - id: resend-component
    content: Создать components/auth/ResendVerificationEmail.tsx для повторной отправки верификации
    status: pending
  - id: update-middleware
    content: "Обновить middleware.ts: добавить проверку emailVerified для email-регистраций"
    status: pending
  - id: install-dependencies
    content: "Установить зависимости: resend или nodemailer для отправки email"
    status: pending
  - id: env-variables
    content: "Добавить переменные окружения: RESEND_API_KEY, EMAIL_FROM, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    status: pending
  - id: github-actions-secrets
    content: "Настроить GitHub Actions секреты: добавить RESEND_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET для CI/CD"
    status: pending
---

# План внедрения email-верификации и Google OAuth

## Текущее состояние

- Используется NextAuth v4.24.5 с Credentials provider
- Модель `User` имеет обязательное поле `password`
- Модель `Account` уже существует (для OAuth провайдеров)
- Модель `Session` существует
- Отсутствует модель `VerificationToken` (необходима для email provider)
- Регистрация доступна только администратору через `/api/auth/register` с проверкой `ADMIN_REGISTRATION_PASSWORD`

## Изменения в базе данных

### 1. Добавить модель VerificationToken

Необходимо для работы NextAuth Email provider. Файл: `prisma/schema.prisma`

```prisma
model VerificationToken {
  id         String   @id @default(cuid())
  identifier String
  token      String   @unique
  expires    DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, token])
}
```

### 2. Обновить модель User

- Сделать `password` опциональным (nullable) - для OAuth пользователей пароль не нужен
- Добавить поле `emailVerified` (DateTime?) - для отслеживания подтверждения email
- Добавить поле `createdBy` (enum или поле) - для различения способа регистрации (admin/public/oauth)

Файл: `prisma/schema.prisma`

```prisma
model User {
  // ... существующие поля
  password       String?    // было: String
  emailVerified  DateTime?
  // ... остальные поля
}
```

### 3. Добавить модель EmailResendLog

Для отслеживания времени последней отправки верификации и реализации rate limiting (интервал 3 минуты).

Файл: `prisma/schema.prisma`

```prisma
model EmailResendLog {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  sentAt    DateTime @default(now())
  
  @@unique([email])
  @@index([email, sentAt])
}
```

### 4. Миграция базы данных

- Создать миграцию для добавления `VerificationToken`
- Добавить таблицу `EmailResendLog` для rate limiting (интервал 3 минуты)
- Обновить существующих пользователей: установить `emailVerified = createdAt` (считаем существующих пользователей верифицированными)
- Сделать `password` nullable

## Изменения в коде аутентификации

### 1. Обновить `lib/auth.ts`

Добавить два новых провайдера:

- **Email Provider** - для регистрации через email с верификацией
- **Google Provider** - для OAuth авторизации

Файл: `lib/auth.ts`

Изменения:

- Импортировать `EmailProvider` и `GoogleProvider` из `next-auth/providers`
- Добавить Email provider с настройкой SMTP
- Добавить Google provider с `clientId` и `clientSecret`
- Обновить `authorize` в Credentials provider для проверки `emailVerified`
- Добавить callback `signIn` для проверки верификации email при входе через credentials
- Обновить callback `jwt` и `session` для работы с новыми провайдерами

### 2. Создать новый публичный API для регистрации

Файл: `app/api/auth/register-public/route.ts` (новый)

- Принимает email, password, name
- Проверяет, что пользователь не существует
- Создает пользователя с `emailVerified = null`
- Отправляет email с токеном верификации через NextAuth
- Возвращает сообщение о необходимости подтверждения email

### 3. Обновить административный API регистрации

Файл: `app/api/auth/register/route.ts`

- Сохранить текущий функционал (проверка `adminPassword`)
- При создании пользователя администратором устанавливать `emailVerified = now()` (админ создает верифицированных пользователей)

### 4. Создать API для подтверждения email

Файл: `app/api/auth/verify-email/route.ts` (новый)

- Принимает токен верификации
- Проверяет токен через NextAuth
- Устанавливает `emailVerified = now()` для пользователя
- Перенаправляет на страницу входа с сообщением об успехе

### 5. Обновить страницу регистрации

Файл: `app/auth/register/page.tsx`

- Добавить два варианта регистрации:
  - **Публичная регистрация** (по умолчанию) - форма email/password с отправкой письма
  - **Через Google** - кнопка "Sign in with Google"
  - **Административная регистрация** (скрытая/отдельная секция) - текущая форма с `adminPassword`
- Показывать сообщение о необходимости подтверждения email после публичной регистрации
- Добавить ссылку на повторную отправку письма верификации

### 6. Обновить страницу входа

Файл: `app/auth/login/page.tsx`

- Добавить кнопку "Sign in with Google"
- Обновить форму входа: проверять `emailVerified` и показывать сообщение, если email не подтвержден
- Добавить ссылку на повторную отправку письма верификации

### 7. Создать API для повторной отправки верификации

Файл: `app/api/auth/resend-verification/route.ts` (новый)

- Принимает email пользователя
- Проверяет, что пользователь существует и email не подтвержден
- **Rate limiting**: проверяет время последней отправки для данного email
  - Минимальный интервал между запросами: **3 минуты**
  - Хранить время последней отправки в БД в таблице `EmailResendLog`
  - Если прошло менее 3 минут, возвращать ошибку с указанием оставшегося времени
- Отправляет новое письмо с токеном верификации через NextAuth
- Обновляет время последней отправки
- Возвращает успешный ответ (не раскрывая, существует ли пользователь)

**Реализация rate limiting:**

Использовать отдельную таблицу `EmailResendLog` для отслеживания времени последней отправки:

```prisma
model EmailResendLog {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  sentAt    DateTime @default(now())
  
  @@unique([email])
  @@index([email, sentAt])
}
```

При запросе на повторную отправку:
1. Проверить наличие записи в `EmailResendLog` для данного email
2. Если запись существует и `sentAt` меньше 3 минут назад - вернуть ошибку с оставшимся временем
3. Если можно отправить - обновить `sentAt` (или создать запись) и отправить письмо

### 8. Создать компонент для повторной отправки верификации

Файл: `components/auth/ResendVerificationEmail.tsx` (новый)

- Форма с полем email
- API endpoint `/api/auth/resend-verification` для повторной отправки
- Обработка ошибок rate limiting с отображением сообщения о необходимости подождать
- Показывать таймер обратного отсчета, если запрос заблокирован rate limit

### 9. Обновить middleware для проверки верификации

Файл: `middleware.ts`

- Добавить проверку `emailVerified` для пользователей, зарегистрированных через email
- Разрешить доступ только верифицированным пользователям (кроме OAuth, где email уже верифицирован провайдером)

## Настройка отправки email

### Варианты сервисов для рассылки

#### Вариант 1: Resend (рекомендуется)

- **Плюсы**: Отличный DX, React Email интеграция, простой API, хорошая доставляемость
- **Цена**: Free tier - 100 писем/день, Pro - $20/месяц (50k писем + custom domain)
- **Настройка**: 
  - Регистрация на resend.com
  - Добавление домена conozco.net
  - Настройка DNS записей (SPF, DKIM) в Namecheap
  - Получение API ключа

#### Вариант 2: SendGrid

- **Плюсы**: Популярный сервис, хорошая документация
- **Минусы**: Дороже, сложнее настройка
- **Цена**: Free tier - 100 писем/день, Essentials - от $19.95/месяц

#### Вариант 3: Mailgun

- **Плюсы**: Enterprise функции, отличная доставляемость
- **Минусы**: Сложнее для стартапов
- **Цена**: От $15/месяц (10k писем)

#### Вариант 4: AWS SES

- **Плюсы**: Очень дешево ($0.10 за 1000 писем)
- **Минусы**: Сложная настройка, требует AWS аккаунт, sandbox режим изначально

### Выбранный сервис: Resend (бесплатный тариф)

Для проекта выбран **Resend на бесплатном тарифе**:
- 100 писем в день бесплатно
- Все функции включены (включая custom domain на бесплатном тарифе)
- Отличный DX и простой API
- Хорошая доставляемость

**Ограничения бесплатного тарифа:**
- 100 писем/день (достаточно для старта)
- При необходимости можно перейти на Pro ($20/месяц) для увеличения лимита до 50k писем/месяц

### Настройка DNS для conozco.net в Namecheap

После выбора сервиса нужно добавить DNS записи:

1. **SPF запись** (TXT):

   - Имя: `@` или домен
   - Значение: предоставляется сервисом (например, `v=spf1 include:_spf.resend.com ~all`)

2. **DKIM записи** (CNAME или TXT):

   - Обычно несколько записей для разных селекторов
   - Имена и значения предоставляются сервисом

3. **DMARC запись** (TXT, опционально):

   - Имя: `_dmarc`
   - Значение: `v=DMARC1; p=none; rua=mailto:admin@conozco.net`

### Переменные окружения

Добавить в `.env` (локальная разработка) и на production сервере:

```env
# Email configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@conozco.net

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth (уже есть)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://conozco.net
```

### Хранение секретов в GitHub Actions

**Важно**: API ключи и секреты должны храниться в GitHub Actions Secrets для безопасного использования в CI/CD пайплайнах.

#### Настройка секретов в GitHub

1. Перейти в репозиторий на GitHub
2. Открыть **Settings** → **Secrets and variables** → **Actions**
3. Нажать **New repository secret**
4. Добавить следующие секреты:

   **RESEND_API_KEY**:
   ```
   re_xxxxxxxxxxxxx
   ```
   (API ключ из Resend dashboard)

   **GOOGLE_CLIENT_ID**:
   ```
   your-google-client-id.apps.googleusercontent.com
   ```
   (Client ID из Google Cloud Console)

   **GOOGLE_CLIENT_SECRET**:
   ```
   your-google-client-secret
   ```
   (Client Secret из Google Cloud Console)

#### Использование в GitHub Actions workflow

В файле `.github/workflows/*.yml` использовать секреты через `${{ secrets.SECRET_NAME }}`:

```yaml
env:
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  GOOGLE_CLIENT_ID: ${{ secrets.GOOGLE_CLIENT_ID }}
  GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
```

#### Почему это важно

- **Безопасность**: API ключи не попадают в код и историю коммитов
- **Разделение окружений**: Можно использовать разные ключи для dev/staging/production
- **Ротация ключей**: Легко обновить ключи без изменения кода
- **Аудит**: GitHub отслеживает, кто и когда использовал секреты

**Примечание**: На production сервере эти переменные должны быть установлены в `.env` файле или через переменные окружения контейнера/системы.

## Настройка Google OAuth

### 1. Создать проект в Google Cloud Console

1. Перейти на [console.cloud.google.com](https://console.cloud.google.com)
2. Создать новый проект или выбрать существующий
3. Включить Google+ API
4. Перейти в "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Выбрать "Web application"
6. Добавить Authorized redirect URIs:

   - `https://conozco.net/api/auth/callback/google`
   - `http://localhost:8000/api/auth/callback/google` (для разработки)

7. Сохранить `Client ID` и `Client Secret`

### 2. Настроить OAuth consent screen

- Выбрать тип приложения (External для публичного доступа)
- Заполнить информацию о приложении
- Добавить scopes: `email`, `profile`
- Добавить тестовых пользователей (если приложение в тестовом режиме)

## Безопасность

### Обязательные проверки

1. **Email верификация обязательна** для публичной регистрации через email

   - Пользователь не может войти до подтверждения email
   - Токен верификации имеет срок действия (24 часа по умолчанию в NextAuth)

2. **Rate limiting** для API регистрации и повторной отправки

   - **Повторная отправка верификации**: минимальный интервал **3 минуты** между запросами для одного email
     - Хранить время последней отправки в БД в таблице `EmailResendLog`
     - Проверять время последней отправки перед отправкой нового письма
     - Возвращать ошибку с указанием оставшегося времени ожидания, если прошло менее 3 минут
     - Обновлять `sentAt` в `EmailResendLog` после успешной отправки
   - **Регистрация**: ограничить количество запросов с одного IP (например, 5 регистраций в час)
   - Предотвратить спам и злоупотребления

3. **Валидация email**

   - Проверка формата email на клиенте и сервере
   - Проверка существования домена (опционально)

4. **Защита от перечисления пользователей**

   - Не раскрывать, существует ли пользователь с данным email при регистрации
   - Унифицированные сообщения об ошибках

5. **Безопасность токенов**

   - Токены верификации одноразовые
   - Короткий срок жизни токенов
   - Хеширование токенов в БД (NextAuth делает это автоматически)

## Шаги реализации

1. **Подготовка БД**

   - Создать миграцию для `VerificationToken`
   - Добавить таблицу `EmailResendLog` для rate limiting (интервал 3 минуты)
   - Обновить модель `User` (nullable password, emailVerified)
   - Применить миграцию

2. **Настройка email сервиса**

   - Зарегистрироваться на Resend (бесплатный тариф)
   - Добавить домен conozco.net в Resend dashboard
   - Настроить DNS записи (SPF, DKIM) в Namecheap согласно инструкциям Resend
   - Получить API ключ из Resend dashboard
   - Добавить `RESEND_API_KEY` в GitHub Actions Secrets

3. **Настройка Google OAuth**

   - Создать проект в Google Cloud Console
   - Настроить OAuth credentials
   - Получить Client ID и Secret
   - Добавить `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в GitHub Actions Secrets

4. **Обновление кода аутентификации**

   - Добавить Email и Google провайдеры в `lib/auth.ts`
   - Создать публичный API регистрации
   - Обновить административный API регистрации
   - Создать API для верификации email
   - Создать API для повторной отправки с rate limiting (1 минута)

5. **Обновление UI**

   - Обновить страницу регистрации
   - Обновить страницу входа
   - Создать компонент для повторной отправки верификации

6. **Тестирование**

   - Протестировать публичную регистрацию с верификацией
   - Протестировать Google OAuth
   - Убедиться, что административная регистрация работает
   - Протестировать повторную отправку верификации
   - Протестировать rate limiting: убедиться, что повторная отправка блокируется на 3 минуты

7. **Настройка секретов**

   - Добавить секреты в GitHub Actions (RESEND_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
   - Настроить переменные окружения на production сервере
   - Обновить CI/CD workflow для использования секретов

8. **Документация**

   - Обновить README с инструкциями по настройке
   - Добавить примеры переменных окружения
   - Документировать процесс добавления секретов в GitHub Actions

## Файлы для изменения/создания

### Изменяемые файлы:

- `prisma/schema.prisma` - добавить VerificationToken, EmailResendLog, обновить User
- `lib/auth.ts` - добавить Email и Google провайдеры
- `app/api/auth/register/route.ts` - обновить для установки emailVerified
- `app/auth/register/page.tsx` - добавить публичную регистрацию и Google
- `app/auth/login/page.tsx` - добавить Google OAuth кнопку
- `middleware.ts` - добавить проверку emailVerified

### Новые файлы:

- `prisma/migrations/YYYYMMDDHHMMSS_add_email_verification/migration.sql` - миграция БД (VerificationToken, EmailResendLog)
- `app/api/auth/register-public/route.ts` - публичный API регистрации
- `app/api/auth/verify-email/route.ts` - API подтверждения email
- `app/api/auth/resend-verification/route.ts` - API повторной отправки с rate limiting (3 минуты через EmailResendLog)
- `components/auth/ResendVerificationEmail.tsx` - компонент повторной отправки с обработкой rate limit
- `lib/email.ts` - утилиты для отправки email (если нужна кастомная логика)

## Зависимости

Нужно установить:

- `nodemailer` или `resend` (в зависимости от выбранного сервиса)
- `@types/nodemailer` (если используется nodemailer)

Для Resend (выбранный вариант):

```bash
npm install resend
```

**Примечание**: NextAuth Email provider может работать напрямую с Resend через переменную `EMAIL_SERVER`, но для лучшего контроля можно использовать кастомную интеграцию через Resend API.
