# Data Model: Phase 2l — Cosmetic Polish

**Branch**: `015-cosmetic-polish` | **Date**: 2026-05-01

## Schema Changes

**None.** All requirements in this phase are UI/composition changes over existing entities.

- No new database tables or columns.
- No new Supabase migrations.
- No new RLS policies.
- `endorsed_by` column reused as-is (shipped via 009-gallery-playbook).
- Profile fields reused as-is (Phase 4 will add Club/Region).

---

## Existing Entities Referenced

### Animation (unchanged)

```ts
interface Animation {
  id: string;
  user_id: string;          // used for context-aware back button (FR-006)
  title: string;            // displayed in share-view chrome (FR-004)
  is_public: boolean;       // controls visibility in gallery
  endorsed_by: string | null; // triggers RFU badge if set (FR-015)
  // ... other fields unchanged
}
```

### Profile (unchanged)

```ts
interface Profile {
  id: string;               // = user_id
  display_name: string | null;
  avatar_url: string | null;
  // Club/Region fields deferred to Phase 4
}
```

---

## New Component Interfaces

These are TypeScript interface/prop additions for new or modified components — not database changes.

### ShareSheet (new component)

```ts
// src/features/animation/components/ShareSheet.tsx
interface ShareSheetProps {
  animationId: string;
  animationTitle: string;
  open: boolean;
  onClose: () => void;
}
// Behaviour: constructs /share/{animationId} URL, invokes Web Share API on mobile,
// falls back to clipboard copy on desktop / non-supporting browsers.
```

### ShareViewer chrome additions (FR-004, FR-005, FR-006)

```ts
// Additions to ShareViewer props or resolved from animation data:
// - animationTitle: string   → rendered top-left of chrome, font-heading, truncate
// - animationUserId: string  → compared to session user.id for back-button routing
// No new props if ShareViewer already receives the full animation object.
```

### AnimationCard parity additions (FR-008, FR-009)

```ts
// AnimationCard gains the same props/slots as PublicAnimationCard:
// - progressions?: Progression[]   → progression strip
// - thumbnailUrl?: string          → mini-pitch preview (or rendered MiniPitchSVG)
// Actions: explicit Edit / Replay / Share labelled controls (not single-click target)
```

### MiniPitchSVG colour tokens (FR-014)

```ts
// Colour values resolved from EntityColors service (confirmed from design-tokens.ts):
// field:    pitch green #1A3D1A via --color-primary
// attack:   EntityColors.getDefault('player', 'attack')  → '#2563EB' (blue, attack[0])
// defence:  EntityColors.getDefault('player', 'defense') → '#DC2626' (red, defense[0])
// cone:     EntityColors.getDefault('cone')              → '#E6EA0C' (hi-vis yellow, neutral[2])
// No new hardcoded hex permitted (FR-025, CV-003).
// NOTE: CLAUDE.md global example incorrectly shows attack → '#ef4444' (red). Ignore that comment.
```

### Page Banner (FR-011)

```ts
// New shared or inline component for page banner in /gallery and /my-gallery:
interface PageBannerProps {
  title: string;             // e.g. "Community Playbook" | "My Playbook"
  subtitle?: string;
  motif?: 'rugby-lines' | 'tactical-marks';  // decorative SVG
  backgroundTone: 'cream' | 'pitch-tint';    // subtle bg differentiation
}
// Styling: font-heading title, zero radius, amber NOT used (FR-011).
```

### Header auth indicator (FR-023)

```ts
// Navigation/Header additions:
// Guest state: <LoginButton> visible without menu open
// Auth state:  <ProfileChip initial={user.email[0]} /> or named control
// No new API calls — reads from existing UserContext / Supabase session.
```

---

## Asset Additions

| Asset | Path | Constraint |
|-------|------|------------|
| Tactical-ball SVG | `public/assets/tactical-ball.svg` | Hand-drawn marker stroke; zero rounded corners; pitch-green outline + amber markings on off-white |
| Hampshire RFU badge | `public/assets/hampshire-rfu-badge.webp` | Must be < 50 KB compressed |

---

## No New Migrations Required

Confirmed by:
- API-001: No new API routes
- API-002: `endorsed_by` reused as-is
- API-003: No profile fields added
- Clarification Q1: Club/Region deferred to Phase 4
