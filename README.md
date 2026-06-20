# ProofBell

Social proof and live-activity widget for indie SaaS founders. Connect Stripe to show recent signups, subscribes, and live user counts. Pay once, embed forever.

Scaffolded from `portfolio-os/templates/micro-saas`. Rules live in `CLAUDE.md`.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in Supabase / Stripe / Resend keys
3. `npm run dev`

## Stack

Next.js (App Router) / TypeScript / Tailwind v4 / shadcn-ui / Supabase / Stripe Checkout / Resend

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build (keep bundle < 200KB gzipped)
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — E2E (Playwright, run before every deploy)
