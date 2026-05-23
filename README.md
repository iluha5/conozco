# Conozco — Flash Cards

Web app for learning English and Spanish via flash cards and a six-stage training flow (read → choose translation → match → build word from letters → build sentence → spell from audio).

## Stack

Next.js 14 (App Router) + TypeScript, shadcn/ui (Radix + Tailwind), NextAuth, Prisma + PostgreSQL, React Query, Playwright.

## Run locally

```bash
docker compose up --build
```

App on `http://localhost:8000`, Postgres on `5433`. Migrations run automatically.

Without Docker:

```bash
npm install
docker compose up -d postgres
cp .env.example .env.local        # then fill in values
npx prisma migrate dev
npm run dev
```

## Common scripts

```bash
npm run dev                 # Next.js dev server (port 8000)
npm run build && npm start  # production build
npm run lint
npm run type-check
npm run test                # jest unit tests
npm run test:e2e            # Playwright (see e2e/README.md)
npm run prisma:migrate
npm run prisma:studio
npm run db:backup           # required before any migration
```

## Layout

```
app/         Next.js App Router (api/, auth/, training/, words/, settings/, …)
components/  Feature components (training stages, word groups, auth forms, ui/)
hooks/       React hooks grouped by feature
lib/         Server utilities, auth, translation APIs, i18n
prisma/      Schema + migrations + data-migrations
scripts/     CLI scripts (backup, sync, word import pipelines, server setup)
e2e/         Playwright tests (Page Object Model)
```

See `prisma/schema.prisma` for the data model and `.junie/guidelines.md` for code style.
