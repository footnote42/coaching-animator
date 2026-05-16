# Data Model: Notebook Tab Navigation

**Feature**: 022-notebook-tab-nav
**Date**: 2026-05-16

---

## Overview

This feature introduces one client-side data entity. No server schema changes. No Supabase migrations.

---

## Entity: Tab Visit Order

**Storage**: Browser `localStorage`
**Key**: `nav_mru_v1`
**Scope**: Per-browser (not per-user, not synced)

### Shape

```typescript
type SectionId = 'home' | 'gallery' | 'playbook' | 'create';

// Stored value: JSON-serialised array of SectionId
// Example: ["gallery", "home", "create", "playbook"]
// Index 0 = most recently visited (= section immediately behind active tab)
// Length = number of sections accessible to the current user (2–4)
```

### Invariants

- All values MUST be valid `SectionId` members — unknown IDs are filtered out on load
- No duplicates — each section appears at most once
- Length MUST NOT exceed the number of defined sections (4)
- If the stored value is missing, malformed JSON, or contains only unknown IDs: fall back to default order `['home', 'gallery', 'playbook', 'create']`

### Lifecycle

| Event | Action |
|-------|--------|
| Page load | Read from localStorage; validate; set as initial state |
| User navigates to section X | Prepend X to array; remove any prior occurrence of X; write to localStorage |
| localStorage unavailable | Silently use default order for the session; never throw |
| Section removed (e.g. sign out removes Playbook) | Filter removed sections from stored order on next load |

### Privacy Assessment

- Contains: section IDs only (strings like "gallery", "home")
- Contains no: user IDs, email addresses, device fingerprints, or behavioural data
- Transmitted to server: never
- Accessible to: current browser session only
- Retention: until user clears browser storage
- Constitutional compliance: ✅ no telemetry, no PII

---

## Tab Section Registry (static, compile-time)

Not a data entity — a compile-time constant in source code. Documented here for completeness.

```typescript
interface TabSection {
  id: SectionId;
  label: string;        // Display label in tab and mobile menu
  href: string;         // Next.js route
  cssVar: string;       // CSS custom property name for tab colour
  requiresAuth: boolean;
}
```

| id | label | href | cssVar | requiresAuth |
|----|-------|------|--------|--------------|
| `home` | Home | `/` | `--c-tab-home` | false |
| `gallery` | Gallery | `/gallery` | `--c-tab-gallery` | false |
| `playbook` | My Playbook | `/my-gallery` | `--c-tab-playbook` | true |
| `create` | Create | `/app` | `--c-tab-create` | false |

**Active section detection**: `pathname === section.href` (existing `isActive()` pattern from `Navigation.tsx`).

Exception: The `/app` route also matches sub-paths (e.g. `/app?id=...`). The current `isActive` uses strict equality — this is sufficient since the route is `/app` exactly.
