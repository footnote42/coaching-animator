# Coaching Animator Roadmap

**Last Updated**: 2026-04-19  
**Status**: Active authority document  
**Previous roadmap**: `docs/archive/ROADMAP-2026-02-21.md`

---

## Governing Documents

| Document | Role | Location |
|----------|------|----------|
| **PRD-v2.0** | Product requirements, feature specifications | [docs/authority/PRD-v2.0.md](PRD-v2.0.md) |
| **Constitution v3.4.1** | Governance, tiered model, absolute prohibitions | [.specify/memory/constitution.md](../../.specify/memory/constitution.md) |
| **Issues Tracker** | Categorized issues and features by phase | [docs/issues/ISSUES.md](../issues/ISSUES.md) |
| **Changelog** | Record of delivered changes | [docs/CHANGELOG.md](../CHANGELOG.md) |
| **Handoff log** | Session-by-session progress record | [docs/plans/HANDOFF.md](../plans/HANDOFF.md) |

---

## Completed Work

### v1.0 — Personal Animation Tool (Jan–Feb 2026)

Canvas-based animation tool for rugby coaching drills with cloud storage, galleries, and moderation.

- Specs 001-005 complete (`archive/specs/`)
- PRD v1.0: 89% coverage (76/85 requirements)
- Deliverables: drag-drop editor, keyframe animation, video export, Supabase auth, public gallery, upvoting, link sharing, admin moderation

### v2.0 — Rugby Coaching Platform (Feb 2026–present)

Pivoted from personal tool to rugby coaching platform. Cloud-first, mobile-first, rugby-only architecture.

- **Phase 0**: Infrastructure rescue ✅ (Supabase restored, Vercel active)
- **Phase 1**: Mobile replay scaling fix ✅ (SHIPPED 2026-04-18)

---

## Current Status: Pre-Launch

**Infrastructure**: Supabase healthy. Vercel active.  
**User base**: Pre-launch — no external users yet.  
**Primary usage pattern**: Desktop edit / mobile view. Coaches build sessions at a desk; show players animations on their phone at the pitch.  
**Critical blocker**: RESOLVED ✅ (2026-04-18 — mobile replay scaling fixed).

---

## Active Roadmap

### Phase 2 — Launch Credibility (current priority)

**Goal**: First impression makes a grassroots rugby coach think "this was made for me." Core loop is clear, onboarding is seamless, design feels rugby-informed.

| Task | Description | Related issues |
|------|-------------|-----------------|
| T3 | Landing page overhaul — tactical/hand-drawn aesthetic + design research | UX-001, UX-002, UX-003, UX-007 |
| T4 | Canvas credibility — standard pitch layout with yard markers | UX-006 |
| T5 | Share workflow clarity — step-by-step guide + UX improvements | UX-008 |
| T6 | Auth visibility — logged-in indicator or login button | UX-005 |
| T7 | Basic inline user guide — coaches figure it out in <5 minutes | — |
| T8 | Coaching pedagogy taster — `/help/apes` info page | COACHING-PEDAGOGY.md |
| T9 | Gallery UX improvements — carousel + visual previews | UX-004, UX-009 |

**Open issues for this phase**: See [docs/issues/ISSUES.md](../issues/ISSUES.md) for UX-001 through UX-009.

**Design direction for Phase 2**: Tactical/hand-drawn aesthetic. Lean into the whiteboard/marker coaching tradition. One clear CTA. No heavy animations, no trackers (constitutional constraint).

---

### Phase 3 — Quality Safety Net & Security Hardening

**Goal**: Automated UAT catches regressions. Security review passed. Pre-beta readiness confirmed.

| Task | Description | Related issues |
|------|-------------|-----------------|
| T10 | Full security review — rate limiting, SQL injection, XSS, CSRF, auth tokens | SEC-001, SEC-002, SEC-003 |
| T11 | Core-loop E2E spec — create → save → share → verify mobile replay | — |
| T12 | CI gate on canvas/ShareViewer PRs — prevents silent mobile regressions | — |
| T13 | Animation layering control — set z-order, cones always first | FEAT-006 |
| T14 | Search & keyword discoverability — gallery search by tags | FEAT-007 |

