# Audit, Align, Accelerate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete a three-phase solo developer retrospective producing: a rationalized tooling setup, a personal AI collaboration protocol, and a revised Phase 3+ scope decision.

**Architecture:** Three phases run in defined sequence. Phase A (tooling audit) is a hard prerequisite for resuming the build — it produces actual config changes, not just observations. Phase B (decision archaeology) runs across 2-3 sessions alongside the resumed build. Phase C (scope review) is the first planning session of the resumed build.

**Tech Stack:** Claude Code CLI, Bash, Markdown, JSON (settings editing)

---

## File Map

| File | Phase | Action |
|------|-------|--------|
| `docs/review/tooling-decision.md` | A | Create — structured audit log |
| `docs/review/ai-collaboration-protocol.md` | B | Create — personal behavioral protocol |
| `docs/authority/ROADMAP.md` | C | Amend in-place — add phase dispositions |
| `~/.claude/settings.json` | A | Amend — remove unused plugins |
| `.claude/settings.local.json` | A | Amend — clean up accumulated permissions |

---

## Phase A — Tooling Audit

**Run this phase before touching any build work.**

---

### Task A1: Audit registered MCP servers

**Files:**
- Read: system prompt (MCPs listed in session context)
- Create: `docs/review/tooling-decision.md`

- [ ] **Step 1: Create the audit output file**

Create `docs/review/tooling-decision.md` with this template:

```markdown
# Tooling Audit Decisions
**Date**: 2026-05-02
**Question per item**: Do I know what this does? Is it making me a better director of AI? Would I include it if starting fresh?

---

## MCP Servers

| MCP | Decision | Rationale |
|-----|----------|-----------|
| claude.ai Audible | | |
| claude.ai Context7 | | |
| claude.ai Gmail | | |
| claude.ai Google Calendar | | |
| claude.ai Google Drive | | |
| claude.ai Mermaid Chart | | |
| claude.ai Microsoft Learn | | |
| claude.ai Spotify | | |
| claude.ai Vercel | | |
| plugin:context7 | | |
| plugin:playwright | | |
| plugin:supabase | | |
| plugin:vercel | | |
| cleo (mcp.json) | | |

## Plugins / Skills

| Plugin | Decision | Rationale |
|--------|----------|-----------|
| github | | |
| playwright | | |
| code-simplifier | | |
| typescript-lsp | | |
| frontend-design | | |
| context7 | | |
| code-review | | |
| superpowers | | |
| security-guidance | | |
| commit-commands | | |
| supabase | | |
| claude-md-management | | |
| hookify | | |
| feature-dev | | |
| serena | | |
| vercel | | |
| impeccable | | |

## Settings

| Setting | Current Value | Decision | Rationale |
|---------|--------------|----------|-----------|
| effortLevel | medium | | |
| statusLine | CLEO context-monitor | | |
| enableAllProjectMcpServers | true | | |
| permissions allow list | ~120+ entries, accumulated | | |

## Workflow Architecture

| Component | Decision | Rationale |
|-----------|----------|-----------|
| SpecKit (specify CLI) | | |
| CLEO subagent architecture | | |
| Superpowers skill suite | | |
| Impeccable design skill | | |
| Hookify | | |
```

- [ ] **Step 2: Answer the three questions for each MCP**

Work through each MCP row. The pre-populated analysis below is a starting point — override any assessment you disagree with.

**Starter analysis (review and confirm or override):**

