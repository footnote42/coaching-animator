# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: `specs/[###-feature-name]/spec.md`

## Summary

[Extract from feature spec: primary requirement + technical approach]

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 14 App Router (SSR + API Routes)  
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`  
**State**: Zustand stores in `src/core/stores/`  
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`  
**Styling**: Tailwind CSS + Radix UI primitives  
**Testing**: Vitest (unit) · Playwright (E2E)  
**Deploy**: Vercel (CI via GitHub Actions)  
**Performance Goals**: Canvas interactions <100ms; API responses <500ms p95  
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; entity colors via EntityColors service only

---

## Constitutional Compliance Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [ ] | |
| No telemetry or analytics | [ ] | |
| Entity colors via EntityColors service | [ ] | |
| Shared canvas — tested on all 3 routes | [ ] | Only if touching Canvas/ |
| New data: privacy impact assessed | [ ] | N/A if no schema changes |
| Supabase joins flattened before use | [ ] | Only if new queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 codebase research (/speckit.plan output)
├── data-model.md        # Phase 1 schema design (/speckit.plan output)
├── quickstart.md        # Phase 1 manual test guide (/speckit.plan output)
├── contracts/           # API contracts, Zod schemas (/speckit.plan output)
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

### Source Code

```text
src/
├── app/
│   ├── [route]/
│   │   └── page.tsx             # Route entry point (thin — delegates to feature component)
│   └── api/
│       └── [resource]/
│           └── route.ts         # API route handler
│
├── features/
│   └── [feature-name]/
│       ├── components/          # React components for this feature
│       │   └── [Component].tsx
│       ├── services/            # Pure business logic (no React)
│       │   └── [service].ts
│       └── index.ts             # Public exports
│
├── core/
│   ├── stores/                  # Zustand slices (e.g., projectStore.ts)
│   ├── hooks/                   # Shared custom hooks
│   ├── types/                   # Shared TypeScript types/interfaces
│   └── utils/                   # Pure utility functions
│
├── shared/
│   ├── components/              # Reusable cross-feature components
│   └── ui/                      # shadcn-style UI primitives
│
└── lib/
    ├── supabase/                # Supabase client factories (browser + server)
    ├── schemas/                 # Zod validation schemas
    ├── contexts/                # React contexts (UserContext, etc.)
    └── server/                  # Server-only utilities

tests/
├── unit/                        # Vitest unit tests (mirrors src/ structure)
│   ├── components/
│   └── services/
└── e2e/                         # Playwright E2E tests
    └── [feature].spec.ts
```

**Structure Decision**: [Document which directories this feature touches and why]

---

## Complexity Tracking

> **Fill ONLY if Constitutional Compliance Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., direct hex color] | [reason] | [why EntityColors insufficient] |
