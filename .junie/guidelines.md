# Flash Cards Project Guidelines

## General Principles

This project is a web application for learning words using flashcards. It uses Next.js 14 (App Router), TypeScript, Prisma ORM, PostgreSQL, NextAuth for authentication, and Tailwind CSS for styling.

## Project Priorities

When working with code, follow these priorities (from highest to lowest):

1. **Functionality > Tests** - focus on working features, tests are optional
2. **Consistency > Perfection** - follow existing project patterns, even if there's a "better" way
3. **Simplicity > Optimization** - readable and understandable code is more important than micro-optimizations
4. **Type Safety > Development Speed** - use strict typing, avoid `any`

## ❌ What NOT to Do

- **Don't use `any`** without extreme necessity - use specific types or `unknown`
- **Don't create Server Components with `'use client'`** - add the directive only when client-side interactivity is needed
- **Don't modify files in `components/ui/`** directly - these components are from shadcn/ui, wrap them if customization is needed
- **Don't commit `.env` files** - they contain secrets and should be in `.gitignore`
- **Don't use inline styles** - use Tailwind classes instead of the `style` attribute
- **Don't repeat code** - extract reusable logic into hooks or utilities
- **Don't use single-letter variable names** - always use descriptive, meaningful names (e.g., `word` instead of `w`, `index` instead of `i`)
- **Don't use anonymous arrow functions in event handlers** - create named callbacks with descriptive names
- **Don't leave unused variables** - remove unused state variables, parameters, and destructured values (excluding type definitions)
- **Don't make git commits without user instruction** - only commit when explicitly requested

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL 16
- **UI Components**: Radix UI (via shadcn/ui), Lucide React for icons
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query), React Context
- **Authentication**: NextAuth
- **Validation**: Zod
- **Linting and Formatting**: ESLint, Prettier, Husky, lint-staged
- **Testing**: Jest

## Project Structure

```
/app                    - Next.js App Router (pages, layouts, API routes)
/components             - React components
  /ui                  - Base UI components (shadcn/ui)
  /[feature]           - Feature-specific components
/hooks                  - Custom React hooks
  /shared              - Shared hooks
  /[feature]           - Feature-specific hooks
/lib                    - Utilities and helper functions
/contexts               - React Context providers
/types                  - TypeScript types and interfaces
/prisma                 - Database schema and migrations
/config                 - Configuration files
```

## Code and Style

### TypeScript

- **Always use TypeScript** for all files (.ts, .tsx)
- **Strict mode enabled**: follow strict typing
- **Avoid `any`**: use specific types or `unknown` when necessary
- **Use path alias**: `@/` for imports from project root
- **Type props**: always explicitly specify component prop types
- **Interfaces vs Types**: prefer `interface` for object types of components and APIs, use `type` for union types and complex compositions
- **Code formatting**: always add empty lines before and after conditional statements (if) and all loop statements (for, while, do-while)
- **Variable naming**: use descriptive, meaningful variable names - never use single-letter names (e.g., `word` instead of `w`, `index` instead of `i`, `translation` instead of `t`)

### React Components

- **Functional components**: use only functional components with hooks
- **Naming**: PascalCase for components (e.g., `TrainingList.tsx`)
- **'use client' directive**: always add `'use client'` at the beginning of the file for client components (components with hooks, event handlers, browser APIs)
- **Export**: use named export for components (`export function ComponentName()`)
- **Props destructuring**: destructure props in function parameters
- **Event handlers**: always use named callbacks instead of anonymous arrow functions in JSX onClick handlers and similar event handlers - create descriptive function names that clearly indicate their purpose
- **Component structure**: create a dedicated folder with the component name (PascalCase) and export the component directly from a file with the same name, without using index.ts files or re-exports
- **Component organization**: break down complex JSX into logical atomic components within the main component's folder under a `components/` subdirectory
- **Extract helpers**: extract custom hooks and helper functions into respective `hooks/` and `helpers/` subdirectories within the component folder
- **Shared types**: extract shared types into a centralized `typing.ts` file within the component folder

