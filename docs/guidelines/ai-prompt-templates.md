### AI Prompt Templates — Using the Core Guidelines

This file contains concise, token‑efficient prompt templates that reference the Core Guidelines.

How to include rules (pick one):

- Long task (first message): Paste the core from `docs/ai-guidelines-core.md` once, then say: "Rules: Core Guidelines apply."
- Short messages: Just add: "Rules: Core Guidelines apply." without pasting the core.

Optional short project profile (prepend for bigger tasks):

```
Project: Flash Cards (Next.js/React + TS, React Query, Zod, Prisma?).
Architecture: feature-based, colocated, hooks separate logic from UI.
UI: do NOT edit components/ui/ — wrap instead. Accessibility preserved.
Types: strict TS, no any, '@/` alias.
State: React Query (server), Context (global UI state).
Forms: controlled + Zod, disable on submit.
API: try/catch, proper statuses, session checks.
DB: backup before migrations: npm run db:backup.
Naming/structure: per Core Guidelines.
Goal: <1–2 lines>.
Code context: <minimal snippet/paths>.
Answer format: brief bullets, no big code quotes.
```

Token‑saving macros (append as needed):

- "Answer in 5–7 bullet points, no repetition, no large code quotes."
- "Analyze only the snippet below; do not open or quote whole files."
- "If more context is required, list exact files/lines you need."
- "Show only changed lines with minimal surrounding context."

---

#### 1) UI Component

```
Create <ComponentName> for <goal>.
Rules: Core Guidelines apply.
Constraints:
- PascalCase file, named export.
- Explicit prop types (no any). Local types in <ComponentName>/typing.ts.
- Do NOT modify components/ui/; use a wrapper if needed.
- Controlled inputs if form-like; named handlers (no inline anonymous arrows in JSX).
Input: <minimal snippet/interfaces>.
Output: final component code + minimal integration notes (paths only).
```

#### 2) Custom Hook

```
Build `use<HookName>` for <purpose>.
Rules: Core Guidelines apply.
Requirements:
- File name in camelCase; location: <shared/feature/component>.
- Return an object, strongly typed (no any).
Output: hook code + short usage example.
```

#### 3) API Route (Next.js Route Handler)

```
Implement API for <resource/operation>.
Rules: Core Guidelines apply.
Must have:
- Zod input validation; human-readable errors.
- try/catch with proper 2xx/4xx/5xx statuses.
- Session check for protected routes.
Output: handler + Zod schema.
```

#### 4) Form with Zod

```
Assemble a form for <model>.
Rules: Core Guidelines apply.
Details:
- Controlled inputs, Zod schema.
- Disable submit while pending; success/error toasts via sonner.
Output: form component + schema + submit handlers.
```

#### 5) Bug Fix (focused)

```
Bug: <summary>. Only analyze the snippet/test below.
Rules: Core Guidelines apply.
Output: brief cause + minimal patch (changed lines only).
```

#### 6) Behavior‑preserving Refactor

```
Goal: readability/remove duplication; preserve API/behavior.
Rules: Core Guidelines apply.
Output: smallest possible diff patch with brief reasoning.
```

#### 7) Safe DB Migration (Prisma)

```
Need to change schema: <description>.
Rules: Core Guidelines apply.
Plan first: backup (`npm run db:backup`) → verify success → proceed.
Then: migration commands, expected diffs, rollback plan.
Output: step-by-step plan (no execution), commands only.
```

#### 8) E2E Scenario (Playwright)

```
Write an E2E test for <flow>.
Rules: Core Guidelines apply.
Use page-objects, stable selectors, and proper waits.
Output: the test + PO only (no extra logs).
```

#### 9) Performance / Extra Renders

```
Analyze unnecessary re-renders in the snippet below.
Rules: Core Guidelines apply.
Output: prioritized fixes (memo/useMemo/useCallback, state colocation) + minimal patches.
```

#### 10) Focused Code Review

```
Review the fragment below.
Rules: Core Guidelines apply.
Format: 5–7 bullets: risks, type-safety, architecture, Core violations, highest priority first.
```

#### 11) README Section (short)

```
Prepare README section "<topic>" in project style (brief steps/commands), 200–300 words.
Rules: Core Guidelines apply.
Output: the section only.
```

---

Quick first-message template for a new AI session:

```
Below are the project Core Guidelines. Follow them. Ask if you need the full guide.
(Paste once from docs/ai-guidelines-core.md, or just say: Rules: Core Guidelines apply.)

Task: <goal in 1–2 sentences>.
Code context: <minimal snippet/paths>.
Answer format: 5–7 bullets, no large quotes of code.
```
