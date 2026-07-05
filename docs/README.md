# Coaching Animator Documentation

**Last Updated**: 2026-07-05

Project documentation was migrated to the Obsidian vault on 2026-07-05. This repo keeps only repo-coupled docs; everything else — requirements, planning, architecture reference, issue history, session archives — lives in the vault. Full history of the moved files remains in git.

## Where things are now

**Vault**: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`

| Content | Location |
|---|---|
| PRD v2.0, ROADMAP, ISSUES, USER-WORKFLOWS, audits, DevPlan tracker | vault `00-Planning/` |
| Architecture (DB schema, API contracts, auth patterns, migrations), dev guides, troubleshooting, CI/CD + staging + operations runbooks | vault `02-Reference/` |
| HANDOFF.md diary (retired), old roadmaps, retrospectives, reviews, prompts | vault `05-Archive/` |
| Session state / next action | `NOW.md` (repo root — updated via `/park`) |
| Binding constitution | `.specify/memory/constitution.md` (stays in repo — Speckit reads it) |

## Still in this repo

- [CHANGELOG.md](CHANGELOG.md) — v2.0+ changelog
- [testing/MANUAL-TEST-SCRIPT.md](testing/MANUAL-TEST-SCRIPT.md) — 76-test manual regression suite
- [testing/TEST-RUN-2026-05-17.md](testing/TEST-RUN-2026-05-17.md) — latest full run record
- [testing/strategy.md](testing/strategy.md) / [testing/e2e-guide.md](testing/e2e-guide.md) — Playwright approach
- [user-guide/HOW-TO.md](user-guide/HOW-TO.md) — user-facing guide
- Feature module READMEs: `src/features/animation/`, `src/features/gallery/`, `src/core/`, `src/shared/` (large — see CLAUDE.md before reading)
- `specs/` — Speckit feature specs 001–023
