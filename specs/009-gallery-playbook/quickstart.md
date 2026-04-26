# Quickstart: Manual Test Guide — Gallery & My Playbook

**Feature**: `009-gallery-playbook`  
**Date**: 2026-04-26

---

## Prerequisites

1. Dev server running: `npm run dev`
2. Supabase migration applied: `npx supabase db push` (or local `supabase start`)
3. TypeScript types regenerated after migration
4. At least one animation in the DB with `endorsed_by = 'hampshire_rfu'` (seed step below)
5. At least one parent animation with child progressions (seed step below)
6. At least one animation tagged `template` in the public gallery

---

## Seed Steps

### Seed endorsed animation
```sql
UPDATE saved_animations
SET endorsed_by = 'hampshire_rfu'
WHERE visibility = 'public'
  AND is_progression = false
LIMIT 1;
```

### Seed progression set (if none exists)
```sql
-- First, find a public base animation
SELECT id FROM saved_animations WHERE visibility = 'public' AND is_progression = false LIMIT 1;
-- Then insert 2 child progressions pointing to that id
INSERT INTO saved_animations (user_id, title, animation_type, payload, visibility, is_progression, parent_animation_id, progression_order, frame_count, duration_ms)
VALUES
  ('<user_id>', 'Lineout Progression 1', 'tactic', '{"version":"1.0","name":"","sport":"rugby","frames":[{"id":"f1","entities":{},"annotations":[]}],"settings":{}}', 'public', true, '<parent_id>', 1, 1, 1000),
  ('<user_id>', 'Lineout Progression 2', 'tactic', '{"version":"1.0","name":"","sport":"rugby","frames":[{"id":"f1","entities":{},"annotations":[]}],"settings":{}}', 'public', true, '<parent_id>', 2, 1, 1000);
```
Note: `progression_count` on the parent increments via the existing DB trigger.

---

## Test Scenarios

### T1 — Gallery: Endorsement Badge

1. Visit `/gallery`
2. **Expect**: The seeded animation shows a solid pitch-green badge in the top-right of its preview area reading "HAMPSHIRE RFU" in uppercase white
3. **Expect**: All other cards show no badge
4. Tab through cards — badge on endorsed card should have an accessible label

**Pass criteria**: Badge visible, correct text, no badge on un-endorsed cards, no card layout broken.

---

### T2 — Gallery: Mini-Pitch SVG Preview

1. Visit `/gallery`
2. **Expect**: Every card shows a simplified pitch outline (rectangle + halfway line)
3. **Expect**: Cards with player entities show coloured dots (amber for attackers, muted grey for defenders)
4. **Expect**: Cards with no entities show an empty pitch outline (not a grey box)
5. If any card has a `thumbnail_url`, that thumbnail should display instead of the SVG

**Pass criteria**: No card shows a blank grey fallback; dot colors match design tokens.

---

### T3 — Gallery: Progression Strip

1. Visit `/gallery`
2. Find the parent animation card (progression_count > 0)
3. **Expect**: A compact horizontal strip is visible immediately below the card body (no click/tap required)
4. **Expect**: Each strip item shows a numbered stamp ("1", "2") and a mini-pitch preview
5. On mobile (375px): swipe the strip — it should scroll horizontally with snap behaviour
6. Tap a progression item — it should navigate to `/share/[progression-id]`
7. Test keyboard: tab into strip, use arrow keys to move focus, Enter to activate

**Pass criteria**: Strip always visible, scrollable, navigable by keyboard and touch.

---

### T4 — Gallery: Template Filter

1. Visit `/gallery`
2. Activate "Templates Only" checkbox (or select "Templates" from dropdown if converted)
3. **Expect**: Only animations tagged `template` are shown
4. Deactivate the filter
5. **Expect**: Full gallery restored

**Pass criteria**: Filter works correctly both ways; URL reflects filter state (`?templates=true`).

---

### T5 — My Playbook: Search & Filter

1. Sign in and navigate to `/my-gallery`
2. **Expect**: A search input and type filter are visible in the controls bar
3. Type a partial title — **Expect**: cards narrow to matching titles/descriptions in real time
4. Clear search — **Expect**: full collection returns without page reload
5. Select a type from the filter — **Expect**: only that type shown
6. Combine search + type — **Expect**: both constraints apply
7. Type a query that matches nothing — **Expect**: empty state shows query text ("No drills matching '[query]'")
8. Check the URL — **Expect**: `?q=` and `?type=` params reflect current filter state

**Pass criteria**: All scenarios above pass; URL params update on every filter change; browser Back restores previous filter state.

---

### T6 — My Playbook: Empty State

1. Sign in with an account that has 0 animations (or clear all animations)
2. Navigate to `/my-gallery`
3. **Expect**: Empty state with a CTA to create first drill (not just "Nothing here")

---

### T7 — Edge Cases

| Scenario | Expected |
|----------|----------|
| `endorsed_by = 'hampshire_rfu_long_name_overflow'` | Badge clips or truncates; card layout intact |
| Animation with 25 players in first frame | Mini-pitch shows max 15 dots, no layout break |
| Animation with progression_count = 10 | Strip scrolls with snap; container width unchanged |
| Search with `<script>` in query input | Sanitised — no XSS, text shown as-is |

---

## Post-Implementation Checks

```bash
npm run lint
npx tsc --noEmit
npm test -- --run
```

All three must pass with zero new errors/warnings before the feature is considered complete.
