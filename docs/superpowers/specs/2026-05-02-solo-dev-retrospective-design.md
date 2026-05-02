# Audit, Align, Accelerate — Solo Developer Retrospective

**Date**: 2026-05-02  
**Project**: coaching-animator  
**Type**: Practice retrospective + tooling audit + scope review  
**Status**: Design approved

---

## Context

The developer has shipped Phase 0 through Phase 2 (15 specs, 98.2% task completion, ~190 TypeScript/TSX files) in a concentrated burst of AI-assisted development. The core question this review addresses:

> **Is my current way of working — tools, habits, and decisions — something I designed, or something that accumulated?**

The specific concern is moving too fast to learn: high output velocity with AI assistance, but uncertainty about whether architectural/design judgment is developing alongside it. The goal is not coding competence (explicitly out of scope) — it is **proficiency in directing AI at the design and architecture level**.

Two outcomes are required:
1. A rationalized, intentionally designed tooling setup (operational — actual changes made)
2. A personal AI collaboration protocol (behavioral — specific rules for directing AI going forward)

A third output (Phase 3-5+ scope decision) acts as the bridge back into the build and is the first act of the resumed project, not the last act of the review.

---

## Design

### Structure: Three Phases

---

### Phase A — Tooling Audit

**Priority**: Highest. Do before resuming any build work.  
**Timebox**: 1 focused session.  
**Output**: A working, rationalized environment — not a document.

**What to audit:**
- All registered MCP servers (context7, playwright, supabase, vercel, and others visible in settings)
- All configured hooks (pre/post tool call, session start/stop)
- All installed skills/plugins (superpowers suite, speckit, hookify, vercel, impeccable, etc.)
- Claude Code settings (`.claude/settings.local.json`, global settings)
- The CLEO/SpecKit workflow architecture — is this structure helping a solo developer direct AI better, or is it over-engineering the process?

**The three questions per tool:**
1. Do I know what this does and why I have it?
2. Is it making me a better *director* of AI, or adding ceremony with no return?
3. If I were designing my setup from scratch today, would I include it?

**Diagnostic signals to look for:**
- Tools added speculatively and never consciously used
- Hooks that fire on every session without the developer knowing what they inject
- MCPs that duplicate capability (e.g., two context/docs servers)
- Skills invoked automatically (by the system) rather than deliberately (by the developer)
- Configuration accepted from AI suggestions without understanding what it does

**Output format**: `docs/review/tooling-decision.md` — keep / remove / reconfigure / add per item, with one-line rationale. Then implement the changes.

---

### Phase B — Decision Archaeology

**Priority**: High. Runs alongside early build sessions — does not block resuming work.  
**Timebox**: 2-3 focused sessions.  
**Output**: Personal AI collaboration protocol document.

**Evidence sources (in priority order):**
1. `docs/plans/HANDOFF.md` — primary diary, 32KB of session-by-session work
2. Spec bundles for key architectural decisions: specs 001, 004, 005, 012 (scaling fix, tech debt, canvas, editor workspace — highest-leverage design moments)
3. `docs/archive/` — 3 ROADMAP versions showing how thinking evolved over time
4. `docs/issues/ISSUES.md` — deferred decisions reveal design judgment as much as shipped decisions

**Classification framework:**

For each major design decision in the evidence, classify on two axes:

| Ownership | Description |
|-----------|-------------|
| AI-originated, accepted | AI proposed it; developer accepted without meaningful challenge |
| AI-originated, shaped | AI proposed; developer challenged and shaped the outcome |
| Human-directed, AI-executed | Developer set the design constraint; AI filled in detail |
| Collaborative | Back-and-forth where the outcome was genuinely better than either party's initial proposal |

| Understanding | Description |
|---------------|-------------|
| Full | Can articulate the rationale and trade-offs without prompting today |
| Partial | Knows the decision but not clearly why it was the right one |
| Thin | Accepted it; couldn't defend it if challenged |