| MCP | Suggested Decision | Suggested Rationale |
|-----|--------------------|---------------------|
| claude.ai Audible | Remove | Audiobook recommendations. No connection to development work. |
| claude.ai Context7 | Keep | Fetches live library docs. Duplicates plugin:context7 — evaluate which to keep. |
| claude.ai Gmail | Review | Useful for productivity but injects into every dev session. Consider keeping only if actively used. |
| claude.ai Google Calendar | Review | Same as Gmail — useful but not dev-specific. |
| claude.ai Google Drive | Review | Could be useful for sharing docs, but rarely needed in a coding session. |
| claude.ai Mermaid Chart | Review | Useful for architecture diagrams if you use them. Check last time you used it. |
| claude.ai Microsoft Learn | Remove | Azure/.NET documentation. Not relevant to Next.js/Supabase stack. |
| claude.ai Spotify | Remove | Music control. Not a development tool. |
| claude.ai Vercel | Keep | Direct Vercel platform access — deployment logs, project status. Relevant. |
| plugin:context7 | Keep | Fetches live library docs. Decide: keep this OR claude.ai Context7, not both. |
| plugin:playwright | Keep | Browser automation for E2E testing and UI verification. Active use. |
| plugin:supabase | Keep | Direct Supabase access — migrations, logs. Active use. |
| plugin:vercel | Keep | Vercel tools. Decide: keep this OR claude.ai Vercel, not both. |
| cleo (mcp.json) | Review | CLEO task system. Assess whether CLEO is adding value or over-engineering solo workflow. |

Fill in your actual decisions and rationale in `tooling-decision.md`.

- [ ] **Step 3: Answer the three questions for each plugin**

**Starter analysis:**

| Plugin | Suggested Decision | Suggested Rationale |
|--------|--------------------|---------------------|
| github | Keep | GitHub CLI integration. Useful for PRs, issues. |
| playwright | Keep | Browser automation. Active use for E2E testing. |
| code-simplifier | Review | Auto-simplifies code after edits. Ask: does this help or interrupt your flow? |
| typescript-lsp | Keep | TypeScript language server — type checking in-session. Useful. |
| frontend-design | Review | Frontend design guidance. Assess: do you actively invoke frontend-design skill? |
| context7 | Keep | Core docs-fetching capability. One of the most useful plugins. |
| code-review | Keep | Code review skill. Use deliberately at phase boundaries. |
| superpowers | Keep | Core workflow skills (brainstorming, plans, execution). Active use. |
| security-guidance | Keep | Security skill. Will be needed for Phase 3b. |
| commit-commands | Keep | Commit workflow. Active use. |
| supabase | Keep | Supabase skill. Active use. |
| claude-md-management | Review | CLAUDE.md editing. Used occasionally — assess if the skill adds enough value. |
| hookify | Review | Hook creation. Used occasionally. Ask: have you deliberately designed any hooks, or just accumulated them? |
| feature-dev | Review | Feature development skill suite. Assess how often you use these specific skills vs superpowers. |
| serena | Review | LSP-based code navigation (find references, go-to-definition). New capability — have you used it? |
| vercel | Keep | Vercel deployment skill. Active use for this project. |
| impeccable | Keep | UI/design polish skill. Active use throughout Phase 2. |

- [ ] **Step 4: Assess the workflow architecture**

Answer each question in writing in your audit doc:

**SpecKit**: When you ran `/speckit.specify`, `/speckit.plan`, etc. — did you feel like the process helped you think through the problem, or did it generate documents that you then accepted? Did you read and engage with the research and spec before approving, or did you treat them as boilerplate to get past?

**CLEO**: The CLEO subagent architecture (Tier 0 orchestrator / Tier 1 executor) is a complex multi-agent system. For a solo developer building a single project: does having this architecture make you direct AI better, or does it add a layer of ceremony that distances you from the actual decisions? Would a simpler "brainstorm → plan → execute" workflow (superpowers only) serve you as well?

**Impeccable**: You used this actively throughout Phase 2. Did you direct the design decisions that impeccable then refined, or did impeccable propose and you approve?

**Hookify**: Look at what hooks are currently configured. For each hook: do you know what it does? Did you deliberately design it, or did you accept a suggestion?

---

### Task A2: Clean up accumulated permissions

**Files:**
- Modify: `/mnt/c/Users/kenho/Projects/coaching-animator/.claude/settings.local.json`

