# Changelog

All notable changes to the coaching-animator project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

> For v1.0 changelog history, see `archive/completed-phases/CHANGELOG-v1.md`.

---

## [Unreleased] — v2.0 Phase 2: Progressions & Remix Genealogy

### In Progress
- Animation progressions (ordered drill sequences)
- Remix genealogy tree visualization
- Progression builder UI

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