**What to look for:**
- Repeated patterns of "AI-originated, accepted" in specific contexts — these become your dependency signatures
- Decisions with "thin" understanding that shipped anyway — these are the fast-moving-without-learning moments
- Decisions where you genuinely directed well — the model to preserve and repeat
- Moments where the spec/plan structure substituted for your thinking (did SpecKit help you think, or bypass thinking?)

**The hard question at each step:**
> "At the moment I made this decision, was I the architect or the approver?"

**Output format**: `docs/review/ai-collaboration-protocol.md` containing:
- Your 3-5 identified AI dependency signatures (specific contexts where you defer when you should direct)
- Your 3-5 genuine directing strengths (patterns to preserve)
- The personal protocol: specific rules for how you engage AI at the design level. Format: "Before asking AI to [X], I will first [Y]."

---

### Phase C — Scope Review

**Priority**: Required, but is the bridge back into the build — not part of the retrospective.  
**Timebox**: 1 session (first planning session of resumed build).  
**Output**: Revised Phase 3+ roadmap with explicit rationale.

**The assessment question per phase:**
> "Does this phase exist because the product needs it, or because I planned it?"

**Phase-by-phase lens:**

| Phase | Current Status | Question to Answer |
|-------|----------------|--------------------|
| 3b (Security Hardening) | Open — launch blocker | Is this scope right, or over-specified for current user count (zero)? |
| 3c (E2E CI gate) | Open | Is this worth the investment before first external users? |
| 3d (Search & Layering) | Open | Launch requirement or growth feature? |
| 3e (Analytics/Audit) | Open | Constitution prohibits telemetry — clarify what this phase actually covers |
| 3f (Performance) | Open | What's the actual baseline problem being solved? |
| Phase 4 (Growth) | Deferred | What's the trigger to start? |
| Phase 5+ (Coaching Education) | Tentative | Pivot or extension? |

**Output format**: Each open phase in `docs/authority/ROADMAP.md` annotated with a one-line disposition — proceed / defer / descope / reframe — with explicit rationale.

---

## Sequencing

```
NOW
│
├── Phase A: Tooling Audit (1 session)
│   └── Output: implemented tooling changes + tooling-decision.md
│
├── Phase B: Decision Archaeology (sessions 1-3 of resumed build, in parallel)
│   └── Output: ai-collaboration-protocol.md
│
└── Phase C: Scope Review (session 1 of resumed build)
    └── Output: revised ROADMAP for Phase 3+
```

Phase A is a hard prerequisite for resuming the build — no benefit in moving faster with a setup you don't understand. Phase B and C run concurrently with early build sessions.

---

## Output Artefacts

| Artefact | Phase | Location |
|----------|-------|----------|
| Tooling decision log | A | `docs/review/tooling-decision.md` |
| Personal AI protocol | B | `docs/review/ai-collaboration-protocol.md` |
| Revised roadmap | C | `docs/authority/ROADMAP.md` (amended in place) |
| This design doc | — | `docs/superpowers/specs/2026-05-02-solo-dev-retrospective-design.md` |

---

## What Success Looks Like

**After Phase A**: You can describe your tooling setup from memory — what each piece does and why it's there. The setup feels chosen, not accumulated.

**After Phase B**: You can name your 3 most common AI dependency signatures. You have a written protocol you can point to before starting any new build session.

**After Phase C**: You have a clear, reasoned decision about what to build next and why — not just "continue the roadmap."

---

## Verification

- **Phase A complete**: Every configured tool has a recorded decision, changes are implemented, and you can explain the setup without referring to notes.
- **Phase B complete**: `ai-collaboration-protocol.md` exists, contains at least 3 dependency signatures, and at least 5 behavioral rules in "Before X, I will Y" format.
- **Phase C complete**: Every open phase in ROADMAP.md has an explicit disposition with rationale.
