### Flash Cards — Core AI Engineering Guidelines (Condensed)

- Priorities: Functionality > Tests; Consistency > Perfection; Simplicity > Optimization; Type‑Safety > Speed.
- TypeScript: strict; no `any` (use specific types or `unknown`); `@/` path alias; explicit prop types; descriptive names.
- React Components: PascalCase component files; named exports; event handlers are named functions (no inline anonymous arrows in JSX).
- Component structure: Component folder in PascalCase; subfolders `components/`, `hooks/`, `helpers/`; local types in `typing.ts`.
- Custom Hooks: `useHookName` naming; file in camelCase; location by scope (shared/feature/component); return an object (not array).
- UI Library: do NOT modify `components/ui/` directly — wrap instead; keep accessibility intact.
- State: React Query for server state; React Context for global UI state.
- Forms: controlled inputs with `useState`; Zod validation; disable UI during submission.
- API Routes: wrap in try/catch; proper HTTP status codes; check session for protected routes.
- Error Handling: try/catch in async; Error Boundaries for critical UI; toasts via `sonner`; use `console.error` while debugging; provide fallback UI.
- Naming: variables/functions camelCase; constants UPPER_SNAKE_CASE; types PascalCase; files: components PascalCase, utilities camelCase.
- Git: commit messages in English; do not commit without explicit user instruction.
- Database Safety: ALWAYS back up before dangerous operations or migrations (`npm run db:backup`). If backup fails — stop.
- Security: secrets live in `.env` (never committed).
- Architecture: feature‑based structure; colocation; single responsibility; composition over inheritance; smart logic via hooks.
- Never do: `any`, edits in `components/ui/`, code duplication, single‑letter identifiers, anonymous JSX handlers.

Tip: Keep this core in context for long tasks. For short prompts, just say: "Rules: Core Guidelines apply."
