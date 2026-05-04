# Coaching Animator Roadmap

**Version**: 3.4
**Last Updated**: 2026-05-04
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
| 2l | Cosmetic Polish | ✅ | 015-cosmetic-polish | 2026-05-02 | RFU badge, landing copy, MyPlaybook parity, profile redesign, share back-link |
| 3b | Security Hardening (MVP) | ✅ | 016-security-hardening | 2026-05-03 | Rate limiting on 8 endpoints, diag info-leak prevention; 113/113 tests |
| 3f | Audit Remediation | ✅ | 017-audit-remediation | 2026-05-03 | Zero `rounded-*` in editor surfaces, `font-heading` on auth pages, modal scrim; re-score 18+/20 |
| 2c+ | Share & Playback Workflow (ext.) | ✅ | 018-share-playback-workflow | 2026-05-04 | Inline progression badges, coaching notes overlay, 8 Phase 2 issue closures |
| 2m | Save & Metadata Unification | ✅ | 019-save-metadata-unification | 2026-05-04 | Tags, YouTube URL, unified edit modal, sidebar cleanup |

**Pulled-forward features delivered:** FEATURE-001 (Endorsement system) → 009-gallery-playbook. Originally scheduled for Phase 4. See *Hygiene Rules* below.

---

## In Flight

Nothing in flight. All Phase 2 and Phase 3 launch-required work is complete.

---

## Current Status: Pre-Launch

- **Infrastructure**: Supabase healthy. Vercel active.
- **User base**: Pre-launch — no external users yet.
- **Primary usage pattern**: Desktop edit / mobile view. Coaches build sessions at a desk; players receive a share link on their phone at the pitch.
- **Doc/code parity**: Restored 2026-04-28 (this version). v3.0 had 4 stale "open" sub-areas already shipped under specs 006/007/008/009.

---

## v1 Launch Definition

A successful v1 launch requires all of the following. **9/9 met as of 2026-05-04.**

1. ✅ **Core loop working** — desktop edit, save, share link, mobile replay renders correctly
2. ✅ **Landing page credible** — tactical rebrand shipped 2026-04-20
3. ✅ **Editor & canvas credible** — pitch markings accurate, entity UX coherent (Phase 2a)
4. ✅ **Share workflow plumbing** — share button works, `POST /api/share` writes `saved_animations` (Phase 2c shipped)
5. ✅ **Legal compliant** — cookies assessed, ToS and Privacy Policy reviewed (Phase 2d shipped)
6. ✅ **Workflow clarity** — coach can complete edit → save → share → player view → return to gallery without external help (Phase 2h shipped 2026-04-30)
7. ✅ **Editor workspace layout** — collapsible sidebar, Focus Mode, and mobile-first drawer (Phase 2i shipped 2026-05-01)
8. ✅ **Basic user guide** — coaches self-onboard in <5 minutes (Phase 2k shipped 2026-05-01)
9. ✅ **Security hardened** — rate limiting, injection prevention, auth tokens (Phase 3b)

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
| 6 | **2l — Cosmetic Polish** | ✅ | 015-cosmetic-polish | RFU endorsement icon, landing footer cleanup, MyPlaybook parity, private access fix, avatars | LANDING-001..004, UX-017, GALLERY-001, GALLERY-003, MYPLAYBOOK-001/002, MYPLAYBOOK-004, PROFILE-001 |

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
| **3b — Security Hardening** | ✅ Shipped 2026-05-03 | Rate limiting on 8 endpoints, diag info-leak prevention. Full RLS audit deferred until 10 external users. | SEC-001, SEC-002, SEC-003 |
| **3c — E2E Core Loop** | Open | Editor save → POST /api/share → /my-gallery card visible → /share/{id} loads → mobile replay. CI gate. | — |
| **3d — Search & Layering** | Open | Gallery search by tags, animation entity z-order control | FEAT-006, FEAT-007 |
| **3e — Performance Baseline** | Open | Lighthouse audit across all routes; pre-beta targets | PERF-001 |
| **3f — Audit Remediation** | ✅ Shipped 2026-05-03 | Closed all P1 violations; re-score 18+/20 achieved. | (audit-2026-04-24) |

> **Disposition — 3b Security Hardening (2026-05-03):** Proceed (descoped) — MVP security pass only: rate limiting + injection hardening. Full RLS audit deferred until first 10 external users are onboarded.

> **Disposition — 3c E2E Core Loop (2026-05-03):** Defer — manual verification is sufficient pre-launch. Add to CI after first 10 external users validate the product direction.

> **Disposition — 3d Search & Layering (2026-05-03):** Defer to Phase 4 — search is a growth feature, not a launch requirement. Trigger: when any user has >20 animations saved.

> **Disposition — 3e Performance Baseline (2026-05-03):** Defer — no known performance baseline or complaint. Trigger: Lighthouse score below 70 on mobile, or user-reported load complaint. Run Lighthouse baseline before shelving.

> **Disposition — 3f Audit Remediation (2026-05-03):** Proceed — cosmetic P1 closures are low-cost and directly support launch credibility. Scope is already tightly bounded (zero `rounded-*`/`bg-white` in editor, `font-heading` on auth pages, modal focus rings). No analytics or user tracking involved; safe under constitution s.V.4.1.

**Sequence**: 3a (debt) → 3b (security) → 3c (e2e) → 3f (audit polish) → 3e (perf baseline). 3d can run in parallel.

---

### Phase 4 — Growth (post-v1 launch)

> **Disposition (2026-05-03):** Trigger-gated — start Phase 4 when: (1) 10 external users active, AND (2) at least one user has returned to the app on 3 separate days. Without both signals, growth features are speculative.

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

---

### Phase 5+ — Coaching Education Platform (Aspiration)

> **Disposition (2026-05-03):** Parked — assess as potential pivot, not extension. Before any Phase 5 work: write a one-paragraph user story describing a coach using both the animator AND the education content in the same session. If you can't write it, the features aren't coherently connected.

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
