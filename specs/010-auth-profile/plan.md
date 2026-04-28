# Implementation Plan: Auth & Profile

**Branch**: `010-auth-profile` | **Date**: 2026-04-27 | **Spec**: `specs/010-auth-profile/spec.md`

## Summary

Visual redesign of `src/app/profile/page.tsx` to lead with a coach identity card (name + club prominent) rather than a settings form. All data, API, and auth infrastructure is already complete — this is a single-file layout restructure.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (client component — `'use client'`)
**State**: Local React `useState` only (no Zustand changes)
**Backend**: No changes — `/api/user/profile` (GET/PUT) is complete
**Styling**: Tailwind CSS + existing design tokens
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Performance Goals**: No new network calls; page load unchanged
**Constraints**: No telemetry; no new hardcoded colors; all palette values from existing design tokens

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Profile page requires Tier 1 (Authenticated) — existing redirect guard unchanged |
| No telemetry or analytics | ✅ | No new tracking added |
| Entity colors via EntityColors service | ✅ N/A | Profile page does not use canvas entities |
| Shared canvas — tested on all 3 routes | ✅ N/A | Zero canvas changes |
| New data: privacy impact assessed | ✅ N/A | No new data fields; no migration |
| Supabase joins flattened before use | ✅ N/A | No new queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/010-auth-profile/
├── spec.md              ✅ Complete
├── plan.md              ✅ This file
├── research.md          ✅ Complete
├── data-model.md        ✅ Complete
├── quickstart.md        ✅ Complete
└── tasks.md             (created by /speckit.tasks)
```

### Source Code — Files Changed

```text
src/
└── app/
    └── profile/
        └── page.tsx     ← Single file to edit (visual restructure only)

tests/
├── unit/
│   └── components/
│       └── ProfilePage.test.tsx    ← New unit test
└── e2e/
    └── profile.spec.ts             ← New E2E spec
```

**No new feature files.** No other directories touched.

---

## Phase 0: Research Findings

See `research.md` for full details. Key decisions:

| Decision | Outcome |
|----------|---------|
| Migration needed? | No — `display_name` and `club_name` already exist in `user_profiles` |
| `region` field? | Dropped — `club_name` sufficient; avoids migration for cosmetic change |
| API changes needed? | No — `/api/user/profile` complete |
| UserContext changes? | No — exposes all required fields |
| Navigation changes? | No — UX-005 confirmed redundant; auth state already clear |
| First-visit row creation? | DB trigger handles it — no upsert logic needed in page |
| Scope | One page file + two test files |

---

## Phase 1: Implementation Design

### Layout Restructure — `src/app/profile/page.tsx`

#### Current Order

1. `<header>` — "Profile Settings" h1
2. `<form>` block — email, display name, Club Branding (badge + name + colors), usage meter, Save
3. Connected Accounts block — Google, password
4. Quick Links block

#### Target Order (redesigned)

1. **Coach Identity Card** — avatar + name heading (Oswald) + club subtitle; no form chrome
2. **Identity Edit Form** — display name + club name inputs directly below the card
3. **Club Branding** — strip colors + badge upload (unchanged functionally)
4. **Usage Meter** — animation count bar (unchanged)
5. **Save Button** — at bottom of edit area
6. **Account Settings** — Connected Accounts + password, under "ACCOUNT SETTINGS" divider
7. **Quick Links** — retained as-is

#### Coach Identity Card

```tsx
<div className="bg-surface border border-border p-6 flex items-start gap-4">
  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center flex-shrink-0 overflow-hidden">
    {avatarUrl ? (
      <Image src={avatarUrl} alt="Profile" width={64} height={64} className="object-cover" unoptimized />
    ) : (
      <span className="font-heading font-bold text-xl text-text-inverse">{initials}</span>
    )}
  </div>
  <div>
    <h1 className="font-heading font-bold text-2xl text-text-primary">
      {displayName || <span className="text-text-primary/40 italic">Add your name</span>}
    </h1>
    <p className="text-text-primary/60 text-sm mt-0.5">
      {clubName || <span className="italic">Add your club</span>}
    </p>
  </div>
</div>
```

#### Initials Helper

```typescript
function getInitials(displayName: string | null, email: string | undefined): string {
  if (displayName) {
    const words = displayName.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    return words[0][0].toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}
```

#### Avatar URL

```typescript
const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
```

#### Account Settings Divider

```tsx
<div className="mt-8 bg-surface border border-border p-6">
  <h2 className="text-sm font-medium text-text-primary/60 uppercase tracking-widest mb-6">
    Account Settings
  </h2>
  {/* existing Connected Accounts + password — unchanged */}
</div>
```

---

## Explicit Non-Changes

- `src/lib/contexts/UserContext.tsx`
- `src/shared/components/Navigation.tsx`
- `src/app/api/user/profile/route.ts`
- `src/lib/schemas/users.ts`
- All Supabase migrations
- `src/lib/supabase/database.types.ts`
- All Canvas, Editor, Gallery, Share components

---

## Implementation Sequence

1. Add `getInitials` helper inline in `page.tsx`
2. Derive `avatarUrl` from `user?.user_metadata?.avatar_url`
3. Replace `<header>` with Coach Identity Card
4. Restructure `<main>` form: identity fields at top, Club Branding below, usage meter, Save
5. Wrap Connected Accounts + password into "Account Settings" block with divider
6. Retain Quick Links block
7. Run `npm run lint && npx tsc --noEmit`
8. Manual test against `quickstart.md` checklist