**Open issues for this phase**: See [docs/issues/ISSUES.md](../issues/ISSUES.md) for SEC-001, SEC-002, SEC-003, FEAT-006, FEAT-007.

---

### Phase 4 — Growth (post-v1, after real coach feedback)

**Goal**: Expand capabilities based on real coach usage and feedback.

| Task | Description | Related issues |
|------|-------------|-----------------|
| — | Revisit priorities once app is in coaches' hands | — |

**Tentative priorities**:

1. **AI animation spike** — Natural language → animation JSON. First test: warm-up grid (validates schema before complex plays). Time-box to 1 session to assess feasibility.
2. **Simplicity audit** — Walk through with "5 minutes to figure it out" bar. Fix top 3 friction points.
3. **Mobile editor** — Only if real coaches confirm desktop-first doesn't fit their workflow.
4. **User guide hosting** — Evolve from inline help to a `/help` page.
5. **Endorsed animations** — Highlight animations endorsed by Hampshire RFU (FEATURE-001).
6. **Roadmap page** — Public roadmap for credibility (FEATURE-002).
7. **Kit visualization library** — Additional entities (tackle bags, shields, posts, etc.) (FEATURE-010).
8. **Export format decision** — GIF only, MP4, or server-side rendering (FEAT-008).
9. **Offline capability** — Read-only offline, with sync on reconnect (FEAT-009).
10. **Club accounts / team management** — Tier 4 from constitution; post-user-base.

**Open issues for this phase**: See [docs/issues/ISSUES.md](../issues/ISSUES.md) for FEATURE-001, FEATURE-002, FEATURE-010, FEAT-008, FEAT-009, DESIGN-001.

---

## Phase 5+ — Coaching Education Platform (Aspiration)

**Strategic pivot**: Transform from animation tool to integrated coaching education system. Embed pedagogical frameworks to elevate coaches' practice.

**Exploration focus**:
- Validate coaching frameworks (APES, Progression/Regression, Tell-Sell-Ask-Delegate) with grassroots coaches
- Prototype drill metadata schema with pedagogical tags
- Design session design tool with coaching balance visualization
- Investigate coaching guides and contextualized learning

**Phase 2 taster** (optional): Single info page (e.g., `/help/apes`) explaining one framework as credibility signal.

**Research & validation required**: See `docs/coaching-frameworks/COACHING-PEDAGOGY.md` for detailed exploration roadmap.

**Open issues**: ASPIRATION-001, FEATURE-003, FEATURE-004, FEATURE-005 in `docs/issues/ISSUES.md`

---

## Development Strategy

**Workflow**: SpecKit spec-driven development. Every feature: `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → implement → `/speckit.verify`.

**Multi-agent**: Claude for architecture, specs, and complex debugging. Copilot/Antigravity for mechanical task execution from `tasks.md`. Any agent can resume cold from spec + plan + tasks.

**Session discipline**: End every session with `/handoff` → append entry to `docs/plans/HANDOFF.md`.

**Pre-push gate**: `npm run lint && npx tsc --noEmit` must pass before any PR.

---

## v1 Launch Definition

A successful v1 launch requires:
1. **Core loop working** — desktop edit, share link, mobile replay renders correctly without zooming ✅
2. **Landing page credible** — a coach who doesn't know the project would trust it (Phase 2)
3. **Basic user guide** — <5 minutes to understand the app without help (Phase 2)
4. **Security hardened** — rate limiting, SQL injection prevention, CSRF protection (Phase 3)

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

**Absolute prohibitions**: No telemetry, no third-party analytics, no advertising, no paywalls for core features. OAuth auth: Google/Apple/GitHub permitted (V.2.3); Facebook/Meta/Twitter prohibited.
