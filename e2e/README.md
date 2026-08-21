# E2E (Playwright)

```bash
npm install
npx playwright install chromium
```

Tests run against an isolated DB on port `5434` and an isolated app instance on port `8001` (so they don't collide with the main `5433` / `8000`). The test DB is started automatically via `global-setup.ts`; manage it manually if needed with `docker compose -f docker-compose.test.yml up -d`.

## Run

```bash
npm run test:e2e            # headless
npm run test:e2e:ui         # interactive
npm run test:e2e:headed     # visible browser
npm run test:e2e:debug
npm run test:e2e:report     # open last HTML report
```

## Test database

```bash
npm run test:db:up          # start test DB container (port 5434)
npm run test:db:studio      # Prisma Studio for test DB
npm run test:db:down        # stop test DB container
npm run test:db:reset       # wipe volume and recreate container
```

`test:db:studio` fails if the test database container is not running. It does not start the main application database.

## Env vars

| Variable | Default | Purpose |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:8001` | App URL. |
| `TEST_DATABASE_URL` | `postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test` | Test DB URL. |
| `CLEANUP_TEST_DB` | `false` | Stop the test DB container after the run. |

## Troubleshooting

**Tests fail during global setup with migration errors (P3009)**

The test DB may have a stale or failed migration state (often after schema drift). `global-setup.ts` automatically runs `prisma migrate reset` when `migrate deploy` fails, but if problems persist:

```bash
npm run test:db:reset   # wipe volume and recreate container
npm run test:e2e
```

## Layout

```
e2e/
├── fixtures/        # auth, db, test-data, training helpers (re-exported via index.ts)
├── page-objects/    # Page Object Model, all extend BasePage
└── tests/           # auth, words, training
```

Use `createAndLoginUser`, `createAdminAndLoginUser`, `cleanupTestDatabase`, and training helpers instead of driving the UI for setup.

**Auth notes:**
- Public registration: `/auth/register-public`
- Admin registration: `/auth/register` (requires admin session)
- Post-login redirect: `/training/list`
- Most routes are guest-accessible with guest UI stubs (no middleware redirects)
- Header (`[data-test="header-wrapper"]`) is visible for both guests and authenticated users on pages that render `<Header />`
- Guest header: Login + Register buttons, no email or Logout
- Authenticated header: user email + Logout (mobile sidebar uses "Sign out")
- After logout: redirect to `/auth/login` with guest header still visible

**Assertion helpers:**
- `HeaderPage.expectGuestState()` — guest header on any page with Header
- `HeaderPage.expectAuthenticatedState(email?)` — authenticated header
- `WordsPage.expectGuestPageLoaded()` — guest words stub
- `WordsPage.expectPageLoaded()` — authenticated "My words" page

Configuration lives in `playwright.config.ts` (Chromium only, 30s test timeout, 2 retries on CI, 1 worker locally / 4 on CI).
