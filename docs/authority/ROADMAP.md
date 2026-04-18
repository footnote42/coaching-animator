# Coaching Animator Roadmap

**Last Updated**: 2026-04-18  
**Status**: Active authority document  
**Previous roadmap**: `docs/archive/ROADMAP-2026-02-21.md`

---

## Governing Documents

| Document | Role | Location |
|----------|------|----------|
| **PRD-v2.0** | Product requirements, feature specifications | [docs/authority/PRD-v2.0.md](PRD-v2.0.md) |
| **Constitution v3.4.1** | Governance, tiered model, absolute prohibitions | [.specify/memory/constitution.md](../../.specify/memory/constitution.md) |
| **Changelog** | Record of delivered changes | [docs/CHANGELOG.md](../CHANGELOG.md) |
| **Handoff log** | Session-by-session progress record | [docs/plans/HANDOFF.md](../plans/HANDOFF.md) |

---

## Completed Work

### v1.0 — Personal Animation Tool (Jan–Feb 2026)

Canvas-based animation tool for rugby coaching drills with cloud storage, galleries, and moderation.

- Specs 001-005 complete (`archive/specs/`)
- PRD v1.0: 89% coverage (76/85 requirements)
- Deliverables: drag-drop editor, keyframe animation, video export, Supabase auth, public gallery, upvoting, link sharing, admin moderation

### v2.0 — Rugby Coaching Platform (Feb 2026)

Pivoted from personal tool to rugby coaching platform. Cloud-first, mobile-first, rugby-only architecture.

- **Phase 0**: Staging Supabase project, mobile share route `/share/[id]`
- **Phase 1**: Feature-based architecture, collections, version control, template library
- **Phase 2**: Progressions UI, remix genealogy DB schema, mobile share viewer redesign
- **SpecKit bootstrap**: Brownfield adoption of spec-driven development workflow (Apr 2026)

---

## Current Status: Pre-Launch

**Infrastructure**: Supabase restored (Apr 2026 after inactivity pause). Vercel active.  
**User base**: Pre-launch — no external users yet.  
**Primary usage pattern**: Desktop edit / mobile view. Coaches build sessions at a desk; show players animations on their phone at the pitch.  
**Critical blocker**: Mobile replay scaling — ShareViewer forces pinch-zoom, breaking the core delivery mechanism.

---

## Active Roadmap

### Phase 1 — Fix the Core Loop (current priority)

**Goal**: A coach can build a drill on desktop, share a link, and a player sees it clearly on their phone without zooming.

| Task | Description | Key files |
|------|-------------|-----------|
| T1 | Fix mobile replay scaling in ShareViewer | `src/features/animation/components/ShareViewer.tsx`, `useShareCanvasSize` hook |
| T2 | Smoke-test across device sizes | Playwright device emulation — phone portrait + tablet |

**Constraint**: `position:fixed inset:0` on ShareViewer must be preserved. Do not change to `h-screen`/`h-full`.

---

### Phase 2 — Launch Credibility

**Goal**: First impression makes a grassroots rugby coach think "this was made for me."

| Task | Description |
|------|-------------|
| T3 | Landing page overhaul — tactical/hand-drawn aesthetic; references whiteboard coaching tradition; not corporate |
| T4 | Basic inline user guide — coaches figure it out in <5 minutes without hand-holding |

**Design direction for T3**: Tactical/hand-drawn aesthetic. Lean into the whiteboard/marker coaching tradition. One clear CTA. No heavy animations, no trackers (constitutional constraint).

---

### Phase 3 — Quality Safety Net

**Goal**: Automated UAT that catches core-loop regressions and can be handed to any agent.

| Task | Description |
|------|-------------|
| T5 | Core-loop E2E spec — create → save → share → verify mobile replay |
| T6 | CI gate on canvas/ShareViewer PRs — prevents silent mobile regressions |

---

### Phase 4 — Growth (post-v1, after real coach feedback)

Revisit priorities once the app is in coaches' hands. Tentative order:

1. **AI animation spike** — Natural language → animation JSON. First test: warm-up grid (validates schema before complex plays). Time-box to 1 session to assess feasibility.
2. **Simplicity audit** — Walk through with "5 minutes to figure it out" bar. Fix top 3 friction points.
3. **Mobile editor** — Only if real coaches confirm desktop-first doesn't fit their workflow.
4. **User guide hosting** — Evolve from inline help to a `/help` page.
5. **Club accounts / team management** — Tier 4 from constitution; relevant once individual user base exists.

---

## Development Strategy

**Workflow**: SpecKit spec-driven development. Every feature: `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → implement → `/speckit.verify`.

**Multi-agent**: Claude for architecture, specs, and complex debugging. Copilot/Antigravity for mechanical task execution from `tasks.md`. Any agent can resume cold from spec + plan + tasks.

**Session discipline**: End every session with `/handoff` → append entry to `docs/plans/HANDOFF.md`.

**Pre-push gate**: `npm run lint && npx tsc --noEmit` must pass before any PR.

---

## v1 Launch Definition

A successful v1 launch requires:
1. Core loop working — desktop edit, share link, mobile replay renders correctly without zooming
2. Landing page credible — a coach who doesn't know the project would trust it
3. Basic user guide — <5 minutes to understand the app without help

---

## Constitutional Constraints

All phases must comply with [Constitution v3.4.1](.specify/memory/constitution.md):

| Tier | Access Level |
|------|-------------|
| 0 (Guest) | 10-frame local editing, JSON export only |
| 1 (Authenticated) | Cloud storage, personal gallery, 50 animations max |
| 2 (Public/Link-Shared) | Link sharing, public gallery, upvoting |
| 3 (Admin) | Moderation, user management |
| 4 (Organizational) | Club accounts, team management — Phase 4+ |

**Absolute prohibitions**: No telemetry, no third-party analytics, no third-party auth providers, no advertising, no paywalls for core features.
