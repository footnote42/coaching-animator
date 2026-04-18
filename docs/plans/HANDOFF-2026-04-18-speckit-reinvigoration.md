# Handoff: SpecKit Reinvigoration Session — 2026-04-18

## What was completed

This session was entirely tooling hygiene — no application code was touched.

### 1. SpecKit commands updated from upstream
All 9 core commands in `.claude/commands/speckit.*.md` were pulled fresh from `https://github.com/github/spec-kit` (`templates/commands/`). Key changes in upstream:
- Added **extension hooks** support (`.specify/extensions.yml` pre-execution checks)
- Template variable changed from `$ARGUMENTS` → `{ARGS}`
- Branch creation is now hook-delegated rather than inline git commands

### 2. Cleo removed
- Deleted `.cleo/` directory (4.7 MB — task state, schemas, backups, session data)
- Deleted `.mcp.json` (sole entry was the `@cleocode/mcp-server`)
- Removed the `@.cleo/templates/AGENT-INJECTION.md` injection from CLAUDE.md

### 3. IDE/framework artifacts removed
Deleted: `.gemini/`, `.windsurf/`, `.cursor/`, `.codex/`, `GEMINI.md`, `AGENTS.md`

### 4. CLAUDE.md rewritten (244 → 130 lines)
Cut: cleo injection block, Current Project Context (stale task numbers), Core Behaviors auto-commit section, duplicate command lists, stale `src/App.tsx` archaeology, Session Handoff section, full Documentation Index.

Added: `/handoff` one-liner, compact large-file warning block.

Revised: Environment section trimmed (removed PowerShell contradiction).

Kept: Path Aliases, Critical File Locations, Route→File mapping, ShareViewer layout notes, Entity Color Service (with examples), E2E test environment verification, Quality & Stability Guardrails, Constitutional Constraints, Supabase Join Flattening.

### 5. CI + Vercel fixes
- `.github/workflows/ci.yml`: Node.js 18.x → **22.x**
- `vercel.json`: removed 60s `maxDuration` override (Vercel default is now 300s)

### 6. specify-cli upgraded
`0.4.2` → **`0.7.3`** (latest pre-1.0.0 version retaining extension management). `v1.0.0` was accidentally installed mid-session but immediately rolled back — it's a complete product rewrite with no extension system.

### 7. Extensions installed (10 total including brownfield from prior session)
| Extension | Version | Commands |
|-----------|---------|---------|
| brownfield | 1.0.0 | bootstrap, scan, migrate, validate |
| git | 1.0.0 | feature, validate, remote, initialize, commit |
| verify | 1.0.3 | verify.run |
| bugfix | 1.0.0 | report, patch, verify |
| checkpoint | 1.0.0 | checkpoint.commit |
| superb | 1.3.0 | check, tdd, review, verify, critique, debug, finish, respond |
| pr-bridge | 1.0.0 | pr.generate, pr.checklist, pr.summary |
| spectest | 1.0.0 | test.generate, test.plan, test.coverage, test.gaps |
| status-report | 1.2.5 | status-report.show |

`tinyspec` was attempted but skipped — the extension itself has a naming convention bug (commands named `speckit.tinyspec` instead of `speckit.tinyspec.*`).

### 8. SPECKIT.md created
Quick-reference aide memoire at project root. Covers: standard workflow with all phase commands, escape hatches (bugfix, tinyspec note, debug), governance commands, test coverage commands, project management, git utilities, brownfield commands, spec artifact directory structure.

---

## Open issues

- **`tinyspec` unavailable**: For small tasks that don't warrant the full pipeline, there's no lightweight alternative currently. The extension is broken upstream. Workaround: just work ad-hoc for truly trivial changes, or use `/speckit.specify` with a minimal spec.
- **speckit.superb config**: The superb extension flagged "Configuration may be required — check `.specify/extensions/superb/`". Worth inspecting before relying on the hook-based triggers.
- **git extension config**: Same warning for `.specify/extensions/git/`. The branch numbering style (sequential vs timestamp) may need configuring.
- **No existing specs**: The `specs/` directory exists but there are no active specs from the SpecKit workflow yet. The next session should either run `/speckit.brownfield.bootstrap` to formally adopt SDD, or jump straight into specifying the first feature.
- **Uncommitted changes**: Everything from this session is unstaged. Commit before starting feature work.

---

## Next session handoff prompt

```
You are continuing work on coaching-animator, a Next.js 14 animation tool for rugby coaches.

This session should begin by committing all the tooling changes from the previous session,
then deciding whether to run the brownfield bootstrap or go straight to the first feature spec.

## State to commit first

Run:
  git add .claude/commands/ .specify/ CLAUDE.md SPECKIT.md vercel.json .github/workflows/ci.yml
  git rm -r --cached .cleo .gemini .windsurf .cursor .codex GEMINI.md AGENTS.md .mcp.json 2>/dev/null || true
  git commit -m "chore: reinvigorate with SpecKit-only workflow

- Update all 9 speckit core commands from upstream (v0.7.3)
- Install 9 extensions: git, verify, bugfix, checkpoint, superb, pr-bridge,
  spectest, status-report, brownfield
- Remove cleo, IDE artifacts (.gemini, .windsurf, .cursor, .codex), AGENTS.md
- Rewrite CLAUDE.md 244→130 lines (cut stale/inferrable content)
- Add SPECKIT.md quick-reference aide memoire
- Upgrade CI to Node 22.x, remove 60s Vercel function timeout cap"

## Tooling overview

- Workflow framework: SpecKit (specify-cli v0.7.3)
- Command reference: SPECKIT.md at project root
- Extensions: see SPECKIT.md for full command list
- Key workflow: /speckit.specify → plan → tasks → implement → verify → pr.generate
- Small tasks: no tinyspec available; work ad-hoc or use minimal spec
- Bugs: /speckit.bugfix.report → .patch → .bugfix.verify

## Recommended first action: brownfield bootstrap

The project has existing code but no SpecKit specs yet. Run:
  /speckit.brownfield.bootstrap

This will scan the architecture, document existing patterns, and set up the .specify/
directory properly so future specs inherit the right context (Next.js feature-based
architecture, Supabase auth, Konva canvas, constitutional constraints).

## If skipping bootstrap and going straight to a feature

The next roadmap items are:
- T052–T054: Remix Genealogy (show animation remix chain in gallery)
- T044–T046: Rugby Pivot (sport-specific position presets and formations)
- T051: E2E test coverage for canvas pitch render (23/23 passing on production)

Kick off with:
  /speckit.specify <feature description>

Key constraints from the constitution:
- No telemetry, third-party auth, or paywalls
- Tier 1 (auth) gets cloud storage; Tier 0 (guest) gets 10-frame local only
- Entity colors must go through EntityColors service, never hardcoded hex

## Repo essentials

- Dev server: npm run dev (port 3000)
- Pre-push: npm run lint && npx tsc --noEmit
- Main components: src/features/animation/, src/features/gallery/, src/core/
- Canvas components are shared across /app, /replay/[id], /share/[id] — test all three
- ShareViewer uses position:fixed inset:0 — do not change to h-screen/h-full
- Supabase joins may return object|object[]|null — always flatten before use
```

---

## Docs updated

- `CLAUDE.md` — fully rewritten this session (done)
- `SPECKIT.md` — created this session (done)
- `docs/plans/HANDOFF-2026-04-18-speckit-reinvigoration.md` — this file
