# SpecKit Quick Reference

## Standard feature workflow

```
specify → clarify? → plan → tasks → implement → verify → pr.generate → finish
```

| Step | Command | Does |
|------|---------|------|
| 1 | `/speckit.specify <description>` | Creates branch + spec.md |
| 2 | `/speckit.clarify` | Resolves ambiguities in spec.md |
| 3 | `/speckit.plan` | Generates plan.md, data-model.md, contracts/ |
| 4 | `/speckit.tasks` | Generates dependency-ordered tasks.md |
| 4a | `/speckit.superb.review` | Checks tasks.md covers every spec requirement |
| 4b | `/speckit.superb.tdd` | Enforces RED-GREEN-REFACTOR per task |
| 5 | `/speckit.implement` | Executes tasks phase-by-phase |
| 5a | `/speckit.checkpoint.commit` | Mid-implementation commit (call anytime) |
| 6 | `/speckit.verify.run` | Validates implementation against spec |
| 6a | `/speckit.superb.verify` | Extended verification with spec-coverage checklist |
| 7 | `/speckit.pr.generate` | Writes PR description from spec artifacts |
| 7a | `/speckit.pr.checklist` | Generates PR review checklist |
| 8 | `/speckit.superb.finish` | Branch completion (merge / PR / keep / discard) |

---

## Escape hatches

| Situation | Command |
|-----------|---------|
| Small task (< 30 min, no spec needed) | `/speckit.tinyspec` — skips the full pipeline |
| Bug found | `/speckit.bugfix.report` → `.patch` → `.bugfix.verify` |
| Code review feedback to address | `/speckit.superb.respond` |
| Stuck on a failing fix | `/speckit.superb.debug` |

---

## Governance & analysis

| Command | Does |
|---------|------|
| `/speckit.constitution` | Checks feature against constitutional constraints |
| `/speckit.checklist` | Generates domain-specific QA checklists |
| `/speckit.analyze` | Consistency check across spec artifacts |
| `/speckit.superb.critique` | Staff-level review of code against spec requirements |

---

## Test coverage

| Command | Does |
|---------|------|
| `/speckit.test.generate` | Scaffolds Playwright/Vitest tests from spec criteria |
| `/speckit.test.plan` | Writes a test plan from spec |
| `/speckit.test.coverage` | Maps which criteria have test coverage |
| `/speckit.test.gaps` | Lists untested acceptance criteria |

---

## Project management

| Command | Does |
|---------|------|
| `/speckit.status-report.show` | Current feature, artifact status, task completion |
| `/speckit.taskstoissues` | Pushes tasks.md to GitHub Issues |
| `/speckit.pr.summary` | Standalone PR summary (no full description) |

---

## Git utilities

| Command | Does |
|---------|------|
| `/speckit.git.feature` | Creates feature branch with sequential numbering |
| `/speckit.git.validate` | Checks branch naming convention |
| `/speckit.git.commit` | Auto-commits after a SpecKit command |
| `/speckit.git.remote` | Detects GitHub remote URL |

---

## Brownfield (one-time setup, already run)

| Command | Does |
|---------|------|
| `/speckit.brownfield.bootstrap` | Bootstraps SpecKit on existing codebase |
| `/speckit.brownfield.scan` | Auto-discovers architecture |
| `/speckit.brownfield.migrate` | Adopts SDD incrementally |
| `/speckit.brownfield.validate` | Validates migration completeness |

---

## Superb diagnostics

`/speckit.superb.check` — verifies which superpowers skills are installed and which hooks are armed.

---

## Spec artifact locations

```
specs/
└── <NNN>-<short-name>/
    ├── spec.md          ← source of truth for the feature
    ├── plan.md          ← technical implementation plan
    ├── tasks.md         ← ordered, checkboxed task list
    ├── data-model.md    ← schema / type changes
    └── contracts/       ← API contracts, interface definitions
```