Example:

```tsx
'use client';

import { useState } from 'react';

interface MyComponentProps {
    title: string;
    onSubmit: (value: string) => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
    const [value, setValue] = useState('');

    return (
        <div>
            <h1>{title}</h1>
            {/* ... */}
        </div>
    );
}
```

### Custom Hooks

- **Naming**: start the name with `use` (e.g., `useTrainingModes`)
- **File naming**: name hook files in camelCase matching the hook name (e.g., `useTranslationOptions.ts` for hook `useTranslationOptions`, NOT `use-translation-options.ts`)
- **Location**:
    - Shared reusable hooks → `hooks/shared/`
    - Feature-specific hooks (used in multiple places) → `hooks/[feature]/`
    - Hooks tightly coupled to a specific component → `components/[feature]/hooks/` (in the same directory as the component)
- **Logic**: extract complex logic from components into custom hooks
- **Return object**: prefer returning an object with named properties instead of an array

Example:

```tsx
export function useTrainingModes() {
    const [isLoading, setIsLoading] = useState(false);
    const [modes, setModes] = useState([]);

    return {
        modes,
        isLoading,
        startMode,
        // ...
    };
}
```

### Styling (Tailwind CSS)

- **Use Tailwind utilities**: prefer Tailwind classes instead of custom CSS
- **Responsive design**: use `sm:`, `md:`, `lg:` prefixes for responsiveness
- **Class grouping**: group similar classes logically (layout → spacing → typography → colors)
- **Don't use inline styles**: avoid the `style` attribute, use Tailwind classes
- **clsx/tailwind-merge**: use the `cn()` utility from `@/lib/utils` for conditional classes

Example:

```tsx
import { cn } from '@/lib/utils';

<div className={cn(
    "flex items-center justify-center",
    "py-12 px-4",
    "text-gray-900",
    isActive && "bg-purple-100"
)}>
```

### API Routes

- **Location**: create in `app/api/[endpoint]/route.ts`
- **Named exports**: use named exports for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- **NextResponse**: use `NextResponse.json()` for responses
- **Error handling**: always wrap code in try-catch
- **Status codes**: use proper HTTP status codes (200, 201, 400, 404, 500)
- **Authentication**: check session via `getServerSession(authOptions)` for protected routes

Example:

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 },
            );
        }

        // logic

        return NextResponse.json({ data });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
```

### Working with Database (Prisma)

- **Prisma Client**: import from `@/lib/prisma` or create singleton instance
- **Typing**: use generated Prisma types
- **Transactions**: use `prisma.$transaction()` for related operations
- **Include/Select**: explicitly specify needed relations via `include` or `select`
- **Where conditions**: use typed where conditions

Example:

```typescript
import { prisma } from '@/lib/prisma';

const words = await prisma.word.findMany({
    where: {
        userId: session.user.id,
        statusId: { in: [1, 2, 3] },
    },
    include: {
        baseWord: {
            include: {
                translations: true,
            },
        },
    },
});
```

### State Management

- **React Query**: use for server state (API requests)
- **React Context**: use for global UI state (themes, modal windows)
- **Local state**: use `useState` for local component state
- **Query keys**: create constants for query keys

Example:

```typescript
// In hooks/shared/useWords.ts
export const WORDS_QUERY_KEY = ['words'];

export function useWords() {
    return useQuery({
        queryKey: WORDS_QUERY_KEY,
        queryFn: fetchWords,
    });
}
```

### Form Handling

- **Controlled components**: use controlled inputs with `useState`
- **Validation**: use Zod for data validation
- **Event handlers**: type event handlers correctly
- **Disabled state**: disable forms during submission

Example:

```tsx
interface FormData {
    word: string;
}