The current `allow` list has ~120+ entries, many of which are one-off commands from past sessions (specific migration commands, Windows paths that no longer apply, exploratory commands that shouldn't be permanently allowed).

- [ ] **Step 1: Identify categories in the current list**

The current permissions fall into these categories:

| Category | Examples | Recommendation |
|----------|----------|----------------|
| Core dev commands | `npm run lint`, `npx tsc --noEmit`, `git add`, `git commit` | Keep |
| Test commands | `npm test`, `npm run e2e`, `npx playwright test` | Keep |
| Git operations | `git push`, `git checkout`, `git merge`, `git log` | Keep |
| Speckit scripts | `.specify/scripts/bash/*.sh` | Keep |
| MCP permissions | `mcp__plugin_playwright_*`, `mcp__claude_ai_Vercel__*` | Keep active ones |
| Skill invocations | `Skill(commit-commands:commit)` | Keep |
| One-off past commands | `timeout /t 3`, `del /F nul`, Windows-specific paths | Remove |
| Stale cleo/ct commands | `ct session start`, `export CLEO_SESSION=session_20260214*` | Remove or review |
| Stale Supabase repair commands | Specific `migration repair --status` commands | Remove |
| Old path references | `cd "C:\\\\Coding Projects\\\\coaching-animator"` (old path) | Remove |

- [ ] **Step 2: Write the replacement permissions list**

Replace the accumulated list with a curated minimal set. Use `/update-config` skill or edit the file directly. The goal: every remaining permission is something you'd consciously add if starting fresh.

Suggested minimal set to discuss with AI before implementing:

```json
"permissions": {
  "allow": [
    "Bash(npm run lint*)",
    "Bash(npm run lint:fix*)",
    "Bash(npx tsc --noEmit*)",
    "Bash(npm test*)",
    "Bash(npm run e2e*)",
    "Bash(npm run dev*)",
    "Bash(npm run build*)",
    "Bash(npm install*)",
    "Bash(npx playwright*)",
    "Bash(git add*)",
    "Bash(git commit*)",
    "Bash(git push*)",
    "Bash(git pull*)",
    "Bash(git checkout*)",
    "Bash(git branch*)",
    "Bash(git merge*)",
    "Bash(git stash*)",
    "Bash(git worktree*)",
    "Bash(git log*)",
    "Bash(git diff*)",
    "Bash(git fetch*)",
    "Bash(git mv*)",
    "Bash(git rm*)",
    "Bash(git config*)",
    "Bash(gh*)",
    "Bash(grep*)",
    "Bash(find*)",
    "Bash(ls*)",
    "Bash(python3*)",
    "Bash(node*)",
    "Bash(cleo*)",
    "Bash(.specify/scripts/bash/*.sh*)",
    "Skill(commit-commands:commit)",
    "Skill(commit-commands:commit-push-pr)",
    "Skill(claude-md-management:revise-claude-md)",
    "Skill(update-config)",
    "mcp__plugin_playwright_playwright__browser_navigate",
    "mcp__plugin_playwright_playwright__browser_take_screenshot",
    "mcp__plugin_playwright_playwright__browser_snapshot",
    "mcp__plugin_playwright_playwright__browser_click",
    "mcp__plugin_playwright_playwright__browser_resize",
    "mcp__plugin_playwright_playwright__browser_wait_for",
    "mcp__plugin_playwright_playwright__browser_evaluate",
    "mcp__claude_ai_Vercel__get_project",
    "mcp__claude_ai_Vercel__list_teams",
    "mcp__claude_ai_Vercel__list_projects",
    "mcp__claude_ai_Vercel__list_deployments",
    "mcp__claude_ai_Vercel__get_deployment"
  ]
}
```

Review this list before applying. Add back anything you know you use that's missing. Remove anything you don't recognise.

- [ ] **Step 3: Verify the changes don't break basic workflow**

```bash
cd /mnt/c/Users/kenho/Projects/coaching-animator
npm run lint
npx tsc --noEmit
```

Expected: both pass without permission prompts.

- [ ] **Step 4: Record the decision in tooling-decision.md**

Add a section to `tooling-decision.md`:

```markdown
## Permissions Cleanup

**Before**: ~120 accumulated entries across many sessions
**After**: [count] curated entries

**Removed categories**: [list what you removed]
**Rationale**: Accumulated permissions create invisible context injection. Every permanently allowed command is one fewer decision point where you engage judgment.
```

---

### Task A3: Remove or disable unused plugins and MCPs

Based on your decisions in Task A1:

- [ ] **Step 1: Remove plugins marked "Remove" from global settings**

Edit `~/.claude/settings.json`. Remove entries from `enabledPlugins` for any plugin you decided to remove. Example — if removing Audible-related and Microsoft Learn:

```bash
# Use update-config skill or edit directly
# Remove entries from enabledPlugins object
```

Use `/update-config` skill to make changes safely.

- [ ] **Step 2: Verify remaining skills load correctly**

Start a new Claude Code session and check that:
- Skills you kept still appear in the available skills list
- No errors on session start from removed plugins

- [ ] **Step 3: Record final tooling state**

Add to `tooling-decision.md`:

```markdown
## Final Tooling State

### MCPs Active
[list each one and its purpose in one line]

### Plugins Active
[list each one and its purpose in one line]

### What I Removed and Why
[list removed items with rationale]

### What I'm Uncertain About (review in 2 weeks)
[list anything you kept but aren't sure about]
```

- [ ] **Step 4: Commit the tooling decisions doc**

```bash
git add docs/review/tooling-decision.md
git commit -m "docs: Phase A tooling audit decisions"
```

---

### Task A4: Verify Phase A complete

- [ ] Read `tooling-decision.md` aloud (or mentally) from top to bottom
- [ ] For every item, confirm you can answer: "I know what this does and I chose to keep/remove it because..."
- [ ] If any item still says "Review" without a decision, resolve it now
- [ ] Confirm settings changes are saved and working
- [ ] Phase A verification: you can describe your tooling setup from memory without referring to notes

---

## Phase B — Decision Archaeology

**Run across 2-3 sessions. Does not block resuming the build.**

---

### Task B1: Extract decisions from HANDOFF diary

**Files:**
- Read: `docs/plans/HANDOFF.md`
- Create: `docs/review/ai-collaboration-protocol.md` (scaffold only)

- [ ] **Step 1: Create the protocol output file scaffold**

```markdown
# Personal AI Collaboration Protocol
**Date**: 2026-05-02
**Derived from**: coaching-animator Phase 0-2 retrospective

---

## My AI Dependency Signatures

*(Contexts where I consistently defer to AI instead of directing)*

1. [TBD — fill in during archaeology]
2.
3.

---

## My Genuine Directing Strengths

*(Patterns where I set direction well and AI executed)*

1. [TBD — fill in during archaeology]
2.
3.

---

## The Protocol

*(Rules in "Before asking AI to [X], I will first [Y]" format)*

Before asking AI to propose an architecture or design, I will first:
→ [TBD]

Before asking AI to generate a spec or plan, I will first:
→ [TBD]

Before accepting AI's proposed implementation approach, I will first:
→ [TBD]

Before asking AI to refactor or restructure code, I will first:
→ [TBD]

Before moving on from a completed phase, I will first:
→ [TBD]

---

## Decisions Log

*(Evidence from the archaeology — fill in as you read)*

| Decision | Phase/Spec | Ownership | Understanding | Note |
|----------|-----------|-----------|---------------|------|
```

- [ ] **Step 2: Read HANDOFF.md — Phase 0 and Phase 1 entries**

```bash
# Read the first ~third of the diary
head -200 /mnt/c/Users/kenho/Projects/coaching-animator/docs/plans/HANDOFF.md
```

For each session entry, identify the 1-2 most significant design decisions made. Ask for each:
- **Who originated it?** (AI-originated and accepted / AI-originated and shaped / Human-directed, AI-executed / Collaborative)
- **Do you understand why?** (Full / Partial / Thin)

Add rows to the Decisions Log.

- [ ] **Step 3: Read HANDOFF.md — Phase 2a through 2f entries**

Focus on: the canvas/pitch redesign (Spec 005), the share workflow (Spec 006), the gallery system (Spec 009). These are architectural — not cosmetic.

For each, answer: "At the moment I made this decision, was I the architect or the approver?"

Add rows to the Decisions Log.

- [ ] **Step 4: Read HANDOFF.md — Phase 2g through 2l entries**

Focus on: editor workspace remodel (Spec 012), snap-to-grid (Spec 013). These involved significant Konva/Zustand integration decisions.

Add rows to the Decisions Log.

- [ ] **Step 5: Commit the decisions log so far**

```bash
git add docs/review/ai-collaboration-protocol.md
git commit -m "docs: Phase B decision archaeology — HANDOFF diary pass"
```

---

### Task B2: Archaeology of key spec bundles

**Files:**
- Read: `specs/004-technical-debt-refactor/` (the Editor refactor — biggest architectural decision)
- Read: `specs/005-editor-canvas/`
- Read: `specs/012-editor-workspace-remodel/`

- [ ] **Step 1: Read Spec 004 (Technical Debt) research and plan**

```bash
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/004-technical-debt-refactor/research.md
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/004-technical-debt-refactor/plan.md
```

Key question: The Editor was refactored from 852→504 lines with 4 domain hooks extracted. **Did you decide what the 4 hooks should be, or did AI propose the decomposition and you approved it?** Can you explain today why those 4 hooks are the right boundaries?

Add to Decisions Log.

- [ ] **Step 2: Read Spec 005 (Editor & Canvas) research**

```bash
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/005-editor-canvas/research.md
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/005-editor-canvas/plan.md
```

Key question: The pitch SVG was rewritten and a 6-colour tactical palette was designed. **Did you specify the colour semantics (what each colour means for rugby), or did AI propose them?** Are those colours right for the coaching context?

Add to Decisions Log.

- [ ] **Step 3: Read Spec 012 (Editor Workspace) research**

```bash
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/012-editor-workspace-remodel/research.md
cat /mnt/c/Users/kenho/Projects/coaching-animator/specs/012-editor-workspace-remodel/plan.md
```

Key question: The collapsible sidebar, Focus Mode, and mobile drawer were all designed in this phase. **Did you have a clear user mental model (how coaches actually use this tool on the sideline) before asking AI to design the workspace, or did you accept the workspace AI proposed?**

Add to Decisions Log.

- [ ] **Step 4: Read 3 archived ROADMAP versions to see how thinking evolved**

```bash
ls /mnt/c/Users/kenho/Projects/coaching-animator/docs/archive/
cat /mnt/c/Users/kenho/Projects/coaching-animator/docs/archive/ROADMAP-2026-02-21.md 2>/dev/null | head -80
cat /mnt/c/Users/kenho/Projects/coaching-animator/docs/archive/ROADMAP-2026-04-19.md 2>/dev/null | head -80
cat /mnt/c/Users/kenho/Projects/coaching-animator/docs/archive/ROADMAP-2026-04-25.md 2>/dev/null | head -80
```

Key question: Compare the scope across versions. **Did the scope grow because you identified new user needs, or because AI suggested additions that sounded good?** Each expansion should trace to a deliberate decision you made.

Add to Decisions Log.

- [ ] **Step 5: Commit**

```bash
git add docs/review/ai-collaboration-protocol.md
git commit -m "docs: Phase B decision archaeology — spec bundle pass"
```

---

### Task B3: Extract patterns and write the protocol

**Files:**
- Modify: `docs/review/ai-collaboration-protocol.md`

- [ ] **Step 1: Tally the ownership column in your Decisions Log**

Count:
- How many decisions were "AI-originated, accepted"?
- How many were "AI-originated, shaped"?
- How many were "Human-directed, AI-executed"?
- How many were "Collaborative"?

The ratio is your baseline. There is no "correct" ratio — but if >50% are "AI-originated, accepted", that's your primary signal.

- [ ] **Step 2: Identify your dependency signatures**

Look at the "AI-originated, accepted" rows. What do they have in common? Common patterns for this project:

- Technical decomposition decisions (how to split a component, what to extract as a hook)
- Visual/design decisions (colour choices, layout, spacing)
- Architecture naming (what to call things)
- Scope decisions (what to include in a spec)
- Verification criteria (what "done" means for a task)

Write 3-5 dependency signatures in the protocol file. Be specific. Not "I accept too much from AI" but "When AI proposes a component decomposition, I accept it without first drawing the boundary myself."

- [ ] **Step 3: Identify your genuine directing strengths**

Look at "Human-directed, AI-executed" and "Collaborative" rows. What do they have in common? Things you tend to direct well:

- Domain knowledge (rugby coaching context, what coaches actually need)
- User constraints (mobile-first, no telemetry, specific auth rules)
- Scope discipline (refusing features that violate the constitution)
- Visual identity (the brand decisions you personally drove)

Write 3-5 genuine directing strengths.

- [ ] **Step 4: Write the protocol rules**

Fill in each "Before asking AI to [X], I will first [Y]" rule. Example completions based on what the archaeology is likely to reveal:

```markdown
Before asking AI to propose an architecture or design, I will first:
→ Sketch the key boundaries myself (even informally) and state what I already know the design must NOT do.

Before asking AI to generate a spec or plan, I will first:
→ Write one paragraph in my own words describing the problem and the constraint that makes it non-trivial. If I can't write that paragraph, I'm not ready to generate the spec.

Before accepting AI's proposed implementation approach, I will first:
→ Ask myself: "Can I explain this approach to a non-technical person?" If no, ask AI to explain the trade-offs before accepting.

Before asking AI to refactor or restructure code, I will first:
→ State the specific reason the current structure is wrong (the symptom, not just "it's messy"). AI can't make good refactoring decisions without that constraint.

Before moving on from a completed phase, I will first:
→ Write one sentence naming the most important thing I learned from this phase that I didn't know before. If I can't name it, I moved too fast.
```

Adapt these to match what you actually found in the archaeology. Delete any that don't ring true. Add rules for patterns you identified.

- [ ] **Step 5: Final commit of the protocol**

```bash
git add docs/review/ai-collaboration-protocol.md
git commit -m "docs: Phase B complete — ai-collaboration-protocol.md"
```

---

### Task B4: Verify Phase B complete

- [ ] `ai-collaboration-protocol.md` contains at least 3 dependency signatures
- [ ] `ai-collaboration-protocol.md` contains at least 3 directing strengths
- [ ] `ai-collaboration-protocol.md` contains at least 5 protocol rules in "Before X, I will Y" format
- [ ] You can state your top 2 dependency signatures from memory without reading the doc
- [ ] Phase B verification: you have a written protocol you can point to before starting any new build session

---

## Phase C — Scope Review

**This is the first planning session of the resumed build, not part of the retrospective.**

---

### Task C1: Assess Phase 3+ phases

**Files:**
- Read: `docs/authority/ROADMAP.md` (Phase 3-5+ sections)
- Modify: `docs/authority/ROADMAP.md`

- [ ] **Step 1: Read the current Phase 3+ roadmap**

```bash
grep -n "Phase 3\|Phase 4\|Phase 5\|3b\|3c\|3d\|3e\|3f" /mnt/c/Users/kenho/Projects/coaching-animator/docs/authority/ROADMAP.md | head -40
```

- [ ] **Step 2: Apply the assessment question to each open phase**

For each phase, answer: **"Does this phase exist because the product needs it, or because I planned it?"**

Work through each:

**3b — Security Hardening** (rate limiting, SQLi, CSRF, RLS audit)
- Current user count: 0 external users
- Question: Is the full Phase 3b scope appropriate pre-launch, or is a minimum viable security pass (basic rate limiting + no obvious injection vectors) sufficient to unblock the first 10 users?
- Options: Proceed as scoped / Descope to MVP security / Defer to post-first-users

**3c — E2E CI Gate**
- Question: Does CI need a full E2E gate before you have any external users, or is the current manual verification workflow sufficient until you've validated there's a user demand worth protecting?
- Options: Proceed / Defer until first external users / Descope to smoke tests only

**3d — Search & Layering**
- Question: Is search a launch requirement (users can't use the product without it) or a growth feature (nice to have once users exist)?
- Options: Proceed / Defer to Phase 4

**3e — Analytics/Audit**
- Question: The constitution prohibits telemetry and analytics. What does this phase actually cover that doesn't violate the constitution? If it's about admin-facing audit logs, that's legitimate. If it's about user behaviour tracking, it's prohibited.
- Options: Reframe as admin audit log only / Remove from roadmap

**3f — Performance**
- Question: What is the actual performance problem you're solving? If there's no known baseline complaint, this is speculative. What would trigger you to start this phase?
- Options: Proceed with Lighthouse baseline / Defer until a real performance complaint exists / Remove

**Phase 4 — Growth**
- Question: What is the trigger to start Phase 4? First 10 users? 100? A specific revenue goal? Without a trigger, "deferred" means "never."
- Define the trigger explicitly.

**Phase 5+ — Coaching Education**
- Question: Is this a pivot (changes the product's core purpose) or an extension (adds value to existing users)? If the coaching education content requires the product to work differently, that's a pivot and needs its own spec cycle.
- Options: Keep as long-term extension / Flag as potential pivot requiring new discovery / Remove

- [ ] **Step 3: Write dispositions into ROADMAP.md**

For each open phase, add a one-line annotation directly below the phase header:

```markdown
**Disposition (2026-05-02):** Proceed — minimum viable security pass (rate limiting + injection hardening only). Full RLS audit deferred until first 10 external users.
```

- [ ] **Step 4: Commit the updated roadmap**

```bash
git add docs/authority/ROADMAP.md
git commit -m "docs: Phase C scope review — Phase 3+ dispositions added"
```

---

### Task C2: Set direction for next build session

- [ ] **Step 1: Choose the next spec to implement**

Based on Phase C dispositions, identify which phase to start. Write a one-line intent statement:

```
Next build: [Phase Xb — Name] because [explicit reason tied to a disposition decision].
```

- [ ] **Step 2: Update HANDOFF.md**

Add a new handoff entry (following the existing format in that file) covering:
- What the retrospective found (2-3 bullet points)
- What changed in the tooling setup
- What the next build session will tackle and why

- [ ] **Step 3: Commit**

```bash
git add docs/plans/HANDOFF.md
git commit -m "docs: retrospective handoff — Phase A-C complete, next session defined"
```

---

### Task C3: Verify Phase C complete

- [ ] Every open phase in ROADMAP.md has a "Disposition" annotation
- [ ] Every disposition has an explicit rationale (not just "defer" but "defer because X")
- [ ] HANDOFF.md updated with retrospective summary and next session direction
- [ ] You have a clear, one-sentence statement of what you're building next and why

---

## Overall Verification

**The retrospective is complete when:**

1. You can describe your full tooling setup from memory (Phase A)
2. You can name your top 2 AI dependency signatures without reading the doc (Phase B)
3. You have a written protocol with at least 5 rules you intend to apply to your next build session (Phase B)
4. Every open roadmap phase has an explicit disposition with rationale (Phase C)
5. You know exactly what you're building next and why (Phase C)
