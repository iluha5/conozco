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

## Env vars

| Variable | Default | Purpose |
|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `http://localhost:8001` | App URL. |
| `TEST_DATABASE_URL` | `postgresql://flashcards_test:flashcards_test_password@localhost:5434/flashcards_test` | Test DB URL. |
| `CLEANUP_TEST_DB` | `false` | Stop the test DB container after the run. |

## Layout

```
e2e/
├── fixtures/        # auth, db, test-data, api helpers (re-exported via index.ts)
├── page-objects/    # Page Object Model, all extend BasePage
└── tests/           # auth, words, training, settings
```

Use `createAndLoginUser`, `registerAndLoginUser`, `cleanupTestDatabase` and the API helpers (`createWordViaAPI`, etc.) instead of driving the UI for setup. Configuration lives in `playwright.config.ts` (Chromium only, 30s test timeout, 2 retries on CI, 4 workers).
