# Research: Direct Frame Editing

## Backend Analysis

### API Endpoint: `PUT /api/animations/[id]`
The endpoint is located at `src/app/api/animations/[id]/route.ts`.
- **Status**: Ready.
- **Capabilities**:
    - Accepts `payload` (animation frames).
    - Automatically creates a new entry in `animation_versions` if `payload` is provided.
    - Increments `current_version` (1.0 -> 1.1 etc.).
    - Validates ownership (`existing.user_id !== user.id`).
    - Recalculates `frame_count` and `duration_ms` from the payload.

### Schema Verification
`UpdateAnimationSchema` in `src/lib/schemas/animations.ts` (implied by usage in route) needs to support `payload`. 
*Verification*: Checked route logic, it uses `body.payload` and passes it to Supabase.

---

## Frontend Analysis

### Editor Loading Logic: `AnimationToolClient.tsx`
- **Path**: `src/app/app/AnimationToolClient.tsx`
- **Logic**:
    - Uses `useSearchParams` to get `load` (ID).
    - Fetches data from `/api/animations/${loadId}`.
    - Sets project ID: `id: loadId ? data.id : crypto.randomUUID()`.
    - **Opportunity**: Currently, `load` is used for "Remix" (which resets the ID if it's a progression, but surprisingly *keeps* it if it's a regular `load`).
    - **Correction**: We should differentiate between `load` (remix) and `edit` (overwrite).

### My Playbook: `AnimationCard.tsx`
- **Path**: `src/features/gallery/components/AnimationCard.tsx`
- **Actions**:
    - "Edit" (pencil) currently calls `onEdit`, which triggers `EditMetadataModal`.
    - **Proposed Change**:
        - Rename current pencil to `Settings` or `Info`.
        - Add a new `Pencil` icon for "Edit Frames".
        - Tooltip: "Edit frames in the editor".

### Save Logic: `SaveToCloudModal.tsx`
- **Path**: `src/shared/components/SaveToCloudModal.tsx`
- **Current Method**: `POST /api/animations`.
- **Proposed Change**:
    - Accept an optional `animationId` and `isUpdateMode`.
    - If `isUpdateMode`, use `PUT /api/animations/${animationId}`.
    - Provide a toggle or separate button for "Save as New Copy".

---

## Conclusion
The infrastructure is 90% ready. The primary work is in the UI wiring:
1. Entry point in My Playbook.
2. Search param handling in the Editor page.
3. Update vs Create branch in the Save modal.
