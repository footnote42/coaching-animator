# Changelog

All notable changes to the coaching-animator project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

> For v1.0 changelog history, see `archive/completed-phases/CHANGELOG-v1.md`.

---

## [Unreleased] — v2.0 Phase 2: Progressions & Remix Genealogy

### Added (2026-02-26)
- **Mobile share viewer redesign** (T055): `/share/[id]` is now a true full-screen, no-scroll experience on mobile
  - `useShareCanvasSize` hook — ResizeObserver on container ref, fits 4:3 canvas to available viewport space without window resize jitter
  - `FloatingRemote` component — draggable pill overlay (pointer-capture drag, percentage-based position survives orientation changes), double-tap handle to reset, 44×44px play/pause touch target, safe-area-inset-bottom clamping
  - `ShareViewer` uses `position: fixed; inset: 0` to escape root layout document flow (Navigation sibling no longer causes 16px y-offset)
  - Canvas + FloatingRemote wrapped in shared relative div so remote anchors to canvas bounds, not the full viewport
  - Back-to-site link pinned bottom-left with `env(safe-area-inset-bottom)` padding

### Added (2026-02-21)
- **Progression drag-drop reorder** (T048): `@dnd-kit/sortable` pills with ⠿ drag handles in `ProgressionPanel`; `PATCH /api/animations/[id]/progressions/reorder` with ownership validation and optimistic UI + server revert
- **Progression set detail page** (T050): `/progression/[id]` — vertical numbered sequence (Base → P1 → P5), thumbnail + Watch button per step
- **Progression badge links** (T049/T050): `+N progressions` badges on `AnimationCard` and `PublicAnimationCard` now link to `/progression/[id]`
- **Public progressions API** (T050): `GET /api/animations/[id]/progressions` now accessible for public/link_shared base animations (previously owner-only)

### In Progress
- T051: E2E tests — progression workflow
- T052–T054: Remix genealogy visualization (remix count, A→B→C breadcrumb)
- T044–T046: Rugby-only pivot (VISIBLE_SPORTS feature flag)
- T033: First-run experience after email confirmation

### Planned
- GIF export (Safari compatibility)
- Organizational accounts (Tier 4)
- Curated collections with editorial features

---

## v2.0 Phase 0-1 — Foundation & Feature Buildout (2026-02-11 to 2026-02-21)

### Added
- **Feature-based architecture** (T003-T005): 85 files migrated to `src/core/`, `src/features/`, `src/shared/` with path aliases and barrel exports
- **Comprehensive module READMEs** (~9,700 lines): animation, gallery, core, shared
- **Mobile share route** (T015): `/share/[id]` — mobile-optimized replay page
- **Template Library** (T035): remix flow + admin tagging for reusable animation templates
- **Club Personalization** (T040): profile branding + editor color theming
- **Progressions & Remix DB schema** (T016): progression fields, remix columns, counters, integrity triggers
- **Progressions API** (T016): gallery filtering, progression sets, remix attribution
- **Editor progression panel** (T016): switch/create progressions with dirty-state guard
- **Collection detail view** (T016): progression set rendering with orphan fallback
- **Landing page copy rewrite** (T027/T028): "Stop explaining. Start showing." hero
- **UI/UX audit** (T026): copy alignment + constitution patch (v3.3 to v3.4.0)
- **Staging environment** (T014): separate Supabase project for pre-production testing
- **Admin RLS policies**: DELETE/UPDATE on saved_animations
- **15 bug/improvement fixes** in backlog sprint

### Changed
- Constitution updated to v3.4.0 (mobile-first amendments)
- PRD-v2.0 established as governing product document (supersedes PRD v1.0)
- Cloud-first architecture model (offline fallback removed)
- Rugby-only sport focus (multi-sport UI deprioritized)

---

## v1.0 — Personal Animation Tool (2026-01-15 to 2026-02-10)

See `archive/completed-phases/CHANGELOG-v1.md` for detailed v1.0 history covering:
- Initial Vite-based animation tool (Spec 001)
- Clean iteration with save/load/export (Spec 002)
- Online platform with Supabase (Spec 003): user accounts, cloud storage, galleries, upvoting, moderation
- Post-launch improvements (Spec 004)
- Incremental improvements (Spec 005): 14 issues including OAuth reversal per constitution
