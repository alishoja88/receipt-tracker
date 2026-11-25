# CLAUDE.md

ReceiptTrack: upload a photo of a receipt → OCR (Google Cloud Vision) + LLM (OpenAI) extract store, date, total and category → dashboard with spending analytics.

## Layout

```
receipt-tracker-backend/   NestJS 11 + TypeORM + PostgreSQL 16, JWT auth (passport)
  src/modules/
    auth/       users, refresh tokens, JWT/OAuth
    receipts/   core domain (application/ domain/ infrastructure/ presentation/ dto/ entities/)
    expenses/   analytics endpoints
    ai/         OCR + LLM extraction
    stores/     LEGACY: the stores table was dropped (migration 1739...). Verify before touching.
    common/
  src/migrations/   TypeORM migrations (timestamp-prefixed)
receipt-tracker-frontend/  React + Vite + TypeScript, Tailwind, shadcn/ui
  src/modules/{auth,expenses,receipts}   feature modules
  src/pages, src/routes, src/store, src/api
  e2e/                                   Playwright
```

Each module follows a layered structure: `presentation` (controllers) → `application` (services/use cases) → `domain` → `infrastructure` (repositories). Keep new code in that pattern.

## Running locally

```bash
cp receipt-tracker-backend/.env.example receipt-tracker-backend/.env   # fill in keys
make up          # docker compose: postgres :5432, backend :3000, frontend :5173
make logs-backend
make down
```

Without Docker: start Postgres, then `npm run start:dev` in the backend and `npm run dev` in the frontend.

## Commands

Backend (`receipt-tracker-backend/`):
- `npm run build`, `npm run lint`, `npm test`, `npm run test:e2e`
- `npm run migration:generate -- src/migrations/<Name>` then `npm run migration:run`
- `npm run seed`

Frontend (`receipt-tracker-frontend/`):
- `npm run build`, `npm run lint`, `npx vitest run`, `npx playwright test`

## Known state (Nov 2026)

- Both apps build.
- Backend unit tests: 17 of 22 suites fail to compile. The specs still use old entity shapes (e.g. `receipts` on `Store`) from before the "SimplifyReceiptStructure" / "RemoveStoresAndCategoriesTables" migrations. `app.controller.spec.ts` is missing a `ConfigService` provider.
- Frontend: there are no Vitest unit tests. Vitest picks up `e2e/example.spec.ts` (a Playwright file) and fails. Exclude `e2e/**` in `vitest.config.ts`.
- There is no CI yet.
- `STRUCTURE.md` is outdated.

## Rules

- TypeScript strict. No `any` without a comment explaining why.
- Every schema change goes through a migration. Never use `synchronize: true`.
- DB columns are snake_case (map them with `@Column({ name: '...' })`).
- Never commit `.env` or real API keys.
- Add or update tests with every behaviour change. Run build, lint and tests before you say a task is done.
- Small, focused commits with imperative messages (e.g. "Fix receipt service specs after schema simplification").
