# Research: Editor & Canvas Credibility (Phase 2a)

**Branch**: `005-editor-canvas` | **Date**: 2026-04-25

All NEEDS CLARIFICATION items resolved below. No unknowns remain.

---

## PITCH-001: SVG Pitch Markings

**Decision**: Rewrite `public/assets/fields/rugby-union.svg` from scratch preserving 2000×1400 canvas.

**Rationale**: The current SVG has four distinct problems:
1. H-posts are brackets (U-shape) rather than an H-shape.
2. 5m markers are full-height vertical lines rather than short sideline ticks.
3. Phantom extra lines at x=282, x=364, x=446, x=1554, x=1636, x=1718 add clutter.
4. 22m lines are dashed; try lines are grey — both should be solid white.

**Correct layout (all x from left, pitch runs left-right)**:

| Marking | x position | Style |
|---------|-----------|-------|
| Dead-ball (boundary) | x=50, x=1950 | Solid white 2px |
| Try lines | x=200, x=1800 | Solid white 3px |
| 22m lines | x=440, x=1560 | Solid white 2px |
| 10m lines | x=800, x=1200 | Dashed white 1px |
| Halfway | x=1000 | Solid white 2px |
| H-posts | Centred on try lines, y=650±50 | Solid white 2–3px |
| 5m gang lines | Short 20px ticks on top (y=50) and bottom (y=1350) sidelines | Solid white 1px |

**H-posts (top-down view)**:
- Two 20px vertical marks (simulating uprights viewed from above) straddling the try line at y=650 and y=750 (100px apart).
- One horizontal crossbar connecting them ON the try line — this is the H.
- Extend as short stubs perpendicular to the try line (into the in-goal area) to show depth.

**5m gang lines**: Per standard coaching diagrams, the 5m gang lines are dashed lines running parallel to the touchlines from the 5m mark to the try line along both long sides. Represented as a dashed horizontal line at y=130 (top side, 80px from y=50 boundary) and y=1270 (bottom side, 80px from y=1350 boundary), running between x=200 and x=1800 (between try lines).

**Alternatives considered**: Adding gang lines as a separate Konva overlay layer — rejected. The SVG is the canonical pitch background; coaching markers belong in the asset.

---

## PITCH-002: Canvas Sizing

**Decision**: Create `src/core/hooks/useEditorCanvasSize.ts` as a direct functional copy of `useShareCanvasSize.ts`. Wire a `containerRef` to the editor canvas wrapper div in `Editor.tsx`.

**Rationale**: The pattern is proven and tested (`useShareCanvasSize.test.ts` exists). The only meaningful difference is that the editor canvas wrapper is a flex-grow div inside the editor layout, not a full-screen fixed element. The ResizeObserver approach handles this correctly without additional SSR concerns.

**Alternatives considered**:
- Re-export `useShareCanvasSize` with a rename alias — rejected. Editor canvas context is different enough (flex layout vs `position:fixed`) to warrant a separate hook, even if the implementation is identical today.
- CSS `aspect-ratio` + `width: 100%` — rejected. Konva Stage requires explicit pixel dimensions.

---

## EDITOR-006/007: Player Labels & Pitch Legend

**Decision**: Increase label `fontSize` from 11 to 14 with `fontStyle="bold"` in `PlayerToken.tsx`. Add `PitchLegend` as a new Konva Layer.

**Rationale**: A 14px bold label is legible at arm's length on a modern mobile screen; 11px is below the recommended minimum for touch UI. The pitch legend provides team colour context without cluttering the token itself.

**Legend placement**: Bottom-left of canvas, 16px from left edge, 16px above bottom edge. Two rows: one for attack (coloured square + "Attack"), one for defence (coloured square + "Defence"). `listening={false}` — not interactive.

**Legend colours**: `EntityColors.getDefault('player', 'attack')` and `EntityColors.getDefault('player', 'defense')` — not hardcoded.

