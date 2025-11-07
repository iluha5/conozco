# Архитектура приложения Flash Cards

## Общая архитектура

Приложение построено на микросервисной архитектуре с использованием Docker Compose:

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   PostgreSQL     │◄────────│   Next.js App    │     │
│  │   (База данных)  │         │  (Frontend+API)  │     │
│  │   Port: 5433     │         │   Port: 8000     │     │
│  └──────────────────┘         └──────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Стек технологий

### Frontend
- **Next.js 14** (App Router) - React framework
- **TypeScript** - Типизация
- **Tailwind CSS** - Утилитарный CSS framework
- **shadcn/ui** - UI компоненты на базе Radix UI
- **Lucide React** - Иконки

### Backend
- **Next.js API Routes** - Serverless функции
- **Prisma ORM** - Работа с базой данных
- **Zod** - Валидация данных (опционально)

### База данных
- **PostgreSQL 16** - Реляционная БД
- **Prisma Client** - Типизированный ORM

### DevOps
- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация контейнеров

## Структура базы данных

### Модель данных

```
┌─────────────────────┐
│       Word          │
├─────────────────────┤
│ id: UUID            │◄────┐
│ foreignWord: String │     │
│ translation: String │     │
│ language: Enum      │     │
│ status: Enum        │     │
│ examples: String[]  │     │
│ createdAt: DateTime │     │
│ updatedAt: DateTime │     │
└─────────────────────┘     │
                             │
┌─────────────────────┐     │
│ TranslationCache    │     │
├─────────────────────┤     │
│ id: UUID            │     │
│ sourceText: String  │     │
│ sourceLanguage: Enum│     │
│ translations: JSON  │     │
│ createdAt: DateTime │     │
└─────────────────────┘     │
                             │
┌─────────────────────┐     │
│  TrainingSession    │     │
├─────────────────────┤     │
│ id: UUID            │     │
│ wordId: UUID        │─────┘
│ stage: Int          │
│ isCorrect: Boolean  │
│ createdAt: DateTime │
└─────────────────────┘
```

### Индексы

- `Word`: composite unique index на `(foreignWord, language)`
- `Word`: compound index на `(language, status)` для быстрой фильтрации
- `TranslationCache`: composite unique index на `(sourceText, sourceLanguage)`
- `TrainingSession`: compound index на `(wordId, stage)` для статистики

## Структура приложения

### Routing (App Router)

```
/                           - Главная страница
/words                      - Управление словами
/training                   - Страница тренировок

/api/words                  - CRUD операции со словами
/api/words/[id]            - Операции с конкретным словом
/api/translations          - Получение переводов
/api/training              - Запись результатов тренировок
```

### Компонентная архитектура

```
app/
├── layout.tsx              - Корневой layout с Toaster
├── page.tsx                - Главная страница
├── words/
│   └── page.tsx            - Страница управления словами
├── training/
│   └── page.tsx            - Страница выбора этапа тренировки
└── api/                    - API Routes

components/
├── ui/                     - Базовые UI компоненты (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── toast.tsx
│   └── toaster.tsx
├── training/               - Компоненты этапов тренировки
│   ├── stage1.tsx          - Просмотр + озвучка
│   ├── stage2.tsx          - Выбор перевода
│   ├── stage3.tsx          - Сопоставление
│   └── stage4.tsx          - Составление слова
└── add-word-dialog.tsx     - Диалог добавления слова

lib/
├── prisma.ts               - Prisma Client singleton
├── translation-mock.ts     - Моки переводов
└── utils.ts                - Вспомогательные функции

hooks/
└── use-toast.ts            - Toast notifications hook
```

## Потоки данных

### Добавление слова

```
1. User вводит слово → AddWordDialog
2. POST /api/translations
   ├── Проверка TranslationCache
   └── Если нет в кеше → Mock API → Сохранение в кеш
3. User выбирает перевод
4. POST /api/words
   └── Сохранение в таблицу Word
5. Обновление UI
```

### Тренировка (любой этап)

```
1. GET /api/words?status=NOT_LEARNED&language=X
2. Компонент этапа отображает слова
3. User проходит тренировку
4. POST /api/training для каждого ответа
   └── Сохранение в TrainingSession
5. Показ статистики
```

### Кеширование переводов

