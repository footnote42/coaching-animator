---
name: audit
description: Run the workflow audit. Executes WF1/WF2/WF3 Playwright tests, builds a coverage map, classifies failures and gaps, and writes AUDIT log, GAPS report, and ISSUES entries. Supports --workflow WF1/WF2/WF3 to target one workflow, and --gaps-only to skip test execution.
---

# /audit — Workflow Audit Skill

Run the full workflow audit for coaching-animator. Tests the three canonical workflows, detects coverage gaps, and produces structured markdown artifacts.

## Flags

- `/audit` — Run all three workflows and produce all artifacts
- `/audit --workflow WF1` (or WF2/WF3) — Run a single workflow only
- `/audit --gaps-only` — Skip test execution, reanalyse coverage from last JSON output

## Execution Steps

### Step 1 — Pre-flight

Run:
```bash
curl -s http://localhost:3000/api/ping > /dev/null 2>&1 && echo "ok" || echo "down"
```

If the result is "down": stop and tell the user to start the dev server (`npm run dev`) before running the audit.

If `--gaps-only` was passed: skip Steps 2 and 3.

### Step 2 — Run tests

If no `--workflow` flag: run `npm run audit:workflows 2>&1`
If `--workflow WF1`: run `npm run audit:workflows -- --grep "WF1:" 2>&1`
If `--workflow WF2`: run `npm run audit:workflows -- --grep "WF2:" 2>&1`
If `--workflow WF3`: run `npm run audit:workflows -- --grep "WF3:" 2>&1`

Non-zero exit is normal (failed tests). Capture all output.

### Step 3 — Build coverage map

Run: `node scripts/audit-report.mjs`

This reads `test-results/results.json` and all spec annotations, outputs `test-results/coverage-map.json`.

### Step 4 — Read inputs

Read both files:
- `test-results/coverage-map.json`
- `docs/authority/USER-WORKFLOWS.md`

### Step 5 — Classify failures

For each entry in `coverageMap.failures`, classify as one of:

- **UI regression**: error message contains "Expected", "Locator", "toBeVisible", "toHaveURL", or "toHaveText"
- **Auth/session issue**: failure is in beforeEach/beforeAll, or error mentions "login", "auth", "session", or "redirect"
- **Data dependency failure**: test used `test.skip` or error mentions "No public animation"

### Step 6 — Write AUDIT log

Write `docs/audit/AUDIT-{runDate}.md` (where `{runDate}` is the `runDate` field from coverage-map.json).

Format:
```markdown
# Workflow Audit — {runDate}

## Summary

| Metric | Count |
|--------|-------|
| Total tests | N |
| Passed | N |
| Failed | N |
| Skipped | N |
| Coverage gaps | N |

## WF1: Core Coaching Loop

| Step | Description | Status |
|------|-------------|--------|
| WF1:step1 | Sign in... | PASSED / FAILED / NOT COVERED |
...

## WF2: Share & Replay

(same table format)

## WF3: Remix & Personalise

(same table format)

## Failures

(only if failures > 0)

### {test title}
- **Workflow step(s)**: WF#:step#
- **Classification**: UI regression / Auth/session issue / Data dependency failure
- **Error**: {first line of error message}
- **Spec file**: {path}

## Coverage Gaps

(only if gaps > 0)

### {stepId}: {description}
- **Workflow**: {workflowName}
- Suggest: Add test annotated with `{ type: 'workflow', description: '{stepId}' }`
```

### Step 7 — Replace GAPS.md

Overwrite `docs/audit/GAPS.md` entirely.

If no gaps: write:
```markdown
# Test Coverage Gaps

**Last updated**: {runDate}

All workflow steps are covered.
```

If gaps exist: write:
```markdown
# Test Coverage Gaps

**Last updated**: {runDate}

## {workflowName}

| Step | Description |
|------|-------------|
| {stepId} | {description} |
...

## Suggested Actions

- [ ] Write test annotated `{ type: 'workflow', description: '{stepId}' }` for each gap above
```

### Step 8 — Append to ISSUES.md

For each **UI regression** failure only (skip Auth/session and Data dependency):

1. Read `docs/issues/ISSUES.md`
2. Check if an open issue already exists with the same test title (look for the title in existing `## [BUG]` headings)
3. If not already present, append:

```markdown
## [BUG] {test title}
**Detected**: {runDate}
**Workflow**: {workflowId} {workflowName}, Step {stepNumber}
**Symptom**: {first 200 chars of error message}
**Classification**: UI regression
**Suggested investigation**: {spec file path}
**Status**: Open
```

### Step 9 — Print summary

Print to the conversation:

```
Workflow Audit — {runDate}

WF1: {N}/{total} steps passing
WF2: {N}/{total} steps passing
WF3: {N}/{total} steps passing

New bugs logged: {N}
Coverage gaps: {N}

Artifacts:
  docs/audit/AUDIT-{runDate}.md
  docs/audit/GAPS.md
  docs/issues/ISSUES.md
```