**Alternatives considered**: Tooltip on hover — rejected (doesn't work at pitchside on mobile). Sidebar legend only — rejected (not visible while looking at the canvas during a session).

---

## EDITOR-009: Tactical Colour Palette

**Decision**: Add `TACTICAL_PALETTE` constant to `design-tokens.ts`. `ColorPicker.tsx` renders this 6-colour set.

```
['#DC2626', '#2563EB', '#FFFFFF', '#EAB308', '#16A34A', '#111827']
 Red        Blue      White     Yellow     Green      Black
```

**Rationale**: These six colours map to the most common rugby kit combinations worldwide. All are visually distinct at standard screen sizes. Black (#111827) is the deep charcoal from the existing palette — visually black on a pitch-green background.

**DESIGN_TOKENS not modified**: `attack/defense/neutral` arrays remain as EntityColors service defaults. The picker is a UI concern; the service defaults are a domain concern.

**Alternatives considered**: Keeping 12 colours with clearer grouping — rejected. The spec is explicit: 6 distinct colours. Reducing to 6 removes decision paralysis.

---

## EDITOR-003: Export Settings Removal

**Decision**: Remove the entire "Export Settings" `<div>` block from `ProjectActions.tsx` and all supporting props.

**Rationale**: Export (WebM/GIF) is deprecated per PRD v2.0. The UI creates confusion about whether the feature works. JSON export ("Save Local") is already present and clearly separate. The export hooks/types (`ExportFormat`, `ExportStatus`) remain in `core/types` — they may be referenced by other code; only the UI and props are removed from `ProjectActions`.

**Alternatives considered**: Hiding with a feature flag — rejected. No flag system exists; clean removal is simpler and the feature is not planned for revival in Phase 2.

---

## EDITOR-008: Team Selector

**Decision**: Remove the Team button group from `EntityProperties.tsx`.

**Rationale**: Team assignment is already set at entity creation time via `EntityPalette` (Attack Player / Defense Player). Post-creation team reassignment is not a Phase 2a requirement. The control confuses coaches because changing it after a custom colour has been set doesn't visually update the token unless the custom colour is cleared.

**Note**: `entity.team` field and the `TeamType` in the store remain — team is still stored, just not editable post-creation in this phase.

**Alternatives considered**: Fixing the team-colour sync to make the control functional — deferred to a later phase where explicit team management is scoped.

---

## EDITOR-005: Tackle Equipment Icons

**Decision**: Redesign using Konva primitives to produce whiteboard-recognizable shapes.

**Tackle Shield** (revised): A wide rectangle (body: 28×18px) with a narrower raised grip area (12×6px rect, centered, offset upward from body). Represents the classic flat pads shape coaches draw on whiteboards. Orientation rotation applied to the Group.

**Tackle Bag** (revised): A tall narrow rectangle (10×32px) with no corner radius — representing the cylindrical post pad standing upright, as seen from above (elongated oval is close but a rect is more "whiteboard" accurate for top-down).

**Colour assignment**: Unchanged — `EntityColors.resolve()` used for both.

**Alternatives considered**: Using SVG path imports — rejected. Keeping shapes as Konva primitives maintains the consistent rendering pipeline and avoids SVG-in-canvas complexities.

---

## EDITOR-004: Entity Button Variants

**Decision**: Change "Attack Player" and "Defense Player" from `variant="default"` to `variant="outline"` in `EntityPalette.tsx`. Both retain their colour identity through the canvas token, not the button style.

**Rationale**: All entity buttons should present equally in the palette. The "default" variant makes attack/defense appear as primary action buttons, implying they are more important — which is a layout artefact, not a product decision.

**Alternatives considered**: Adding a coloured dot icon to distinguish attacker/defender buttons — deferred. Colour indicators may be added in a future polish pass but are not required for Phase 2a.

---

## EDITOR-001: Metadata Pop-Out

**Decision**: Create `MetadataSheet.tsx` using shadcn `Dialog` (available via `src/shared/ui/`). Replace the inline metadata section in `ProjectActions.tsx` with a single "Edit Details" button that opens the dialog.

**Rationale**: Moving metadata out of the sidebar declutters the primary entity controls panel. The sidebar should be focused on canvas interactions; animation-level metadata is an occasional action.

**Implementation path**: Use the existing `Dialog`/`DialogContent` from `src/shared/ui/` (shadcn components already present). The form fields and `updateProjectSettings` call move verbatim from `ProjectActions.tsx` into `MetadataSheet.tsx`.

**Alternatives considered**: Radix `Sheet` (slide-over panel) — acceptable alternative. `Dialog` chosen as it already has a clear close affordance and doesn't require layout position logic.
