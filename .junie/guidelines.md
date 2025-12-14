# Flash Cards Project Guidelines

## Priorities

1. Functionality > Tests
2. Consistency > Perfection
3. Simplicity > Optimization
4. Type Safety > Development Speed

## ❌ Don't

- Use `any` (use specific types or `unknown`)
- Modify `components/ui/` directly (wrap instead)
- Repeat code (extract to hooks/utils)
- Use single-letter variables
- Use anonymous arrows in event handlers
- Commit without user instruction

## TypeScript

- Strict mode, avoid `any`
- Use `@/` path alias
- Explicit prop types
- Descriptive variable names (no single letters)

## React Components

- PascalCase naming (`ComponentName.tsx`)
- Named exports
- Named callbacks in handlers (not anonymous)
- Component folder structure:
    - Component folder: PascalCase, direct export (no index.ts)
    - Subfolders: `components/`, `hooks/`, `helpers/`
    - Types: `typing.ts` in component folder

## Custom Hooks

- Name: `useHookName`
- File: camelCase matching hook name (`useHook.ts`, not `use-hook.ts`)
- Location:
    - Shared → `hooks/shared/`
    - Feature → `hooks/[feature]/`
    - Component-specific → `components/[feature]/hooks/`
- Return object (not array)

## API Routes

- Try-catch for errors
- Proper status codes
- Check session for protected routes

## State Management

- React Query: server state (API)
- React Context: global UI state

## Forms

- Controlled components with `useState`
- Zod validation
- Disable during submission

## UI Components

- Base: `components/ui/` (don't modify, wrap instead)
- Accessibility included

## Icons

- Use `lucide-react`

## Naming

- Components: PascalCase (`ComponentName`)
- Functions/vars: camelCase (`functionName`)
- Constants: UPPER_SNAKE_CASE (`CONSTANT_NAME`)
- Files: PascalCase for components, camelCase for utils
- Types: PascalCase (`TypeName`)

## Error Handling

- Try-catch for async code
- Error Boundaries for critical UI
- `sonner` for toast notifications
- `console.error` for debugging
- Fallback UI on errors

## Git

- Commit messages in English
- Never commit without user instruction

## Database Safety

**ALWAYS backup before dangerous operations**

- Backup: `./scripts/backup-db.sh` or `npm run db:backup`
- Dangerous ops: DROP, TRUNCATE, mass DELETE, schema changes, migrations
- Workflow: backup → verify ✅ → proceed → inform user
- If backup fails, DO NOT proceed

Migration commands requiring backup:

- `npm run prisma:migrate`, `prisma migrate deploy`, `prisma db push`, `npm run prisma:seed`

## Security

- Secrets in `.env` (not in Git)

## Common Patterns

### Dialogs

- Use `useHashDialog` from `@/hooks/shared` with unique ID
- DialogFooter: `flex-row justify-end gap-2` for mobile

### Loading States

```tsx
<Loader2 className="w-8 h-8 animate-spin text-purple-600" />
```

## Architecture

- Feature-based structure
- Colocation
- Single Responsibility
- Composition over Inheritance
- Smart/Dumb separation via hooks
