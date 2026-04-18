# Feature Specification: Fix Mobile Replay Scaling

**Feature Branch**: `001-fix-share-scaling`  
**Created**: 2026-04-18  
**Status**: Implementing  
**Input**: User description: "fix mobile replay scaling in ShareViewer"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

- [x] **Tier alignment**: Tier 2 (Public/Link-Shared) — share viewer is accessible without authentication
- [x] **No telemetry**: No new data collection; view count increment already exists
- [x] **No third-party analytics**: None added
- [x] **No hardcoded colors**: No colour changes in scope
- [x] **Privacy gate**: No new data stored
- [x] **Shared canvas risk**: YES — touches `ShareViewer.tsx`, `useShareCanvasSize` hook, `Canvas/Stage.tsx`, and `Canvas/EntityLayer.tsx`. Must test `/app`, `/replay/[id]`, AND `/share/[id]`.

No constitutional violations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Animation Fits Screen on First Load (Priority: P1) 🎯 MVP

When a player or fellow coach opens a shared animation link on their mobile phone, the entire rugby pitch animation is visible on-screen immediately — no pinching, no zooming, no scrolling required. The animation begins playing automatically and the playback controls are within reach.

**Why this priority**: This is the core delivery mechanism of the app. A coach builds a drill on desktop and shares it with players via link. If players cannot see the full animation on their phone, the product's primary value proposition fails entirely.

**Independent Test**: Open any valid `/share/[id]` URL on a real mobile phone or browser device emulation (e.g., iPhone 14 viewport 390×844). The full pitch should be visible without any user interaction to adjust zoom or scroll.

**Acceptance Scenarios**:

1. **Given** a valid share link, **When** a player opens it on a phone (portrait), **Then** the full pitch animation is visible within the screen bounds with no scroll or zoom needed.
2. **Given** a phone in portrait orientation, **When** the page finishes loading, **Then** the canvas occupies as much screen height as possible while keeping the full width visible and maintaining the 4:3 pitch aspect ratio.
3. **Given** the page loads, **When** the canvas first appears, **Then** there is no visible flash or jump in canvas size — it renders at the correct size from the start.
4. **Given** a phone in landscape orientation, **When** the player rotates, **Then** the canvas resizes to fill the available landscape space (wider, shorter canvas) without requiring a page reload.

---

### User Story 2 - Controls Visible and Accessible (Priority: P1)

The playback controls (play/pause, reset) are fully visible and usable on mobile without scrolling or being obscured by browser chrome (address bar, home indicator).

**Why this priority**: P1 alongside US1 — even if the pitch is visible, if the controls are hidden behind the iOS home indicator or Android navigation bar, the viewer cannot control playback.

**Independent Test**: On mobile device emulation, verify the FloatingRemote control is visible and tappable without any browser chrome overlap.

**Acceptance Scenarios**:

1. **Given** the share page is open on mobile, **When** the canvas renders, **Then** the FloatingRemote overlay is within the safe-area-aware canvas bounds and not obscured by browser chrome.
2. **Given** the FloatingRemote is positioned at the bottom of the canvas, **When** the iOS home indicator is present, **Then** the controls remain above the home indicator safe area.
3. **Given** the animation has finished playing, **When** the player taps reset, **Then** the tap registers correctly (the control was not obscured).

---

### User Story 3 - No Navigation Bar on Share Route (Priority: P2)

The share page is a clean, full-screen viewing experience. The site navigation bar visible on other pages is not present when viewing a shared animation, maximising the viewable pitch area.

**Why this priority**: P2 — the navigation bar consumes screen real estate and is not relevant to a viewer who received a share link. Its presence reduces the area available for the canvas and creates visual noise. Without it, a player at the pitch sees only the drill.

**Independent Test**: Open a `/share/[id]` URL on any device. No site navigation bar (with logo and menu links) should be visible.

**Acceptance Scenarios**:

1. **Given** a player opens a share link, **When** the page loads, **Then** no site navigation bar is rendered on screen.
2. **Given** the navigation bar is suppressed, **When** the share page renders, **Then** the canvas uses the full viewport height (not viewport minus nav height).
3. **Given** the user navigates away from the share page, **When** they visit any other route, **Then** the navigation bar is present as normal.

---

### User Story 4 - Entity Icons Scale With Canvas (Priority: P1)

When a player opens a shared animation on mobile, player tokens, cones, and balls appear correctly positioned over the rugby pitch — not clustered off-screen at their original editor-space coordinates.

**Why this priority**: P1 — the canvas sizing fix (US1) makes the pitch visible, but without entity scaling the animation contains no meaningful content. A coach sharing a drill sees players positioned correctly in the editor; the player receiving the link must see the same spatial relationships on their phone.

**Independent Test**: Open a `/share/[id]` URL containing a multi-player drill on iPhone 14 emulation (390×844). All player tokens and cones must appear overlaid on the pitch at proportionally correct positions — not clustered in one corner or off-screen.

