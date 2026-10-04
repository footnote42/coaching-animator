# Coaching Animator

A Next.js web editor for rugby coaches to draw, animate and share their Practices on a Konva canvas. Coaches create tactical diagrams with Progressions that stretch players further, then share with their team via a link. Live at https://coaching-animator.waynetellis.com

## Features

- **Practice Editor** (`/practice`): Draw markers on a grid, set movement along waypoints at a Pace, trigger passes on arrival, and define Progressions that layer changes (Space, Time, Equipment, People) over the previous Step.
- **Share View** (`/p/[id]`): Full-screen, link-shared Practice that plays each Step with optional Commentary overlay. No login required.
- **Gallery** (`/gallery`): Browse and discover Practices coaches have published. Search by title, filter by Tag, and preview a card before opening it.
- **My Practices** (`/my-practices`): Coaches open, edit and share their own Practices and choose who sees each one (private, anyone with the link, or the Gallery).
- **Tags and Source**: Coaches pick up to 5 Tags from a fixed list of 28; optional Source link credits a video or page the Practice is based on.
- **AI Route**: An MCP endpoint (`/api/mcp`) lets agents create and edit Practice Scripts programmatically. Coaches generate a personal token from their Profile (`/profile`) and use the guide at `/practice-script/v1/guide` to learn the Practice Script format. The coaching-animator skill (`skill/coaching-animator/`) shows usage.

## Stack

- Next.js 14 (App Router)
- React 18, TypeScript
- Konva (HTML5 canvas)
- Tailwind CSS v4
- Supabase (auth, database, storage)
- Vercel (hosting)

## Local Setup

```bash
npm ci
cp .env.local.example .env.local
# Edit .env.local with your Supabase project URL, keys and site URL
npm run dev
```

The app opens at `http://localhost:3000`. Guest mode works without authentication; saving requires signing in.

## Scripts

- `npm run lint` — ESLint
- `npx tsc --noEmit` — TypeScript type check (run before push)
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm test` — Unit tests (Vitest)
- `npm run e2e` — End-to-end tests (Playwright)

## Testing

See `docs/testing/` for strategy and guides. Playwright tests cover the guest-to-coach-to-viewer flow.

## Deployment

Hosted on Vercel. On every push to `main`, CI runs migrations against production via `supabase db push`. Be careful: always run `npm run lint` and `npx tsc --noEmit` before pushing.

## Documentation

- `CONTEXT.md` — Domain vocabulary (Practice, Step, Progression, Pace, etc.)
- `docs/adr/` — Architecture decisions (agents may author Practices, the Practice Script with chained Progressions, 18+ accounts, AI stays outside the app)
- `docs/constraints.md` — Binding rules (no telemetry, no ads, privacy first)
- `docs/testing/` — Testing approach and guides
