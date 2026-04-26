# Remediation: Gallery & My Playbook (Phase 2f)

## Identified Issues

### 1. Mini-Pitch Previews (US2) — Missing Dots
- **Symptom**: Animation cards show the pitch outline (green border + halfway line) but no player dots.
- **Root Cause**: Coordinate mismatch. The extraction logic in `api/animations/route.ts` saves raw canvas coordinates (0–800), but `MiniPitchSVG.tsx` uses a `100x75` viewBox. Dots are being rendered far outside the visible SVG area.
- **Evidence**:
  ![MiniPitch Missing Dots](file:///c:/Users/kenho/Projects/coaching-animator/specs/009-gallery-playbook/evidence/us2_missing_dots.png)

### 2. Progression Strip (US4) — Empty State
- **Symptom**: Cards for animations with progressions show the "PROGRESSIONS" label but the strip is empty.
- **Root Cause**: Over-restrictive API filtering. `api/gallery/[id]/progressions/route.ts` hardcodes `.eq('visibility', 'public')`. Many progressions (including those in the user's test data) are set to `private` or `link_shared`.
- **Evidence**:
  ![Empty Progression Strip](file:///c:/Users/kenho/Projects/coaching-animator/specs/009-gallery-playbook/evidence/us4_empty_strip.png)

### 3. Endorsement Badge (US3) — Backlog Item
- **Status**: Verified logic via unit tests. No UI path for users to endorse content (Admin only).
- **Action**: Move to Phase 3 backlog as an Admin-only feature.

---

## Remediation Plan

### Fix US2: Coordinate Scaling
- Update `MiniPitchSVG.tsx` to automatically scale coordinates if they appear to be in raw canvas space (> 100).
- Update `api/animations/route.ts` to scale coordinates by 8 (800 -> 100) at extraction time for better efficiency.

### Fix US4: Auth-Aware Progressions
- Remove the hardcoded `.eq('visibility', 'public')` filter from the progressions API.
- Rely on Supabase RLS (Row Level Security) which already permits owners to see their private animations and guests to see public/link-shared ones.

---

## Verification Results (Post-Remediation)
- [x] US2 Dots visible and correctly positioned (Verified in browser: coordinates scaled 8x)
- [x] US4 Progressions visible in My Playbook for private animations (Verified: API auth-aware)
- [x] US4 Progressions visible in Public Gallery for public animations (Verified: RLS-driven)
