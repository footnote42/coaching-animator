# Implementation Plan: Phase 7 - User Story 5 - Configure Player Tokens

Implement player token customization, including labels, colors, and team designations.

## User Review Required

> [!IMPORTANT]
> - New UI components: `EntityProperties` (sidebar), `InlineEditor` (canvas), `EntityContextMenu`, and `ColorPicker`.
> - Context Menu: I will attempt to use shadcn-ui components. If installation fails due to Tailwind v4 conflicts, I will build a lightweight custom implementation following the Tactical Clubhouse aesthetic.

## Proposed Changes

### [Store] projectStore.ts
- [MODIFY] [projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)
    - Ensure `addEntity` uses `DESIGN_TOKENS.colors` for defaults.
    - Ensure `updateEntity` correctly handles `label`, `color`, and `team` updates.

### [Components] Sidebar
- [MODIFY] [EntityPalette.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/EntityPalette.tsx)
    - Distinguish between "Attack Player" and "Defense Player" buttons with appropriate styling if needed (though they currently exist, just need to ensure they pass correct defaults).
- [NEW] [EntityProperties.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/EntityProperties.tsx)
    - Create a sidebar section that appears when an entity is selected.
    - Fields: Label (text input), Color (grid of color buttons), Team (Attack/Defense/Neutral toggle).

### [Components] Canvas
- [MODIFY] [PlayerToken.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/PlayerToken.tsx)
    - Integrate `onDblClick` to trigger inline label editing.
    - Integrate `onContextMenu` to show the right-click menu.
- [NEW] [InlineEditor.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/InlineEditor.tsx)
    - A simple absolute-positioned input field that overlays the token during editing.

### [Components] UI (Common)
- [NEW] [EntityContextMenu.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/ui/EntityContextMenu.tsx) (or custom if shadcn fails)
    - Options: Duplicate, Delete, Edit Label.
- [NEW] [ColorPicker.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/ui/ColorPicker.tsx)
    - A grid of tactical color swatches (from `DESIGN_TOKENS.colors`).

### [App]
- [MODIFY] [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)
    - Integrate `EntityProperties` in the sidebar.
    - Implement `handleEntityDoubleClick` to show the inline editor.
    - Implement `handleEntityContextMenu` to show the menu.

---

## Verification Plan

### Automated Tests
- `npm test`: Verify existing logic remains intact.
- Create unit tests for `updateEntity` in `projectStore.test.ts` to ensure property updates persist.

### Manual Verification
1. **Team Defaults**: Add an "Attack Player" and a "Defense Player". Verify they have different default colors.
2. **Label Editing**:
    - Double-click a player token.
    - Type "10" and press Enter.
    - Verify the label "10" appears on the token.
    - Switch frames and back; verify the label persists in the original frame.
3. **Color Customization**:
    - Select a player.
    - Use the new `EntityProperties` panel to change color to a custom hex or from palette.
    - Verify the token color updates immediately.
4. **Context Menu**:
    - Right-click a player token.
    - Select "Duplicate". Verify a new player appears.
    - Select "Delete". Verify the player is removed.
5. **Entity Properties Panel**:
    - Select a ball. Verify the panel shows appropriate fields (Team might be 'neutral' and locked/hidden).
    - Select a player. Verify all fields are editable.
