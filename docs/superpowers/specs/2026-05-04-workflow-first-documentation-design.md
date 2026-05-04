# Workflow-First Documentation Design

**Date**: 2026-05-04
**Topic**: Workflow-first audit — canonical user workflows, Phase 2 closure, EDITOR-019

---

## Context

Phase 2 of coaching-animator was nominally complete (9/9 launch criteria met, ROADMAP v3.4). However the canonical coaching loop had never been written down or tested end-to-end. A document audit was requested to gain clarity on the standard required to close out Phase 2 and move forward.

During brainstorming, a critical gap was discovered: **users cannot edit the frames of their own saved animations**. The only path to frame-editing a saved animation is remix, which was designed for a different purpose (personalising another user's animation). This breaks the core coaching use case.

---

## Approach Selected: Workflow-First

Rather than auditing documents in isolation, define what the app *should* do (the canonical workflow), surface gaps against what it *actually* does, then update only the documents where findings apply.

Rationale: grounds all decisions in actual use. The workflow document becomes both the testing checklist and the Phase 2 closure gate. Documents that are already current (Constitution, PRD, README) are left unchanged.

---

## Key Findings

1. **All 5 authority documents are current** — Constitution v3.4.2, PRD v2.0, ROADMAP v3.4, ISSUES.md, README all internally consistent as of 2026-05-04. No full rewrites needed.

2. **Spec 011-workflow-clarity was never fully executed** — the spec folder has zero tasks. Work described in the ROADMAP as delivered under 011 was absorbed into other specs (015, 018). The spec folder is a documentation artifact.

3. **Edit = metadata only** — the Edit button in My Playbook opens `EditMetadataModal` (title, tags, coaching notes). It does NOT reopen the frame editor.

4. **Remix creates a new animation** — `?load={id}` in the editor loads frames for editing but saves as a new record. It does not overwrite the original. Remix is correctly designed for personalising another user's animation, not for iterating on your own.

5. **Frame editing of own saved animations is missing** — not a design choice, a gap. Without it, the core coaching loop (create → save → refine → add progression → share) is broken. This is a Phase 2 remainder, not Phase 3 nice-to-have.

6. **Phase 2 triage result** — applying the Workflow 1 blocker test to all 14 open Phase 2 issues, EDITOR-019 is the only true blocker. All other issues are Phase 3 non-blockers.

---

## Deliverables

| File | Action |
|---|---|
| `docs/authority/USER-WORKFLOWS.md` | New authority document |
| `docs/issues/ISSUES.md` | Add EDITOR-019, add Phase 2 triage summary, update quick reference |
| `docs/authority/ROADMAP.md` | v3.5 — Phase 2 conditionally closed, spec 020 pending |
| `docs/archive/ROADMAP-2026-05-04.md` | Archive of v3.4 |

Documents NOT changed: Constitution, PRD-v2.0, README.

---

## User Workflow Document Structure

Three workflows:

- **Workflow 1: Core Coaching Loop** — primary, must work for Phase 2 to close. Includes known gap at Step 5 (EDITOR-019).
- **Workflow 2: Share & Replay** — Phase 2 complete.
- **Workflow 3: Remix & Personalise** — Phase 2 complete. Distinct from frame-editing own animations.

Each workflow: narrative (coach-readable) + test checklist (agent-executable) + known gaps.

Appendix: session prompt to initiate `/speckit.specify` for the frame-edit feature (spec 020).

---

## Visual Companion Note

Mockups and diagrams for this document were deferred to a future session to conserve tokens. The workflow document and test checklists are text-only.

---

## Next Session Prompt

```
/speckit.specify

Feature: Direct frame editing of own saved animations

A user should be able to open any animation they own in the editor,
modify its frames, and save changes back to the original record
(overwrite, not remix). This is the missing step in the core coaching
loop (Workflow 1, Step 5 in docs/authority/USER-WORKFLOWS.md).

Context:
- Current state: EditMetadataModal handles metadata only; no frame-edit path exists
- Remix path (?load={id}) creates a new animation — does not overwrite original
- Spec 011-workflow-clarity was never fully implemented (zero tasks)
- This should likely be spec 020 or a substantive revision of spec 011

Key questions for the spec:
- Should "Open in Editor" appear in My Playbook alongside Edit/Share?
- On save from editor, should it prompt "overwrite original" vs "save as new"?
- How does this interact with shared/public animations? (Editing a shared
  animation should invalidate or update the share link — needs a decision)
- Animation quota (50 per user): overwrite does not consume quota; save-as-new does
```
