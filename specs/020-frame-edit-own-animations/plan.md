# Implementation Plan: Direct Frame Editing

**Branch**: `020-frame-edit-own-animations` | **Date**: 2026-05-04 | **Spec**: `specs/020-frame-edit-own-animations/spec.md`

## Summary

This feature enables coaches to re-open their own saved animations in the editor, modify frames, and overwrite the existing record. Currently, only "Remix" (saving as a new record) is possible. This implementation adds an "Edit Frames" entry point in My Playbook and updates the Editor's save logic to support `PUT` requests to the existing animation ID.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 14 App Router  
**Canvas**: Konva (react-konva)  
**State**: Zustand (`projectStore.ts`)  
**Backend**: Supabase (API route `PUT /api/animations/[id]` already supports payload updates)  
**Styling**: Tailwind CSS  
**Testing**: Vitest · Playwright  

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] | Tier 1 (Authenticated) feature. |
| No telemetry or analytics | [x] | No new tracking. |
| Entity colors via EntityColors service | [x] | No color changes. |
| Shared canvas — tested on all 3 routes | [x] | Touches Editor save logic; verify `/app`, `/replay`, `/share`. |
| New data: privacy impact assessed | [x] | No new columns; reusing existing `payload`. |
| Supabase joins flattened before use | [x] | N/A |

---

## Implementation Phases

### Phase 1: Entry Point (My Playbook)
- **Target**: `src/features/gallery/components/AnimationCard.tsx`
- **Change**: 
    - Rename current "Edit" (pencil icon) to "Edit Details" (icon: `Settings` or `Info`).
    - Add "Edit Frames" button (icon: `Pencil`).
    - Link navigates to `/app?load=${animation.id}&mode=edit`.

### Phase 2: Editor State (Loading)
- **Target**: `src/app/app/AnimationToolClient.tsx`
- **Change**:
    - Capture `mode` search parameter.
    - If `mode === 'edit'`, set a state flag `isEditMode`.
    - Ensure `projectStore.loadProject` correctly preserves the ID when loading (verified: it does if `loadId` is passed).

### Phase 3: Save Logic (Modal)
- **Target**: `src/shared/components/SaveToCloudModal.tsx`
- **Change**:
    - Add `animationId?: string` and `isEditMode?: boolean` props.
    - If `isEditMode`, replace standard "Save" button with a two-choice layout:
        1. **"Overwrite Original"**: Calls `PUT /api/animations/[id]`.
        2. **"Save as New Copy"**: Calls `POST /api/animations` (standard remix path).
    - Add a warning tooltip/alert explaining that overwriting affects live share links.

### Phase 4: API Verification
- **Target**: `src/app/api/animations/[id]/route.ts`
- **Action**: Verify `UpdateAnimationSchema` includes `payload` (verified in research: the route logic already handles it).

---

## Project Structure

### Source Code

```text
src/
├── app/
│   └── app/
│       └── AnimationToolClient.tsx   # Parse mode=edit, pass to modal
├── features/
│   └── gallery/
│       └── components/
│           └── AnimationCard.tsx     # Add "Edit Frames" button
└── shared/
    └── components/
        └── SaveToCloudModal.tsx      # Handle PUT vs POST choice
```

**Structure Decision**: No new directories or schemas required. This is a wiring task between existing components and an existing API endpoint.

---

## Complexity Tracking

*No violations.*

---

## Verification Plan

### Automated Tests
- **Unit (Vitest)**:
    - Test `SaveToCloudModal` calls `PUT` when in edit mode.
    - Test `SaveToCloudModal` calls `POST` when "Save as Copy" is selected in edit mode.
- **E2E (Playwright)**:
    - Login -> Save animation -> Go to My Playbook -> Click Edit Frames -> Move entity -> Overwrite -> Verify change in Share link.

### Manual Verification
1. Open My Playbook as Coach.
2. Click pencil icon on a card.
3. Verify editor loads at `/app?load=...&mode=edit`.
4. Modify frame.
5. Click Save.
6. Verify "Overwrite Original" option appears.
7. Click Overwrite.
8. Refresh page and verify state is preserved under same ID.
