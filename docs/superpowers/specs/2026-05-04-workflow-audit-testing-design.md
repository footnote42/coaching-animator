# Workflow Audit & Testing System — Design Spec

**Date**: 2026-05-04
**Status**: Approved

## Context

The app has 22 Playwright spec files and 200+ tests covering individual features, but no process that validates the *user workflows* at the heart of the product end-to-end. `docs/authority/USER-WORKFLOWS.md` defines three canonical workflows (Core Coaching Loop, Share & Replay, Remix & Personalise) as agent-executable checklists. This system ties those checklists to the test suite, surfaces coverage gaps, and creates a self-reinforcing loop: every app improvement forces a corresponding test improvement.

## Architecture

```
USER-WORKFLOWS.md  ←──────────────────────────────────────────┐
       │                                                        │
       ▼                                                        │ feedback loop
tests/e2e/workflows/   ← new narrative workflow specs           │
       +                                                        │
tests/e2e/*.spec.ts    ← existing specs, workflow-annotated     │
       │                                                        │
       ▼                                                        │
  npm run audit:workflows   (Playwright JSON output)            │
       │                                                        │
       ▼                                                        │
  /wf-audit Claude Code skill  (reads JSON + USER-WORKFLOWS.md)   │
       │                                                        │
       ├──→ docs/audit/AUDIT-YYYY-MM-DD.md                     │
       ├──→ docs/audit/GAPS.md  ────────────────────────────────┘
       └──→ docs/issues/ISSUES.md (appended)
```

## The Three Reinforcing Loops

The audit produces three types of findings, each routed differently:

| Finding | Cause | Output | Next action |
|---------|-------|--------|-------------|
| **Failure** | Something that worked is broken | ISSUES.md bug entry | `speckit.bugfix` → fix → test passes |
| **Coverage gap** | Workflow step exists but no test covers it | GAPS.md test stub | New test written → gap closes |
| **Workflow gap** | App doesn't support a step USER-WORKFLOWS.md describes | USER-WORKFLOWS.md update + GAPS.md | `speckit.specify` (feature) or `speckit.bugfix` (regression) |

As the app gains new capabilities, USER-WORKFLOWS.md is updated to describe new steps. The next `/wf-audit` run detects those steps lack coverage and adds them to GAPS.md. Every feature improvement forces a test improvement.

## The `/wf-audit` Skill

Single entry point. Invoked with `/wf-audit` from Claude Code.

**Execution sequence:**

1. **Pre-flight** — reads `docs/authority/USER-WORKFLOWS.md` (canonical checklist); scans `tests/e2e/` for workflow annotations to build a coverage map
2. **Run** — executes `npm run audit:workflows` (Playwright targeting `tests/e2e/workflows/` + annotated existing tests), captures JSON output
3. **Classify** — for each result and each uncovered workflow step, classifies as: failure / coverage gap / workflow gap
4. **Generate artifacts**:
   - Writes `docs/audit/AUDIT-YYYY-MM-DD.md` — full run record
   - Replaces `docs/audit/GAPS.md` — current coverage state (not appended)
   - Appends new bugs to `docs/issues/ISSUES.md` — structured entries, no duplicates
5. **Summary** — prints X passed, Y failed, Z coverage gaps, N workflow gaps with links to artifacts

**What Claude reasoning adds over a plain script:**

- Reads test *intent* from names and descriptions, not just annotation labels — avoids false gap reports
- Drafts meaningful issue descriptions with workflow context and suggested investigation path
- Distinguishes failure cause: UI regression / auth-session issue / data dependency failure — each gets a different issue template

**Optional flags:**

- `/wf-audit --workflow WF1` — run a single workflow only
- `/wf-audit --gaps-only` — skip test execution, reanalyse coverage from last JSON output

## File Structure

### New files

```
tests/e2e/workflows/
  wf1-core-coaching-loop.spec.ts
  wf2-share-and-replay.spec.ts
  wf3-remix-and-personalise.spec.ts
  helpers.ts                           ← extends tests/e2e/helpers.ts

scripts/
  audit-report.mjs                     ← parses Playwright JSON, feeds Claude classification

.claude/skills/
  wf-audit.md                          ← the /wf-audit Claude Code skill

docs/audit/
  AUDIT-YYYY-MM-DD.md                 ← generated per run
  GAPS.md                              ← current coverage gap state (committed)
```

