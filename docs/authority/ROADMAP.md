# Coaching Animator Roadmap

**Version**: 3.2
**Last Updated**: 2026-05-01
**Status**: Active authority document
**Previous roadmap**: `docs/archive/ROADMAP-2026-04-25.md` (v3.0)

---

## Governing Documents

| Document | Role | Location |
|----------|------|----------|
| **PRD-v2.0** | Product requirements, feature specifications | [docs/authority/PRD-v2.0.md](PRD-v2.0.md) |
| **Constitution v3.4.2** | Governance, tiered model, absolute prohibitions | [.specify/memory/constitution.md](../../.specify/memory/constitution.md) |
| **Issues Tracker** | Categorized issues and features by phase | [docs/issues/ISSUES.md](../issues/ISSUES.md) |
| **Changelog** | Record of delivered changes | [docs/CHANGELOG.md](../CHANGELOG.md) |
| **Handoff log** | Session-by-session progress record | [docs/plans/HANDOFF.md](../plans/HANDOFF.md) |

---

## Pivot Context

v1.0 personal animation tool → v2.0 rugby coaching platform. **Cloud-first, mobile-first, rugby-only** architecture.

---

## Completed Work

### v1.0 — Personal Animation Tool (Jan–Feb 2026)

Canvas-based animation tool for rugby coaching drills with cloud storage, galleries, and moderation.

- Specs 001–005 complete (`archive/specs/`)
- PRD v1.0: 89% coverage (76/85 requirements)
- Deliverables: drag-drop editor, keyframe animation, Supabase auth, public gallery, upvoting, link sharing, admin moderation

### v2.0 — Rugby Coaching Platform (Feb 2026–present)

| Phase | Title | Status | Spec | Date | Notes |
|-------|-------|--------|------|------|-------|
| 0 | Infrastructure rescue | ✅ | — | — | Supabase restored, Vercel active |
| 1 | Mobile replay scaling fix | ✅ | 001-fix-share-scaling | 2026-04-18 | |
| 2 — T3 | Landing rebrand | ✅ | 002-landing-rebrand | 2026-04-20 | Oswald headings, cream palette, WCAG AA |
| 3a | Technical debt refactor | ✅ | 004-technical-debt-refactor | 2026-04-25 | Editor.tsx 852→504 LOC; 4 domain hooks; 25 store selectors; 73/73 tests |
| 2a | Editor & Canvas credibility | ✅ | 005-editor-canvas | 2026-04-25 | Pitch SVG, responsive canvas, 6-colour palette, tackle shield/bag, pitch legend |
| 2d | Legal & Compliance MVP | ✅ | 003-legal-compliance | 2026-04-25 | Cookie audit, ToS, Privacy Policy |
| 2c | Share workflow plumbing | ✅ | 006-share-workflow | 2026-04-26 | Share modal, `POST /api/share`, progression nav in share view |
| 2b | Playback controls | ✅ | 007-playback-controls | 2026-04-26 | EditorFloatingRemote draggable pill |
| 2e | Landing refinements | ✅ | 008-landing-refinements | 2026-04-26 | Looping SVG background |
| 2f | Gallery playbook | ✅ | 009-gallery-playbook | 2026-04-27 | Mini-pitch previews, progression strip, My Playbook search/filter |
| 2g | Auth & Profile | ✅ | 010-auth-profile | 2026-04-28 | Coach identity card, profile redesign |
| 2h | Workflow Clarity | ✅ | 011-workflow-clarity | 2026-04-30 | /share back-link, my-gallery play nav, PRD §5.13 |
| 2i | Editor Workspace Remodel | ✅ | 012-editor-workspace-remodel | 2026-05-01 | Collapsible sidebar, Focus Mode, Mobile Drawer, expanded remote |
| 2j | Snap-to-Grid | ✅ | 013-snap-to-grid | 2026-05-01 | Toggle, intersection markers, snap on drag-end |
| 2k | User Guide | ✅ | 014-user-guide | 2026-05-01 | Onboarding, help pages, APES framework |

**Pulled-forward features delivered:** FEATURE-001 (Endorsement system) → 009-gallery-playbook. Originally scheduled for Phase 4. See *Hygiene Rules* below.

---

## In Flight

| Phase | Title | Spec | Branch | Notes |
|-------|-------|------|--------|-------|
| 2l | Cosmetic Polish | TBA | `main` | RFU icon, landing copy, MyPlaybook layout |

---

## Current Status: Pre-Launch

- **Infrastructure**: Supabase healthy. Vercel active.
- **User base**: Pre-launch — no external users yet.
- **Primary usage pattern**: Desktop edit / mobile view. Coaches build sessions at a desk; players receive a share link on their phone at the pitch.
- **Doc/code parity**: Restored 2026-04-28 (this version). v3.0 had 4 stale "open" sub-areas already shipped under specs 006/007/008/009.

