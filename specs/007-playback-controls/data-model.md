# Data Model: Playback Controls (007)

**Branch**: `007-playback-controls` | **Date**: 2026-04-25

---

## Overview

This feature has no database schema changes. The only persistent data is a position record stored in browser `localStorage`. All playback state (current frame, is-playing, total frames) is already owned by the Zustand `projectStore`.

---

## RemotePosition (localStorage only)

**Storage key**: `editor-remote-pos`  
**Storage mechanism**: `window.localStorage`  
**Scope**: Browser client only — never sent to server

```typescript
interface RemotePosition {
  /** Distance from left edge of viewport, in pixels */
  x: number;
  /** Distance from top edge of viewport, in pixels */
  y: number;
}
```

### Validation rules

On load, the stored position is validated before use:

| Rule | Condition | Fallback |
|------|-----------|----------|
| Non-null | `value !== null` | Default position |
| Parseable JSON | `JSON.parse()` succeeds | Default position |
| In-bounds X | `0 <= x <= window.innerWidth - PILL_WIDTH` | Default position |
| In-bounds Y | `0 <= y <= window.innerHeight - PILL_HEIGHT` | Default position |

Any validation failure resets to the default position without throwing.

### Default position

```
x = window.innerWidth  - PILL_WIDTH  - 16  (bottom-right, 16px inset)
y = window.innerHeight - PILL_HEIGHT - safeAreaBottom - 16
```

### Write timing

Position is written to `localStorage` on every `pointerUp` (drag release), not on every frame. This avoids excessive writes during a drag gesture.

---

## Existing State (read-only, not modified)

The `EditorFloatingRemote` reads from `useProjectStore` but does **not** add, remove, or modify any store slices.

| Store field | Type | How used |
|-------------|------|----------|
| `currentFrameIndex` | `number` | Displayed in frame counter; passed to prev/next buttons |
| `isPlaying` | `boolean` | Controls play/pause icon |
| `project.frames.length` | `number` | Total frame count for counter and button disable logic |

| Store action | How used |
|--------------|----------|
| `play()` | Called when play button pressed (when not playing) |
| `pause()` | Called when pause button pressed (when playing) |
| `setCurrentFrame(index)` | Called by prev (-1) and next (+1) handlers |