### Modified files

```
tests/e2e/*.spec.ts       ← annotation pass: {type:'workflow', description:'WF1:stepN'}
package.json              ← add audit:workflows script
playwright.config.ts      ← add workflow project config if needed
docs/authority/USER-WORKFLOWS.md   ← living document, updated as app evolves
docs/issues/ISSUES.md    ← appended by /wf-audit on failures
```

### Commit strategy

`docs/audit/GAPS.md` is committed — living record of coverage state. Individual `AUDIT-YYYY-MM-DD.md` run logs are gitignored by default (can be opted in to track history).

## Workflow Spec Design

Each of the three workflow spec files follows this pattern:

```typescript
// wf1-core-coaching-loop.spec.ts
test.describe('WF1: Core Coaching Loop', () => {
  test.describe.configure({ mode: 'serial' }); // steps are sequential

  test('WF1-S1: User signs in', async ({ page }) => {
    // annotated: {type: 'workflow', description: 'WF1:step1'}
  });

  test('WF1-S2: User creates a new animation', async ({ page }) => { ... });
  test('WF1-S3: User adds players and animates', async ({ page }) => { ... });
  test('WF1-S4: User saves to cloud', async ({ page }) => { ... });
  test('WF1-S5: User edits frames from My Playbook', async ({ page }) => { ... });
  test('WF1-S6: User edits metadata', async ({ page }) => { ... });
  test('WF1-S7: User shares the animation', async ({ page }) => { ... });
  test('WF1-S8: Recipient replays without account', async ({ page }) => { ... });
});
```

Steps map 1:1 to checklist items in USER-WORKFLOWS.md. Serial mode ensures narrative ordering — a broken step doesn't silently skip downstream steps.

## Annotation Convention for Existing Tests

```typescript
test('existing test name', async ({ page }) => {
  test.info().annotations.push({ type: 'workflow', description: 'WF1:step4' });
  // existing test body unchanged
});
```

A step can be covered by multiple tests. A test can cover multiple steps. The coverage map is many-to-many.

## Artifact Formats

### AUDIT-YYYY-MM-DD.md

```markdown
# Workflow Audit — 2026-05-04

## Summary
- WF1 Core Coaching Loop: 7/8 steps passed
- WF2 Share & Replay: 4/4 steps passed
- WF3 Remix & Personalise: 3/5 steps passed

## Failures
### WF1-S5: Edit frames from My Playbook
- Test: frame-editing.spec.ts > User can open own animation for editing
- Error: Expected URL to match /\/app\?load=.*&mode=edit/ — got /app
- Classification: UI regression
```

### GAPS.md

```markdown
# Test Coverage Gaps — current as of 2026-05-04

## WF3: Remix & Personalise
- WF3-S4: User saves remix to personal playbook — NO TEST
- WF3-S5: Remixed animation appears in My Playbook — NO TEST

## Suggested test stubs
- [ ] tests/e2e/workflows/wf3-remix-and-personalise.spec.ts > WF3-S4
- [ ] tests/e2e/workflows/wf3-remix-and-personalise.spec.ts > WF3-S5
```

### ISSUES.md entry format

```markdown
## [BUG] WF1-S5: Edit frames navigation broken
**Detected**: 2026-05-04 audit run
**Workflow**: WF1 Core Coaching Loop, Step 5
**Symptom**: Edit Frames button does not redirect to /app?load=[id]&mode=edit
**Classification**: UI regression
**Suggested investigation**: AnimationCard editFrames handler, frame-editing.spec.ts
**Status**: Open
```

## Verification

To verify the system end-to-end after implementation:

1. Run `/wf-audit` — confirm Playwright executes, all three artifacts are generated
2. Deliberately break one test — re-run `/wf-audit`, confirm failure appears in AUDIT log and ISSUES.md
3. Remove a workflow annotation from one test — re-run `/wf-audit --gaps-only`, confirm gap appears in GAPS.md
4. Add a new step to USER-WORKFLOWS.md — run `/wf-audit`, confirm it appears as a workflow gap in GAPS.md
5. Fix the broken test — run `/wf-audit`, confirm ISSUES.md entry is not duplicated