---

## v1 Launch Definition

A successful v1 launch requires all of the following. **5 of 7 met as of 2026-04-28.**

1. ✅ **Core loop working** — desktop edit, save, share link, mobile replay renders correctly
2. ✅ **Landing page credible** — tactical rebrand shipped 2026-04-20
3. ✅ **Editor & canvas credible** — pitch markings accurate, entity UX coherent (Phase 2a)
4. ✅ **Share workflow plumbing** — share button works, `POST /api/share` writes `saved_animations` (Phase 2c shipped)
5. ✅ **Legal compliant** — cookies assessed, ToS and Privacy Policy reviewed (Phase 2d shipped)
6. ✅ **Workflow clarity** — coach can complete edit → save → share → player view → return to gallery without external help (Phase 2h shipped 2026-04-30)
7. ✅ **Editor workspace layout** — collapsible sidebar, Focus Mode, and mobile-first drawer (Phase 2i shipped 2026-05-01)
8. ✅ **Basic user guide** — coaches self-onboard in <5 minutes (Phase 2k shipped 2026-05-01)
9. ⏳ **Security hardened** — rate limiting, injection prevention, auth tokens (Phase 3b)

---

## Active Roadmap

### Phase 2 — Launch Credibility (current priority)

**Goal**: Every part of the product a coach will touch before committing to the tool is credible, correct, and legally compliant. Work is broken into execution sub-areas; each maps to a speckit spec.

**Suggested execution order** (within Phase 2, post-2g):

| Order | Sub-area | Status | Spec | Scope summary | Key issues |
|-------|----------|--------|------|---------------|------------|
| 1 | **2g — Auth & Profile** | ✅ | 010-auth-profile | Coach identity card, profile redesign | UX-005, PROFILE-001 |
| 2 | **2h — Workflow Clarity** | ✅ | 011-workflow-clarity | gallery↔/share/{id} navigation, breadcrumb, animation name on /share/{id} | UX-008, FLOW-001, FLOW-002, EDITOR-002, GALLERY-002 |
| 3 | **2i — Editor Workspace Remodel** | ✅ | 012-editor-workspace-remodel | Collapsible sidebar, Focus Mode, Mobile Drawer, Expanded Remote | EDITOR-013, PLAYBACK-001 |
| 4 | **2j — Snap-to-Grid** | ✅ | 013-snap-to-grid | Toggle in editor toolbar, grid intersection markers, snap on drag-end | FEAT-010 |
| 5 | **2k — User Guide** | ✅ | 014-user-guide | Inline onboarding, help page, coaching pedagogy (APES) | UX-016 |
| 6 | **2l — Cosmetic Polish** | Next | (TBA) | RFU endorsement icon, landing footer cleanup, MyPlaybook parity, private access fix, avatars | LANDING-001..004, UX-017, GALLERY-001, GALLERY-003, MYPLAYBOOK-001/002, MYPLAYBOOK-004, PROFILE-001 |

**Exit criteria**:
- 2h: a coach can complete edit → save → share → player views → back to gallery without external help.
- 2i: canvas reclaims ≥85% of viewport in Focus Mode on desktop; usable layout on mobile (no MobileWarning at <768).
- 2j: snap on/off, grid overlay on/off; unit + e2e green; replay & share unaffected.
- 2l: audit re-score ≥18/20 (see Phase 3f).

**Open issues**: See [docs/issues/ISSUES.md](../issues/ISSUES.md).

---

### Phase 3 — Stability, Security & Pre-Launch Hardening

**Goal**: Automated safety net catches regressions. Security review passed. Audit P1 violations closed. Pre-beta readiness confirmed.

| Sub-area | Status | Scope | Key issues |
|----------|--------|-------|------------|
| **3a — Technical Debt** | ✅ | Editor.tsx 852→504 LOC; 4 hooks; 25 store selectors. Shipped 2026-04-25. | — |
| **3b — Security Hardening** | Open | Rate limiting, SQL injection, XSS, CSRF, auth tokens, admin bulk delete | SEC-001, SEC-002, SEC-003, ADMIN-001 |
| **3c — E2E Core Loop** | Open | Editor save → POST /api/share → /my-gallery card visible → /share/{id} loads → mobile replay. CI gate. | — |
| **3d — Search & Layering** | Open | Gallery search by tags, animation entity z-order control | FEAT-006, FEAT-007 |
| **3e — Performance Baseline** | Open | Lighthouse audit across all routes; pre-beta targets | PERF-001 |
| **3f — Audit Remediation** *(new)* | Open | Close audit P1: zero `rounded-*` in editor surfaces, zero `bg-white` in editor surfaces, `font-heading` on auth pages, modal scrim & focus rings. Re-score target 18+/20. | (audit-2026-04-24) |

