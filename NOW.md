# NOW — coaching-animator

## Status
IN PROGRESS (2026-10-02) — took the slot freed by Comms (queued) and Portfolio (parked). Supabase prod restored 2026-10-02 (was paused since ~July); staging left paused.

## Next
Weekend to Wed 7 Oct (interview week): Animator only after prep blocks, max 2 sessions.
1. Housekeeping: push the 3 local commits; keep or delete `prototype/brand.html` + `roadmap.html`
2. Smoke test the live site: load, sign in, save to cloud, share link (watch for T-094)
3. Phase 1 item 1.1 — fix `useAutoSave` (interval resets on every edit; gate on isDirty, project via ref, Sonner instead of alert)
4. Phase 1 item 1.2 — T-061 (Enter in Tags submits save form)

From Thu 8 Oct (lean in):
1. `/polish-audit` → findings filed as GitHub issues
2. Migrate DevPlan Phases 1, 3, 4 to GitHub issues (single tracker; DevPlan becomes read-only history). Hold Phase 2
3. `/improve-codebase-architecture` → its output replaces Phase 2 (2.1–2.4) as tickets
4. Large tickets → Antigravity; Small ones stay with Wayne

## Context
- **Housekeeping on return (flagged 2026-09-25):** review the untracked `prototype/brand.html` and `prototype/roadmap.html` (May prototypes), then keep or delete them. 3 local commits are unpushed: push once you're satisfied.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`
- Active worklist: `00-Planning/DevPlan.html` (interactive tracker) + `00-Planning/DevPlan.md`
- Full audit: `00-Planning/Audit-2026-07-05.md`
- HANDOFF.md retired → vault `05-Archive/HANDOFF.md`; this file replaces it (updated via /park)
- Open bugs carried in: T-061 (Enter in Tags submits save form), T-094 (corrupt cloud animation)

## Blocker
None.

## Last session
2026-07-05 — Full engineering/design/security audit (report in vault 00-Planning). Migrated docs/ to Obsidian vault (aggressive scope: authority, plans, issues, archive, review, audit, superpowers, architecture, development, technical, troubleshooting, ops docs). Repo keeps CLAUDE.md, NOW.md, specs/, .specify/, docs/testing/, docs/user-guide/, docs/CHANGELOG.md. Introduced /park + NOW.md workflow replacing HANDOFF.md. Built interactive DevPlan tracker seeded with all audit roadmap items.
