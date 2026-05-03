# Tooling Audit Decisions
**Date**: 2026-05-03
**Question per item**: Do I know what this does? Is it making me a better director of AI? Would I include it if starting fresh?

---

## MCP Servers

| MCP | Decision | Rationale |
|-----|----------|-----------|
| claude.ai Audible | Remove | Audiobook recommendations — no connection to development work. |
| claude.ai Context7 | Review | Fetches live library docs; duplicates plugin:context7 — keep only one. |
| claude.ai Gmail | Review | Useful for productivity but injects into every dev session; only keep if actively used. |
| claude.ai Google Calendar | Review | Same as Gmail — useful but not dev-specific; injects into every session. |
| claude.ai Google Drive | Review | Rarely needed in a coding session; keep only if actively used for docs sharing. |
| claude.ai Mermaid Chart | Review | Useful for architecture diagrams; assess whether actively used. |
| claude.ai Microsoft Learn | Remove | Azure/.NET documentation — not relevant to Next.js/Supabase stack. |
| claude.ai Spotify | Remove | Music control — not a development tool. |
| claude.ai Vercel | Keep | Direct Vercel platform access — deployment logs, project status — relevant to this project. |
| plugin:context7 | Keep | Fetches live library docs; prefer this over claude.ai Context7 (plugin is more targeted). |
| plugin:playwright | Keep | Browser automation for E2E testing and UI verification — active use. |
| plugin:supabase | Keep | Direct Supabase access — migrations, logs — active use. |
| plugin:vercel | Keep | Vercel tools; prefer plugin over claude.ai Vercel (plugin is more focused). |
| cleo (mcp.json) | Review | CLEO task system — assess whether multi-agent ceremony adds value for a solo developer. |

## Plugins / Skills

| Plugin | Decision | Rationale |
|--------|----------|-----------|
| github | Keep | GitHub CLI integration — useful for PRs and issues. |
| playwright | Keep | Browser automation — active use for E2E testing. |
| code-simplifier | Review | Auto-simplifies code after edits; assess whether it helps or interrupts flow. |
| typescript-lsp | Keep | TypeScript language server — type checking in-session, genuinely useful. |
| frontend-design | Review | Frontend design guidance — assess whether frontend-design skill is actively invoked. |
| context7 | Keep | Core docs-fetching capability — one of the most useful plugins. |
| code-review | Keep | Code review skill — use deliberately at phase boundaries. |
| superpowers | Keep | Core workflow skills (brainstorming, plans, execution) — active use throughout. |
| security-guidance | Keep | Security skill — will be needed for Phase 3b hardening. |
| commit-commands | Keep | Commit workflow — active use. |
| supabase | Keep | Supabase skill — active use. |
| claude-md-management | Review | CLAUDE.md editing — used occasionally; assess if skill adds enough value over direct editing. |
| hookify | Review | Hook creation — assess whether hooks have been deliberately designed or just accumulated. |
| feature-dev | Review | Feature development skill suite — assess how often used vs superpowers equivalents. |
| serena | Review | LSP-based code navigation (find references, go-to-definition) — new capability, assess actual use. |
| vercel | Keep | Vercel deployment skill — active use for this project. |
| impeccable | Keep | UI/design polish skill — active use throughout Phase 2. |

## Settings

| Setting | Current Value | Decision | Rationale |
|---------|--------------|----------|-----------|
| effortLevel | medium | Keep | Balanced effort is appropriate for solo development work. |
| statusLine | CLEO context-monitor | Review | Assess whether CLEO context monitoring adds value or just adds noise. |
| enableAllProjectMcpServers | true | Keep | Auto-loads project MCPs — saves manual configuration. |
| permissions allow list | ~190 entries, accumulated over many sessions | Review | Accumulated permissions create invisible context injection; trim to curated minimal set. |

## Workflow Architecture

