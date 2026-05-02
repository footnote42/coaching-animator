# Next Session: Audit, Align, Accelerate — Execute Phase A

## Context

The retrospective design and implementation plan are both committed. The plan is at:
`docs/superpowers/plans/2026-05-02-solo-dev-retrospective.md`

The design spec is at:
`docs/superpowers/specs/2026-05-02-solo-dev-retrospective-design.md`

**Do not resume any build work until Phase A is complete.** Phase A is a hard prerequisite — it produces actual config changes, not just observations.

## What to do at session start

Invoke the Subagent-Driven execution skill immediately:

```
/superpowers:subagent-driven-development
```

When it asks which plan to run, point it to:
`docs/superpowers/plans/2026-05-02-solo-dev-retrospective.md`

Start with **Task A1: Audit registered MCP servers**.

## What Phase A produces

1. `docs/review/tooling-decision.md` — structured keep/remove/reconfigure decision per tool
2. Cleaned-up `.claude/settings.local.json` — ~120 accumulated permissions replaced with a curated minimal set
3. `~/.claude/settings.json` — unused plugins removed

## Phase A task sequence

| Task | What it does |
|------|-------------|
| A1 | Audit MCPs and plugins — fill in `tooling-decision.md` with decisions and rationale |
| A2 | Clean up accumulated permissions in `.claude/settings.local.json` |
| A3 | Remove unused plugins/MCPs from global settings |
| A4 | Verify — you can describe your setup from memory without notes |

## After Phase A

Phase B (Decision Archaeology) and Phase C (Scope Review) run alongside the resumed build — they do not block it. Once Phase A is done, update HANDOFF.md and pick the next spec.

## Key files for context

- Current settings: `~/.claude/settings.json` (18 plugins, effortLevel: medium)
- Local permissions: `.claude/settings.local.json` (~120+ accumulated allow entries)
- Build diary: `docs/plans/HANDOFF.md` (Phase 0-2l, ~32KB)
- Roadmap: `docs/authority/ROADMAP.md` (Phase 3-5+ open, Phase 0-2 complete)
