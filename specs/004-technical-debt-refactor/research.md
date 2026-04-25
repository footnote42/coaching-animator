# Research: Phase 3a — Technical Debt Reduction

**Feature**: 004-technical-debt-refactor
**Date**: 2026-04-25
**Status**: Complete — all NEEDS CLARIFICATION resolved before planning

---

## R1 — Handler Group Decomposition

**Decision**: Extract 4 custom hooks (`useEditorEntityHandlers`, `useEditorPlaybackHandlers`, `useEditorProgressionHandlers`, `useEditorContextMenuHandlers`).

**Rationale**: Each hook maps to a clear domain with cohesive state and store dependencies. The groupings follow natural handler clusters identified in the Editor.tsx scan.

**Alternatives considered**:
- Single `useEditorHandlers` mega-hook: Rejected — would move the line-count problem from the component to a hook without improving navigability.
- File-level split (keep as component, split into multiple files via exports): Rejected — defeats the purpose; co-located state still causes re-render storms.

---

## R2 — Granular Selector Strategy

**Decision**: Individual `useProjectStore(s => s.value)` selectors per consumed state value, not `useShallow`.

**Rationale**: Individual selectors are the most precise. Each component/hook re-renders only when its exact subscribed value changes. Constitution §I already mandates this: "Components MUST subscribe to minimal required state slices."

**Alternatives considered**:
- `useShallow({ project, isDirty })`: Reduces re-renders compared to no selector, but still re-renders if any selected value changes. Less precise than individual selectors.
- Zustand `subscribeWithSelector` middleware: More powerful (supports `subscribe` outside React), but adds middleware overhead not needed here.

---

## R3 — useEffect Hook Location

**Decision**: All 4 `useEffect` hooks remain in `Editor.tsx`.

**Rationale**: Each useEffect has mixed dependencies spanning multiple extracted hooks. Moving them would require either prop-drilling from the hosting component or creating a coordination hook that negates the decomposition benefit. Line-count target (<400) is achievable without moving them.

**Effects in scope** (staying in Editor.tsx):
1. Recovery detection effect (reads localStorage, sets `showRecoveryDialog`)
2. Viewport resize effect (sets `viewportWidth`)
3. Auto-save effect (depends on `isDirty`, `cloudAnimationId`, `isAuthenticated`)
4. Progression data loading effect (depends on `cloudAnimationId`)

---

## R4 — State Ownership: showGuestLimitModal

**Decision**: `showGuestLimitModal` moves into `useEditorEntityHandlers`; the setter is passed as a parameter to `useEditorPlaybackHandlers` (which also needs to trigger it for the frame limit check).

**Rationale**: The modal is triggered by both entity creation (>10 frames) and frame addition (>10 frames). Entity handlers own the state; playback handlers receive the setter to avoid duplicated state.

---

## R5 — Files Out of Scope

The following files are explicitly NOT touched in this refactor:
- `ReplayViewer.tsx` — separate component, no shared handler logic
- `ShareViewer.tsx` — separate component, different canvas sizing concerns
- `projectStore.ts` — store internals unchanged; only how Editor.tsx subscribes changes
- All `Canvas/` components — `Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, `AnnotationLayer.tsx`
- All existing test files (must pass unmodified)