| Component | Decision | Rationale |
|-----------|----------|-----------|
| SpecKit (specify CLI) | Keep | Structured spec workflow — assess engagement quality (directing vs approving). |
| CLEO subagent architecture | Review | Complex multi-agent system — assess whether ceremony adds value for solo developer or just distances from decisions. |
| Superpowers skill suite | Keep | Core coordination skills (brainstorm, plan, execute) — active use, lightweight. |
| Impeccable design skill | Keep | UI polish — actively directed design decisions throughout Phase 2. |
| Hookify | Review | Hook creation — verify hooks are deliberately designed, not just accumulated. |

## Permissions Cleanup

**Before**: ~190 accumulated entries across many sessions
**After**: 76 curated entries

**Removed categories**:
- Windows-specific commands (timeout /t, del /F nul, Get-ChildItem, findstr, dir:*)
- Old project path references (/mnt/c/Coding Projects/, C:\\Coding Projects\\)
- One-off session exports (export CLEO_SESSION=session_20260214_*)
- Specific supabase repair commands (migration repair --status with hardcoded timestamps)
- Hardcoded test file paths (specific .spec.ts paths, not wildcard patterns)
- Defunct ct/* commands (ct session, ct focus, ct show — now subsumed by cleo:*)
- Debugging echo commands (echo Exit:$?, echo EXIT:$?, etc.)
- Specify install one-offs (PYTHONUTF8=1 uv tool install specify-cli*)

**Rationale**: Accumulated permissions create invisible context injection. Every permanently allowed command is one fewer decision point where you engage judgment. Wildcard patterns (npm*, git*, npx*) cover the actual dev workflow without naming specific one-off commands.

## Final Tooling State

### MCPs Active (plugin-managed — via settings.json)
- plugin:context7 — live library documentation fetching
- plugin:playwright — browser automation for E2E testing
- plugin:supabase — direct Supabase database access
- plugin:vercel — Vercel deployment tools

### MCPs Active (claude.ai-managed — require web UI to remove)
- claude.ai Vercel — deployment logs and project status
- claude.ai Context7 — duplicate of plugin:context7 (flagged for review)
- claude.ai Gmail — productivity tool (flagged for review)
- claude.ai Google Calendar — productivity tool (flagged for review)
- claude.ai Google Drive — productivity tool (flagged for review)
- claude.ai Mermaid Chart — architecture diagrams (flagged for review)

### Plugins Active
- github — GitHub CLI integration
- playwright — browser automation skills
- code-simplifier — post-edit simplification (flagged for review)
- typescript-lsp — TypeScript language server
- frontend-design — frontend design guidance (flagged for review)
- context7 — core docs-fetching capability
- code-review — code review skill
- superpowers — core workflow skills
- security-guidance — security review skill
- commit-commands — commit workflow
- supabase — Supabase skill
- claude-md-management — CLAUDE.md editing (flagged for review)
- hookify — hook creation (flagged for review)
- feature-dev — feature development skills (flagged for review)
- serena — LSP-based code navigation (flagged for review)
- vercel — Vercel deployment skill
- impeccable — UI/design polish skill

### What Was Removed
- claude.ai Audible, Microsoft Learn, Spotify — removed from consideration; flagged for manual removal via claude.ai web UI (not manageable via settings.json)
- ~114 stale permission entries from settings.local.json (Windows commands, old paths, one-off repair commands, defunct ct/* commands)

### What I'm Uncertain About (review in 2 weeks)
- claude.ai Context7 vs plugin:context7: keep one, remove the other
- claude.ai Gmail/Calendar/Drive: useful for productivity but injects into dev sessions
- code-simplifier: does post-edit simplification help or interrupt flow?
- frontend-design, feature-dev: assess whether these skills are actively invoked vs superpowers equivalents
- serena: new LSP-based navigation — assess whether actually used
- hookify: are current hooks deliberately designed or just accumulated?
- claude-md-management: assess if the skill adds enough value over direct editing
- CLEO subagent architecture: assess ceremony overhead for solo developer
