# UpdateBell — AI Development Rules

## Project

- **Product**: UpdateBell
- **Niche**: Changelog and what's-new notification widget for indie founders. Pay once, embed forever.
- **Status**: building

## Mandatory Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript — no Pages Router
- **Styling**: Tailwind CSS only — no CSS modules, no inline styles, no styled-components
- **Components**: shadcn/ui — add via `npx shadcn add <component>`, never write raw HTML for UI primitives
- **State**: Zustand for global state, React hooks for local state — no Redux, no Context for data
- **Backend**: Supabase (auth + database + storage) — no custom auth, no raw SQL outside of Supabase RLS policies
- **Payments**: Stripe Checkout + webhooks — always use Stripe-hosted checkout, never build custom card forms
- **Email**: Resend + React Email — no Nodemailer, no SMTP directly

## Code Rules

- No `any` types — use `unknown` and narrow properly
- All API route handlers must validate input at the boundary (use Zod)
- All Supabase queries must go through server components or server actions — never expose service key to client
- Error responses always return `{ error: string }` JSON, never throw unhandled exceptions

## Testing

- E2E tests: Playwright only — no Cypress
- Unit tests: Vitest — no Jest
- Run `npx playwright test` before every deploy
- Never mock Supabase in E2E tests — use a dedicated test project

## Git

- Branch naming: `feat/<name>`, `fix/<name>`, `chore/<name>`
- Commit message format: `type(scope): description` (e.g. `feat(auth): add magic link login`)
- Never commit `.env.local` or any file with secrets

## Performance

- All images must use `next/image` with explicit `width` and `height`
- No `useEffect` for data fetching — use server components or `use` with Suspense
- Keep bundle under 200KB gzipped — run `npm run build` and check output

## DO NOTs

- Do NOT add logging or console.log in production paths
- Do NOT write TODO comments — either fix it now or open a GitHub issue
- Do NOT add features beyond the current sprint scope