**Sequence**: 3a (debt) → 3b (security) → 3c (e2e) → 3f (audit polish) → 3e (perf baseline). 3d can run in parallel.

---

### Phase 4 — Growth (post-v1 launch)

**Goal**: Expand capabilities based on real coach usage and feedback. Do not build Phase 4 features before v1 launch.

**Tentative priorities** (revisit after coach feedback):

1. **Simplicity audit** — walk through with "5 minutes to figure it out" bar; fix top 3 friction points
2. **AI animation spike** — natural language → animation JSON; time-box to 1 session to assess feasibility
3. **Kit visualization library** — additional entities (tackle bags, shields, posts, etc.) (FEATURE-010)
4. **Export format decision** — drop / GIF / MP4 / server-side (FEAT-008)
5. ~~**Endorsed animations** — RFU endorsement badge (FEATURE-001)~~ — *shipped via 009-gallery-playbook 2026-04-27 (pulled forward)*
6. **Offline capability** — read-only offline with sync on reconnect (FEAT-009)
7. **Roadmap page** — public roadmap for credibility (FEATURE-002)
8. ~~**Snap to grid** (FEAT-010)~~ — *moved into Phase 2j*
9. **Welcome page for players** — lightweight landing after share link (FLOW-003)
10. **Spinning ball save indicator** — brand delight (FEAT-011)
11. **Club accounts / team management** — Tier 4 from constitution; post-user-base (Constitution §V.4)

---

### Phase 5+ — Coaching Education Platform (Aspiration)

**Goal**: Transform from animation tool to integrated coaching education system. Embed pedagogical frameworks to elevate coaches' practice.

**Exploration focus**:
- Validate coaching frameworks (APES, Progression/Regression, Tell-Sell-Ask-Delegate) with grassroots coaches
- Prototype drill metadata schema with pedagogical tags
- Design session design tool with coaching balance visualiser
- Investigate coaching guides and contextualised learning

**Research & validation required**: See `docs/coaching-frameworks/COACHING-PEDAGOGY.md` for detailed exploration roadmap.

**Open issues**: ASPIRATION-001, FEATURE-003, FEATURE-004, FEATURE-005

---

## Hygiene Rules (introduced v3.1)

To prevent the doc/code drift that prompted this revision:

1. **Pulled-forward features must be marked in BOTH places.** Any feature delivered earlier than its scheduled phase is annotated *"pulled forward from Phase N / ID"* in (a) the destination spec's `tasks.md` and (b) this ROADMAP. The source phase's listing is struck through with a forward reference.
2. **ISSUES.md status flips to `[x]` only when shipped + tested.** No `[~]` orphans for delivered work. Closure note must reference the shipping spec (e.g. *"Shipped via 009-gallery-playbook"*).
3. **ROADMAP version archived on each minor bump.** Each `vX.Y → vX.(Y+1)` pushes the prior version into `docs/archive/ROADMAP-YYYY-MM-DD.md` before any in-place rewrite.
4. **`In Flight` row maintained.** Exactly one phase sits in *In Flight* at a time, identifying the active branch. When merged it migrates to the *Completed Work* table with the merge date.

---

## Development Strategy

**Workflow**: SpecKit spec-driven development. Every feature: `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → implement → `/speckit.verify`.

**Phase 2 sub-areas**: Each sub-area should become its own speckit spec before implementation begins.

**Multi-agent**: Claude for architecture, specs, and complex debugging. Copilot/Antigravity for mechanical task execution from `tasks.md`. Any agent can resume cold from spec + plan + tasks.

**Session discipline**: End every session with `/handoff` → append entry to `docs/plans/HANDOFF.md`.

**Pre-push gate**: `npm run lint && npx tsc --noEmit` must pass before any PR.

---

## Constitutional Constraints

All phases must comply with [Constitution v3.4.2](.specify/memory/constitution.md):

| Tier | Access Level |
|------|-------------|
| 0 (Guest) | 10-frame local editing, JSON export only |
| 1 (Authenticated) | Cloud storage, personal gallery, 50 animations max |
| 2 (Public/Link-Shared) | Link sharing, public gallery, upvoting |
| 3 (Admin) | Moderation, user management |
| 4 (Organizational) | Club accounts, team management — Phase 4+ |

**Absolute prohibitions**: No telemetry, no third-party analytics, no advertising, no paywalls for core features. OAuth: Google/Apple/GitHub permitted; Facebook/Meta/Twitter prohibited.
