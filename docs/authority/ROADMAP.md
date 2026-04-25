# Coaching Animator Roadmap

**Version**: 3.0  
**Last Updated**: 2026-04-25  
**Status**: Active authority document  
**Previous roadmap**: `docs/archive/ROADMAP-2026-04-19.md`

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

## Completed Work

### v1.0 — Personal Animation Tool (Jan–Feb 2026)

Canvas-based animation tool for rugby coaching drills with cloud storage, galleries, and moderation.

- Specs 001-005 complete (`archive/specs/`)
- PRD v1.0: 89% coverage (76/85 requirements)
- Deliverables: drag-drop editor, keyframe animation, Supabase auth, public gallery, upvoting, link sharing, admin moderation

### v2.0 — Rugby Coaching Platform (Feb 2026–present)

Pivoted from personal tool to rugby coaching platform. Cloud-first, mobile-first, rugby-only architecture.

- **Phase 0**: Infrastructure rescue ✅ (Supabase restored, Vercel active)
- **Phase 1**: Mobile replay scaling fix ✅ (SHIPPED 2026-04-18)
- **Phase 2 — T3**: Landing page rebrand ✅ (SHIPPED 2026-04-20 — Oswald headings, warm cream palette, typographic cards, WCAG AA contrast)
- **Phase 3 — T3a**: Technical debt refactor ✅ (SHIPPED 2026-04-25 — Editor.tsx 852→504 lines, 4 domain hooks extracted, 25 granular store selectors, 73/73 tests passing)

---

## Current Status: Pre-Launch

**Infrastructure**: Supabase healthy. Vercel active.  
**User base**: Pre-launch — no external users yet.  
**Primary usage pattern**: Desktop edit / mobile view. Coaches build sessions at a desk; players receive a share link on their phone at the pitch.

---

## v1 Launch Definition

A successful v1 launch requires all of the following:

1. **Core loop working** ✅ — desktop edit, save, share link, mobile replay renders correctly
2. **Landing page credible** ✅ — tactical rebrand shipped 2026-04-20
3. **Editor & canvas credible** — pitch markings accurate, entity UX coherent (Phase 2a–2b)
4. **Share workflow clear** — share button works, /share/{id} reachable from gallery (Phase 2c)
5. **Legal compliant** — cookies assessed, ToS and Privacy Policy reviewed (Phase 2d)
6. **Basic user guide** — coaches self-onboard in <5 minutes (Phase 2h)
7. **Security hardened** — rate limiting, injection prevention, auth tokens (Phase 3b)

---

## Active Roadmap

### Phase 2 — Launch Credibility (current priority)

**Goal**: Every part of the product a coach will touch before committing to the tool is credible, correct, and legally compliant. Broken into execution sub-areas; each maps to a speckit spec.

**Suggested execution order** (within Phase 2):

| Order | Sub-area | Scope summary | Key issues |
|-------|----------|---------------|------------|
| 1 | **2d — Legal & Compliance** | Cookie banner, ToS, Privacy Policy, contact verification | LEGAL-001, LEGAL-002, LEGAL-003, CONTACT-001 |
| 2 | **2a — Editor & Canvas** | Pitch SVG, canvas scaling, entity styling, colour palette, labels, team selector, export deprecation | PITCH-001, PITCH-002, EDITOR-001–009, UX-006 |
| 3 | **2b — Playback & Controls** | Floating draggable remote; sticky controls | PLAYBACK-001 |
| 4 | **2c — Share Workflow** | Share button fix, /share/{id} from gallery, replay navigation, WhatsApp | EDITOR-002, FLOW-001, FLOW-002, UX-008, GALLERY-002 |
| 5 | **2e — Landing Refinements** | Background tactical ball icon, Section 2/3 card copy corrections | LANDING-001–004 |
| 6 | **2f — Gallery & My Playbook** | Endorsement icon, templates test, My Playbook search/filter, visual previews | GALLERY-001, GALLERY-003, MYPLAYBOOK-001, UX-004, UX-009 |
| 7 | **2g — Auth & Profile** | Auth state indicator in header, profile UX | UX-005, PROFILE-001 |
| 8 | **2h — User Guide** | Inline onboarding, help page; coaching pedagogy taster | (T7), T8 |

**Open issues**: See [docs/issues/ISSUES.md](../issues/ISSUES.md) for full details on each issue above.

---

### Phase 3 — Stability, Security & Technical Debt

**Goal**: Automated safety net catches regressions. Security review passed. Technical debt addressed before user base grows. Pre-beta readiness confirmed.

| Sub-area | Scope | Key issues |
|----------|-------|------------|
| **3a — Technical Debt** ✅ | Editor.tsx 852→504 lines (41% reduction). 4 hooks: `useEditorContextMenuHandlers`, `useEditorEntityHandlers`, `useEditorProgressionHandlers`, `useEditorPlaybackHandlers`. 25 granular store selectors replacing 2 broad destructures. Shipped 2026-04-25. | — |
| **3b — Security Hardening** | Rate limiting, SQL injection, XSS, CSRF, auth tokens, env variable audit | SEC-001, SEC-002, SEC-003 |
| **3c — E2E Core Loop** | Create → save → share → verify mobile replay CI gate | — |
| **3d — Search & Layering** | Gallery search by tags, animation entity z-order control | FEAT-006, FEAT-007 |
| **3e — Performance Baseline** | Lighthouse audit across all routes; establish pre-beta targets | PERF-001 |

**Sequence**: 3a (debt) before 3b (security) — a 504-line component is easier to audit than the original 852-line monolith.

---

### Phase 4 — Growth (post-v1 launch)

**Goal**: Expand capabilities based on real coach usage and feedback. Do not build Phase 4 features before v1 launch.

**Tentative priorities** (revisit after coach feedback):

1. **Simplicity audit** — walk through with "5 minutes to figure it out" bar; fix top 3 friction points
2. **AI animation spike** — natural language → animation JSON; time-box to 1 session to assess feasibility
3. **Kit visualization library** — additional entities (tackle bags, shields, posts, etc.) (FEATURE-010)
4. **Export format decision** — deliberate decision: drop / GIF / MP4 / server-side (FEAT-008)
5. **Endorsed animations** — Hampshire RFU endorsement badge system (FEATURE-001)
6. **Offline capability** — read-only offline with sync on reconnect (FEAT-009)
7. **Roadmap page** — public roadmap for credibility (FEATURE-002)
8. **Snap to grid** — entity snapping during frame construction (FEAT-010)
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

## Development Strategy

**Workflow**: SpecKit spec-driven development. Every feature: `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → implement → `/speckit.verify`.

**Phase 2 sub-areas**: Each sub-area (2a–2h) should become its own speckit spec before implementation begins.

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