**Acceptance Scenarios**:

1. **Given** a share link with an animation containing players and cones, **When** opened on iPhone 14 portrait (390×844), **Then** all entity icons appear at positions proportionally matching their layout on the 800×600 editor canvas.
2. **Given** the canvas is sized to a mobile viewport, **When** entities render, **Then** their positions are scaled from 800×600 editor space to actual canvas dimensions (scaleX = canvasWidth/800, scaleY = canvasHeight/600).
3. **Given** the `/app` editor route or `/replay/[id]` route, **When** they render, **Then** entity positions are unchanged — no scale transform applied (or scale defaults to 1×1).

---

### Edge Cases

- What happens on a very small viewport (e.g., SE-sized phone, 320px wide)? The canvas should scale down to fit — the pitch may be small but must be complete and unclipped.
- What happens if the animation payload has zero frames? The "No frames to display" fallback message should be centred on a black screen (existing behaviour, must not regress).
- What if the user's browser blocks dynamic import (unlikely but possible)? The loading placeholder must not create a scrollable page — it should be contained within the viewport.
- How does the page behave when the browser address bar hides/shows dynamically (iOS Safari scroll behaviour)? The canvas should resize smoothly with no visible jump.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The canvas on `/share/[id]` MUST render at the correct size for the device viewport on first paint — no oversized initial render that requires zoom adjustment.
- **FR-002**: The canvas MUST occupy the maximum available area within the viewport while preserving the 4:3 pitch aspect ratio.
- **FR-003**: The canvas MUST fill available space in both portrait and landscape orientations without requiring a page reload.
- **FR-004**: The site navigation bar MUST NOT be rendered on `/share/[id]` — the share route is a standalone viewing experience.
- **FR-005**: The FloatingRemote playback controls MUST be fully visible and interactable within device safe areas (accounting for iOS home indicator and Android navigation bar).
- **FR-006**: Canvas resizing in response to orientation change MUST be smooth — no visible flash of oversized canvas content.
- **FR-007**: The fix MUST NOT affect the `/app` (editor) or `/replay/[id]` (replay viewer) routes — those are separate canvas contexts.
- **FR-008**: Entity icons (players, cones, balls) on `/share/[id]` MUST be positioned using a scale transform that maps 800×600 editor coordinates to the actual canvas dimensions.
- **FR-009**: The entity scale transform MUST apply only to the entity rendering layer — the Field (pitch) component MUST NOT be double-scaled.

### Frontend Requirements

- **UI-001**: Share route layout must isolate itself from the root layout's navigation component.
- **UI-002**: Canvas container must use dynamic viewport units (`dvh`/`dvw`) or equivalent to handle browser chrome correctly on iOS Safari.
- **UI-003**: No horizontal or vertical scroll must be possible on the share page.
- **UI-004**: Sharp corners only (`rounded-none`); no soft drop shadows — existing style must be preserved.
- **UI-005**: The `position: fixed; inset: 0` constraint on the ShareViewer outer container must be preserved (required for correct layout when the root layout's Navigation sibling is in document flow).

### Canvas / Animation Requirements

- **CV-001**: Canvas changes must be tested on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share)
- **CV-002**: `ShareViewer` uses `position:fixed inset:0` — do not change to `h-screen`/`h-full`
- **CV-003**: Entity colors MUST use `EntityColors.resolve()` — never hardcoded hex
- **CV-004**: Entity icons MUST be rendered using a scale transform that maps editor coordinate space (800×600) to the actual canvas dimensions on the share route
- **CV-005**: The scale transform MUST apply only to the entity layer — not to the Field (pitch) component, which already fills stage bounds by design
- **CV-006**: The editor reference canvas size (800×600) MUST be extracted to a named constant — no magic numbers in the scaling code

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a phone viewport (390×844), the entire pitch is visible without pinching or scrolling — verified by Playwright device emulation screenshot showing no canvas overflow.
- **SC-002**: Canvas dimensions reported by the hook match the device viewport dimensions (adjusted for aspect ratio) within 1px, measured on first render.
- **SC-003**: No site navigation bar is present in a screenshot of `/share/[id]` on any device size.
- **SC-004**: FloatingRemote controls are within viewport safe-area bounds on iPhone 14 Pro emulation (notch + home indicator).
- **SC-005**: Orientation change from portrait to landscape (and back) produces a correctly-sized canvas within one ResizeObserver cycle, with no visible content flash.
- **SC-006**: `npm run lint && npx tsc --noEmit` passes with no new errors after implementation.
- **SC-007**: All existing unit and E2E tests pass — no regressions on `/app` or `/replay/[id]` routes.
- **SC-008**: On iPhone 14 portrait (390×844), all entity icons appear overlaid on the pitch at visually correct relative positions — confirmed by Playwright screenshot.
- **SC-009**: Animated playback shows entities moving in sync with pitch markings — no entities drifting off-screen or clustering in a corner.
