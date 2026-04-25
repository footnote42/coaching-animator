# Tasks: Editor & Canvas Credibility (Phase 2a)

**Input**: `specs/005-editor-canvas/plan.md`, `spec.md`, `research.md`
**Branch**: `005-editor-canvas`
**Tests**: Not requested in spec — no test tasks included.
**Organization**: Tasks grouped by user story (US1–US9) in priority order (P1 → P2 → P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to
- File paths included in every task description

---

## Phase 1: Setup

**Purpose**: Confirm the branch is clean before any changes.

- [x] T001 Run `npm run lint && npx tsc --noEmit` — verify zero errors on current branch before any changes

---

## Phase 2: User Story 1 — Correct Pitch Markings (Priority: P1)

**Goal**: Replace the broken SVG with a standards-correct rugby pitch background used by all three routes.

**Independent Test**: Navigate to `/app` without adding any entities. Verify try lines (solid, white), 22m lines (solid, white), 10m lines (dashed), halfway line, 5m gang lines (dashed parallel to touchlines), and H-shaped goalposts at both ends. No unexplained extra lines. Repeat at `/replay/[id]` and `/share/[id]`.

- [x] T002 [US1] Rewrite `public/assets/fields/rugby-union.svg` from scratch on the existing 2000×1400 canvas: solid white try lines at x=200/1800, solid white 22m lines at x=440/1560, dashed 10m lines at x=800/1200, solid white halfway at x=1000, H-shaped goalposts centred on each try line (two upright marks ±50px from y=700, crossbar on the try line), and 5m gang lines as dashed horizontal lines at y=130/1270 running between try lines (x=200 to x=1800). Remove all phantom lines (x=282, 364, 446, 1554, 1636, 1718). All lines white/near-white; no grey.

**Checkpoint**: Visual check on all three routes — `/app`, `/replay/[id]`, `/share/[id]`.

---

## Phase 3: User Story 2 — Responsive Canvas (Priority: P1)

**Goal**: Editor canvas fills available workspace at any window size, maintaining 4:3 aspect ratio.

**Independent Test**: Open `/app`. Resize browser from 1920px wide to 1280px wide. Canvas should fill the workspace proportionally at each size with no horizontal scrollbar and no blank gaps. `/replay/[id]` and `/share/[id]` must be unaffected.

- [x] T003 [P] [US2] Create `src/core/hooks/useEditorCanvasSize.ts` — implement ResizeObserver hook identical to `useShareCanvasSize.ts` (same interface: `containerRef: RefObject<HTMLElement>`, `aspectRatio?: number` defaulting to `4/3`, returns `{ width: number; height: number }`). SSR fallback: `{ width: 800, height: 600 }`.
- [x] T004 [US2] Wire `useEditorCanvasSize` into `src/features/animation/components/Editor.tsx`: add `containerRef` to the canvas wrapper `<div>`, replace `const canvasWidth = 800; const canvasHeight = 600` (lines ~62–63) with the hook, pass `width`/`height` from hook to the Konva `<Stage>`.

**Checkpoint**: Browser resize at `/app` resizes the canvas. `/share/[id]` layout unchanged.

---

## Phase 4: User Story 3 — Readable Player Tokens (Priority: P1)

**Goal**: Player tokens show only a number in a legible size; a canvas legend maps team colours to roles.

**Independent Test**: Add 3 attackers and 2 defenders. No token shows "Attacker" or "Defender" text. Numbers are legible at DevTools mobile emulation (390px). A legend is visible at the bottom-left of the canvas naming each team colour.

- [x] T005 [US3] Increase player label font size from 11 to 14 bold in `src/features/animation/components/Canvas/PlayerToken.tsx` (line ~238): set `fontSize={14}` and `fontStyle="bold"` on the Konva `Text` element that renders `entity.label`.
- [x] T006 [P] [US3] Create `src/features/animation/components/Canvas/PitchLegend.tsx` — a Konva `Layer` component accepting `{ width: number; height: number }` props. Render two rows at bottom-left (16px from left edge, 16px above bottom edge): attack colour square (12×12px) + "Attack" label, defence colour square + "Defence" label. Colours from `EntityColors.getDefault('player', 'attack')` and `EntityColors.getDefault('player', 'defense')`. Set `listening={false}`.
- [x] T007 [P] [US3] Add `<PitchLegend width={canvasWidth} height={canvasHeight} />` as a Konva `Layer` inside `<Stage>` in `src/features/animation/components/Editor.tsx` **(depends on T006 — PitchLegend.tsx must exist first)**.
- [x] T008 [P] [US3] Add `<PitchLegend width={canvasWidth} height={canvasHeight} />` as a Konva `Layer` inside `<Stage>` in `src/features/animation/components/ReplayViewer.tsx` **(depends on T006 — PitchLegend.tsx must exist first)**.
- [x] T009 [P] [US3] Add `<PitchLegend width={canvasWidth} height={canvasHeight} />` as a Konva `Layer` inside `<Stage>` in `src/features/animation/components/ShareViewer.tsx` **(depends on T006 — PitchLegend.tsx must exist first)**. Verify `position:fixed inset:0` layout is not disturbed.

**Checkpoint**: Legend visible on all three routes. Numbers legible on mobile emulation. No "Attacker/Defender" text on any token.

---

## Phase 5: User Story 4 — Focused Colour Palette (Priority: P2)

**Goal**: Colour picker shows exactly 6 distinct tactical colours.

**Independent Test**: Select any player entity. Open the colour picker. Count exactly 6 swatches: red, blue, white, yellow, green, black. Each visually distinct.

- [x] T010 [P] [US4] Add `TACTICAL_PALETTE` constant to `src/core/constants/design-tokens.ts`: `export const TACTICAL_PALETTE = ['#DC2626', '#2563EB', '#FFFFFF', '#EAB308', '#16A34A', '#111827'] as const`. Do NOT modify the existing `attack`, `defense`, `neutral` arrays.
- [x] T011 [US4] Update `src/shared/ui/ColorPicker.tsx` to import `TACTICAL_PALETTE` from `design-tokens.ts` and render it instead of `[...DESIGN_TOKENS.colours.attack, ...DESIGN_TOKENS.colours.defense, ...DESIGN_TOKENS.colours.neutral]`. Grid layout stays `grid-cols-6` (depends on T010).

**Checkpoint**: Colour picker shows exactly 6 swatches. Changing colour via picker updates entity on canvas.

---

## Phase 6: User Story 5 — Export Clutter Removed (Priority: P2)

**Goal**: No WebM/GIF export UI visible anywhere in the editor.

**Independent Test**: Open the editor sidebar. Scroll all sections. No "Export Settings" heading, no WebM button, no GIF button, no resolution selector. "Save Local" JSON button is still present.

- [x] T012 [P] [US5] Remove the "Export Settings" `<div>` block (lines ~316–441) from `src/features/animation/components/Sidebar/ProjectActions.tsx`. Remove the corresponding props from `ProjectActionsProps`: `onExport`, `exportStatus`, `exportProgress`, `exportError`, `canExport`, `recommendedFormat`, `formatReason`, `exportFormat`. Remove unused imports (`Video` from lucide-react; `ExportFormat`, `ExportStatus` types if no longer referenced). **Preserve the "Save Local" (downloadJson) button in the Project section — only the Export Settings section is removed.**
- [x] T013 [US5] Remove the now-unused export props from the `<ProjectActions />` call in `src/features/animation/components/Editor.tsx` to resolve TypeScript errors (depends on T012).

**Checkpoint**: `npx tsc --noEmit` passes. Sidebar shows no export-related UI.

---

## Phase 7: User Story 6 — Tackle Equipment Icons (Priority: P2)

**Goal**: Tackle shield and tackle bag icons are visually recognisable coaching-whiteboard shapes.

**Independent Test**: Add a tackle shield and a tackle bag to the canvas. Show to any rugby-aware person and ask them to name both items. "Shield/pad" and "bag/post pad" are acceptable answers. "Rectangle" or "oval" alone are not.

- [x] T014 [US6] Redesign tackle-shield shape in `src/features/animation/components/Canvas/PlayerToken.tsx`: replace current `Rect 32×16 cornerRadius=4` with a `Group` containing a body `Rect` (28×20px, no cornerRadius) and a grip `Rect` (14×6px, centered horizontally, offset to top of body). Apply `EntityColors.resolve()` colour to both rects. Apply `orientation` rotation to the `Group`.
- [x] T015 [US6] Redesign tackle-bag shape in `src/features/animation/components/Canvas/PlayerToken.tsx`: replace current `Ellipse radiusX=10 radiusY=20` with a `Rect` (10×30px, no cornerRadius, centred). Apply `EntityColors.resolve()` colour. Vertical orientation by default.

**Checkpoint**: Both icons read as their real-world equivalents. `EntityColors.resolve()` still supplies colour (no hardcoded hex).

---

## Phase 8: User Story 7 — Consistent Entity Buttons (Priority: P3)

**Goal**: All entity creation buttons in the palette use the same visual style.

**Independent Test**: Open the editor. Inspect the entity toolbar. All buttons (Attack Player, Defense Player, Ball, Cone, Tackle Shield, Tackle Bag) have the same size, border, and background. Hover states are identical across all.

- [x] T016 [P] [US7] In `src/features/animation/components/Sidebar/EntityPalette.tsx`, change `variant="default"` to `variant="outline"` on the "Attack Player" and "Defense Player" `<Button>` components. All entity buttons now use `variant="outline"`.

**Checkpoint**: Visual consistency audit: all 6 entity buttons identical in style and hover state.

---

## Phase 9: User Story 8 — Team Selector Removed (Priority: P3)

**Goal**: Entity properties panel shows no team selector control.

**Independent Test**: Add any player to the canvas. Select it. The properties panel shows Label and Colour fields — no Attack/Defense/Neutral team buttons.

- [x] T017 [P] [US8] Remove the team selector block (lines ~159–192) from `src/features/animation/components/Sidebar/EntityProperties.tsx`. This block renders the "Team" label and three `<Button>` variants for Attack, Defense, Neutral. Leave `entity.team` field and the store intact — only remove the UI.

**Checkpoint**: Selecting any entity shows no team selector. Label and Colour fields still present.

---

## Phase 10: User Story 9 — Animation Metadata Pane (Priority: P3)

**Goal**: Animation title and YouTube URL are moved to a dedicated dialog; the sidebar shows only an "Edit Details" trigger button.

**Independent Test**: Open the editor. The sidebar shows an "Edit Details" button (or equivalent). No title or YouTube URL field is directly visible in the sidebar. Clicking the button opens a dialog containing the Animation Title and YouTube URL fields. Editing the title and closing reflects the change.

- [x] T018 [P] [US9] Create `src/features/animation/components/Sidebar/MetadataSheet.tsx` — a shadcn `Dialog` (import from `src/shared/ui/`) accepting `{ open: boolean; onOpenChange: (open: boolean) => void }`. Inside `DialogContent`, render the Animation Title input and YouTube URL input, reading from and writing to `useProjectStore().settings` via `updateProjectSettings`. Move the field logic verbatim from `ProjectActions.tsx` lines ~195–234.
- [x] T019 [US9] In `src/features/animation/components/Sidebar/ProjectActions.tsx`, replace the inline metadata section (lines ~195–234) with: `const [metaOpen, setMetaOpen] = useState(false)`, an "Edit Details" `<Button>` that sets `metaOpen=true`, and `<MetadataSheet open={metaOpen} onOpenChange={setMetaOpen} />`. Import `MetadataSheet` from `./MetadataSheet` (depends on T018).

**Checkpoint**: Animation title editable via dialog. Sidebar shows only the trigger button, no inline metadata fields.

---

## Final Phase: Pre-push Gate & Cross-Route Verification

- [x] T020 [P] Manual verify `/app` route: (a) **before placing any entities**, verify pitch legend is visible at bottom-left; (b) add only attackers (no defenders) — verify legend shows both rows without error; (c) add player, cone, ball — all appear; drag works; pitch markings correct; canvas resizes on window resize; colour picker shows 6 swatches; no export panel; no team selector; entity buttons uniform; no "Attacker"/"Defender" text on any token; (d) **log out** (guest Tier 0) and verify pitch markings and legend visible without login.
- [x] T021 [P] Manual verify `/replay/[id]` route: playback plays; pitch markings correct; legend visible; no layout shift.
- [x] T022 [P] Manual verify `/share/[id]` route: `position:fixed inset:0` intact; canvas fits mobile viewport (DevTools 390px); pitch markings correct; legend visible.
- [x] T023 Run `npm test -- --run` — all unit tests pass (73/73 minimum).
- [x] T024 Run `npm run lint && npx tsc --noEmit` — zero new errors.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — run first.
- **Phases 2–10 (User Stories)**: Independent of each other; ordered by priority only. Any phase can begin after T001 passes.
- **Final Phase**: Depends on all desired stories being complete.

### Within Each User Story

- **US2**: T004 depends on T003 (hook must exist before wiring).
- **US3**: T007, T008, T009 each depend on T006 (component must exist before import). T007/T008/T009 can run in parallel with each other.
- **US4**: T011 depends on T010 (constant must exist before import).
- **US5**: T013 depends on T012 (props must be removed before callers are updated).
- **US9**: T019 depends on T018 (component must exist before import).

### Parallel Execution Examples

**Batch A** (all independent, different files — run together after T001):
```
T002 (SVG) + T003 (useEditorCanvasSize) + T010 (design-tokens) + T012 (export removal) + T016 (button variants) + T017 (team selector) + T018 (MetadataSheet)
```

**Batch B** (after Batch A completes relevant tasks):
```
T004 (wire canvas size) + T005 (PlayerToken fontSize) + T006 (PitchLegend)
+ T011 (ColorPicker) + T013 (Editor.tsx export cleanup) + T019 (wire MetadataSheet)
```

**Batch C** (after T006):
```
T007 (PitchLegend → Editor) + T008 (PitchLegend → ReplayViewer) + T009 (PitchLegend → ShareViewer)
```

**Batch D** (after Batch C — sequential within same file):
```
T014 (tackle-shield) → T015 (tackle-bag)
```

---

## Implementation Strategy

### MVP (P1 stories only — US1, US2, US3)

1. T001 — verify clean baseline
2. T002 — SVG rewrite
3. T003 → T004 — responsive canvas
4. T005 → T006 → T007/T008/T009 — labels + legend
5. T020, T021, T022 — cross-route visual check
6. T023, T024 — pre-push gate

### Incremental Delivery

Ship P1 (US1–US3) first. P2 (US4–US6) and P3 (US7–US9) are all smaller and independent — each can be shipped as a follow-up batch or alongside P1.

---

## Notes

- Entity colors: always `EntityColors.resolve()` — never hardcoded hex (CV-003).
- Shared canvas: changes to `PlayerToken.tsx`, `PitchLegend.tsx`, or `Field.tsx` affect all 3 routes — verify all three after each such change (CV-001).
- `ShareViewer`: uses `position:fixed inset:0` — never replace with `h-screen` (CV-002).
- `DESIGN_TOKENS.colours.attack/defense/neutral` are NOT modified — only `ColorPicker.tsx` changes which array it renders.
- `entity.team` field and `TeamType` in the store are NOT removed by T017 — only the UI control is removed.
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass with zero new errors (SC-008).
