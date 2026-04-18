# Coaching Animator Roadmap

**Last Updated**: 2026-02-21
**Status**: Active authority document

---

## Governing Documents

| Document | Role | Location |
|----------|------|----------|
| **PRD-v2.0** | Product requirements, feature specifications, phased rollout | [docs/authority/PRD-v2.0.md](PRD-v2.0.md) |
| **Constitution v3.4.0** | Governance, tiered model, absolute prohibitions | [docs/authority/constitution.md](constitution.md) |
| **Changelog** | Record of delivered changes | [docs/CHANGELOG.md](../CHANGELOG.md) |

The PRD-v2.0 defines **what** to build. The Constitution defines **constraints**. This roadmap tracks **where we are**.

---

## Completed Work

### v1.0 — Personal Animation Tool (Jan–Feb 2026)

Built a canvas-based animation tool for rugby coaching drills with cloud storage, galleries, and moderation.

- Specs 001-005 (all complete, archived in `archive/specs/`)
- PRD v1.0 achieved 89% coverage (76/85 requirements)
- Key deliverables: drag-drop editor, keyframe animation, video export, Supabase auth, public gallery, upvoting, link sharing, admin moderation

### v2.0 Phase 0-1 — Foundation & Feature Buildout (Feb 11–21, 2026)

Pivoted from personal tool to rugby coaching platform. Established cloud-first, mobile-first, rugby-only architecture.

- **Phase 0**: Staging Supabase project (T014), mobile share route `/share/[id]` (T015)
- **Phase 1**: Feature-based architecture (T003-T005), collections + version control tables, template library (T035), club personalization (T040)
- **UI/UX audit** (T026-T028): Landing page copy rewrite, hero messaging
- **Backlog sprint**: 15 bug/improvement fixes
- **Progressions & Remix DB + API** (T016): progression fields, remix genealogy columns, counters, triggers, gallery cards, editor panel, collection detail

---

## Current Phase: v2.0 Phase 2 — Progressions & Remix Genealogy (v2.1)

**PRD reference**: Sections 5.2 (Progressions), 5.5 (Remix), 7.2.1, 11.1

**Status**: Progressions UI complete (T048–T050 ✓). Mobile share viewer redesigned (T055 ✓). Remaining: T051 E2E tests, T052–T054 Remix Genealogy, T044–T046 Rugby Pivot.

### What Phase 2 delivers

1. **Drill progressions** — Base animation + up to 5 variations linked via `parent_animation_id`
2. **Remix genealogy** — Fork lineage (A->B->C) visible in UI as breadcrumb
3. **Gallery presentation** — One card per progression set with expand badge
4. **Collection detail** — Base + progressions in vertical sequence

### DB schema (applied)

```sql
-- Added to saved_animations
parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE
progression_order   INTEGER DEFAULT 0
is_progression      BOOLEAN DEFAULT FALSE
remixed_from_id     UUID REFERENCES saved_animations(id) ON DELETE SET NULL
remix_count         INTEGER DEFAULT 0
```

### Key files

| Area | Path |
|------|------|
| PRD sections | `docs/authority/PRD-v2.0.md` sections 5.2, 5.5, 7.2.1 |
| DB migrations | `supabase/migrations/` |
| Gallery cards | `src/features/gallery/components/AnimationCard.tsx` |
| Collection detail | `src/app/collections/[id]/page.tsx` |
| Animations API | `src/app/api/animations/` |

---

## Future Phases

### Phase 3 (v2.2): Organizations & Endorsements

**Scope**: Large — new tables, RLS policies, member management

- New tables: `organizations`, `organization_members`
- New column: `organization_id` in `saved_animations`
- Endpoints: Organizations CRUD, membership, endorsement badges
- UI: Organization profile, member management
- Introduces **Tier 4 (Organizational)** from Constitution v3.4.0

### Phase 4 (v2.3): Personalization & Video Links

**Scope**: Small — 4 DB columns + settings UI

- New columns in `user_profiles`: `club_name`, `club_badge_url`, `primary_strip_color`, `secondary_strip_color`
- UI: Club personalization settings, video link display

### Future Backlog (unscheduled)

- **Safari/iOS GIF export** — browser detection + fallback (HIGH-002 from PRD)
- **Password reset flow** — forgot password UX
- **Advanced video export** — higher quality, more formats
- **Following system** — `follows` table exists but no UI (deferred from v1.0)

---

## Constitutional Constraints

All phases must comply with [Constitution v3.4.0](constitution.md):

**Tiered Architecture** (Cloud-First):
| Tier | Access Level |
|------|-------------|
| 0 (Guest) | 10-frame local editing, JSON export only |
| 1 (Authenticated) | Cloud storage, personal gallery, 50 animations max |
| 2 (Public/Link-Shared) | Link sharing, public gallery, upvoting |
| 3 (Admin) | Moderation, user management |
| 4 (Organizational) | Club accounts, team management (Phase 3) |

**Absolute Prohibitions**:
- No telemetry, analytics, or tracking
- No third-party identity providers (Google, Facebook, etc.)
- No advertising or sponsored content
- No paywalls for core features

**Mobile-First**: Adaptive canvas, bottom tab navigation, touch-optimized interactions (v3.4.0 amendment)

---

## Rollback Plans

Each phase has SQL rollback scripts documented in [PRD-v2.0 Section 11.2](PRD-v2.0.md).

---

## Maintenance & Archive

Historical documentation is preserved in `.gitignored` archive directories:

| Archive | Contents |
|---------|----------|
| `archive/v1-docs/` | PRD v1.0, alignment reports, V2 Vision narrative, historical bug audits |
| `archive/completed-phases/` | v1.0 changelog, session handoffs, completed phase artifacts |
| `archive/specs/` | Specifications 001-006 (all completed) |
| `archive/implementation_plans/` | Phase-by-phase implementation plans |

For historical bug investigation, see `archive/v1-docs/troubleshooting/`.