export function MyForm() {
    const [formData, setFormData] = useState<FormData>({ word: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // submission logic
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                name="word"
                value={formData.word}
                onChange={handleChange}
                disabled={isSubmitting}
            />
        </form>
    );
}
```

### UI Components (shadcn/ui)

- **Location**: base components are in `components/ui/`
- **Don't modify directly**: don't change base UI components, wrap them if customization is needed
- **Radix UI**: all components are built on Radix UI primitives
- **Accessibility**: components already have proper accessibility (ARIA attributes)

### Icons

- **Lucide React**: use icons from `lucide-react`
- **Naming**: import with meaningful names
- **Props**: pass `className` for size and color styling

Example:

```tsx
import { Loader2, Check, X } from 'lucide-react';

<Loader2 className="w-8 h-8 animate-spin text-purple-600" />;
```

## Comments and Documentation

- **Comment language**: use English for all code comments and documentation unless specified otherwise
- **Minimalism**: don't add obvious comments
- **Document complex logic**: add comments for non-obvious decisions
- **TODO comments**: use format `// TODO: description` for future improvements

## Naming

- **Components**: PascalCase (`TrainingList`, `WordCard`)
- **Functions and variables**: camelCase (`startMode`, `isLoading`)
- **Constants**: UPPER_SNAKE_CASE for global constants (`WORDS_QUERY_KEY`)
- **Component files**: PascalCase with `.tsx` extension (`TrainingList.tsx`)
- **Utility files**: camelCase with `.ts` extension (`formatDate.ts`)
- **Types and interfaces**: PascalCase (`UserProfile`, `TrainingMode`)
- **Props interfaces**: add `Props` suffix (`TrainingListProps`)

## Error Handling

- **Try-catch**: always wrap asynchronous code in try-catch
- **Error boundaries**: use Error Boundaries for critical UI parts
- **Toast notifications**: use `sonner` to show errors to users
- **Console.error**: log errors to console for debugging
- **Graceful degradation**: show fallback UI on errors

Example:

```tsx
import { toast } from 'sonner';

try {
    await saveWord(data);
    toast.success('Word saved');
} catch (error) {
    console.error('Error saving word:', error);
    toast.error('Error saving');
}
```

## Testing

- **Status**: Jest is configured in the project, but active test coverage is not a current priority
- **When needed**: use `.test.ts` or `.test.tsx` suffixes for test files
- **Commands**: `npm test`, `npm run test:watch`, `npm run test:coverage`

## Git and CI/CD

- **Husky**: pre-commit hooks are configured for linting and formatting
- **Lint-staged**: automatic ESLint and Prettier for staged files
- **Commit messages**: ALWAYS write git commit messages in English
- **Commit timing**: NEVER make git commits on your own initiative - only commit when explicitly instructed by the user
- **Before commit**: make sure `npm run verify` passes successfully

## Development Commands

```bash
npm run dev              # Start dev server (http://localhost:8000)
npm run build            # Production build
npm run type-check       # TypeScript check
npm run lint             # ESLint
npm run format           # Prettier formatting
npm run format:check     # Check formatting
npm run verify           # Type-check + Lint + Format check
npm test                 # Run tests
npm run prisma:studio    # Prisma Studio (GUI for DB)
npm run prisma:migrate   # Apply migrations
```

## Database Operations Safety

**CRITICAL: ALWAYS create a database backup BEFORE performing any dangerous database operations.**

### Dangerous Operations

Dangerous database operations that REQUIRE backup include:

- Database resets or drops (DROP DATABASE, DROP TABLE, TRUNCATE)
- Mass deletions (DELETE without WHERE, or deleting large amounts of data)
- Schema changes that could cause data loss (ALTER TABLE DROP COLUMN, etc.)
- Migration operations that modify or delete existing data
- Any operation that could result in irreversible data loss

### Backup Workflow

1. Run backup: `./scripts/backup-db.sh` or `npm run db:backup`
2. Verify backup succeeded (check output for ✅)
3. Save backup file path for potential rollback
4. Proceed with the dangerous operation
5. Inform user of backup location

**Important rules:**

- If the backup fails, DO NOT proceed with the dangerous operation
- ALWAYS ask for user permission before running database reset operations
- Keep the backup file path visible in case rollback is needed
- After successful backup, inform the user that backup is complete before proceeding

### Database Migrations

**ALWAYS create a backup BEFORE running any database migrations.**

Migration commands that REQUIRE backup:

- `npm run prisma:migrate` or `prisma migrate dev`
- `prisma migrate deploy`
- `prisma db push`
- `npm run prisma:seed` (when seeding production data)
- Any command that modifies database schema or data

**Safe migration workflow:**

```bash
# 1. Create backup first
npm run db:backup

# 2. Wait for confirmation, then run migration
npm run prisma:migrate

# OR use the safe migration script that does both
npm run db:migrate:safe
```

For automated backups schedule, see: `scripts/backup-db/QUICK_START.md`

## Docker and Containerization

- **PostgreSQL**: runs via Docker Compose on port 5433 (external)
- **Commands**:
    ```bash
    docker-compose up -d       # Start DB in background
    docker-compose down        # Stop DB
    npm run db:backup          # Database backup
    npm run db:migrate:safe    # Safe migration with auto-backup
    ```
- **Connection**: DB is available on `localhost:5433`, inside container - `5432`
- **Volumes**: data is stored in Docker volume `postgres_data` for persistence

## Security

- **Environment variables**: store secrets in `.env` (don't commit to Git)
- **NextAuth**: use NextAuth for authentication
- **API protection**: always check session in protected API routes
- **SQL Injection**: Prisma protects from SQL injection automatically
- **XSS**: React protects from XSS automatically, but be careful with `dangerouslySetInnerHTML`

## Performance

- **Server Components**: use Server Components by default (Next.js 14)
- **'use client'**: add only when client-side interactivity is truly needed
- **Dynamic imports**: use `next/dynamic` for heavy components
- **Image optimization**: use `next/image` for images
- **React Query**: use for caching API requests

## Accessibility (a11y)

- **shadcn/ui components**: already contain proper ARIA markup and keyboard navigation
- **Custom components**: use semantic HTML tags and ensure keyboard accessibility
- **Alt texts**: add alt texts for images

## Additional

- **Consistency**: follow existing patterns in the codebase
- **Code review**: review changes before committing
- **Documentation**: update README and other documentation when necessary

## Common Patterns

### Dialogs and Modal Windows

**ALWAYS use the `useHashDialog` hook** from `@/hooks/shared` for ALL dialogs and modals. This enables closing dialogs with the browser back button.

Use components from `components/ui/dialog.tsx` (Radix UI Dialog):

```tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useHashDialog } from '@/hooks/shared/useHashDialog';

export function MyDialog() {
    const { open, setOpen } = useHashDialog('unique-dialog-id');

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Title</DialogTitle>
                </DialogHeader>
                {/* content */}
                <DialogFooter className="flex-row justify-end gap-2">
                    {/* buttons in a row for mobile view */}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
```

**Dialog best practices:**

- Use unique string identifier for each dialog (e.g., 'add-word-dialog', 'confirm-delete', 'settings-modal')
- Place action buttons in DialogFooter with `flex-row justify-end gap-2` for horizontal layout on mobile devices
- Avoid stacking buttons in a column on mobile when possible

### Loading States

```tsx
import { Loader2 } from 'lucide-react';

if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
    );
}
```

### Conditional Rendering

```tsx
{
    items.length === 0 ? <EmptyState /> : <ItemsList items={items} />;
}
```

## Architectural Decisions

- **Feature-based structure**: group files by features, not by types
- **Colocation**: keep related files together
- **Single Responsibility**: one component = one responsibility
- **Composition over Inheritance**: use component composition
- **Smart vs Dumb**: separate logic (smart) and presentation (dumb) components via custom hooks