```
Request → Check TranslationCache
           ├── Found → Return from cache
           └── Not found → Call Mock API
                          └── Save to cache
                          └── Return result
```

## Масштабируемость

### Текущая архитектура
- Monolith (Next.js Frontend + Backend)
- Один контейнер приложения
- Один контейнер PostgreSQL

### Возможности масштабирования

1. **Horizontal scaling**
   - Запуск нескольких инстансов Next.js за load balancer
   - Connection pooling через PgBouncer

2. **Separation of concerns**
   - Отдельный API сервис (Node.js/Express)
   - Отдельный Frontend (Next.js SSG)
   - Отдельный сервис переводов

3. **Caching layer**
   - Redis для session storage
   - Redis для кеша переводов (вместо БД)

4. **CDN**
   - Статические ассеты через CDN
   - Edge caching для API responses

## Безопасность

### Текущие меры
- Валидация входных данных на API уровне
- Prisma защита от SQL injection
- CORS настройки Next.js

### Будущие улучшения
- [ ] JWT аутентификация
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] API keys для внешних сервисов
- [ ] HTTPS в production

## Производительность

### Оптимизации
- Prisma connection pooling
- NextJS automatic code splitting
- React Server Components
- Database indexes
- Translation caching

### Metrics
- Response time: ~50-200ms (локально)
- Database queries: Оптимизированы с индексами
- Bundle size: Оптимизирован через tree-shaking

## Мониторинг и логирование

### Текущее состояние
- Console.log для ошибок
- Docker logs

### Рекомендации для production
- Structured logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic/DataDog)
- Database query monitoring (Prisma metrics)

## CI/CD Pipeline

### Рекомендуемый flow для GitLab

```
┌──────────┐    ┌───────┐    ┌──────┐    ┌────────┐
│  Commit  │───►│ Build │───►│ Test │───►│ Deploy │
└──────────┘    └───────┘    └──────┘    └────────┘
                    │            │            │
                    ▼            ▼            ▼
              Docker Build    Linting    Production
                                          Staging
```

### Этапы
1. **Build**: Docker image build & push to registry
2. **Test**: Lint, type check, unit tests
3. **Deploy**: Deploy to staging/production

## Environment Variables

### Development
```env
DATABASE_URL=postgresql://flashcards:flashcards_password@localhost:5433/flashcards
NODE_ENV=development
NEXTAUTH_URL=http://localhost:8000
```

### Production (рекомендуется)
```env
DATABASE_URL=postgresql://user:password@host:5432/db
NODE_ENV=production
GOOGLE_TRANSLATE_API_KEY=your_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.com
```

## Deployment стратегия

### Docker Compose (Current - Local)
```bash
docker compose up --build
```

### Kubernetes (Future)
- Deployment для Next.js app
- StatefulSet для PostgreSQL
- Service для load balancing
- Ingress для routing
- ConfigMap для environment variables
- Secret для sensitive data

### Managed Services (Future)
- **Frontend**: Vercel / Netlify
- **Database**: AWS RDS / Supabase
- **API**: AWS Lambda / Google Cloud Run

## Testing Strategy

### Рекомендуемые типы тестов

1. **Unit Tests**
   - API routes
   - Utility functions
   - React components

2. **Integration Tests**
   - Database operations
   - API endpoints end-to-end

3. **E2E Tests**
   - Playwright/Cypress
   - Критические user flows

## API Design

### RESTful принципы
- GET для чтения
- POST для создания
- PATCH для частичного обновления
- DELETE для удаления

### Response format
```json
{
  "data": {},
  "error": null,
  "metadata": {}
}
```

### Error handling
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

## Future Improvements

### Функционал
- [ ] Multi-user support
- [ ] Social features (share dictionaries)
- [ ] Gamification (achievements, streaks)
- [ ] Spaced repetition algorithm
- [ ] Offline mode (PWA)
- [ ] Mobile app (React Native)

### Технические
- [ ] GraphQL API
- [ ] Real-time updates (WebSockets)
- [ ] Background jobs (Bull/BullMQ)
- [ ] Full-text search (ElasticSearch)
- [ ] Analytics (Mixpanel/Amplitude)

## Вклад в проект

При добавлении нового функционала следуйте:
1. Типизация TypeScript для всех данных
2. Компонентный подход в React
3. API first design
4. Database migrations через Prisma
5. Документация изменений

