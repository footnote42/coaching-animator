# Research: Rugby Animation Tool

**Feature Branch**: `001-rugby-animation-tool`
**Date**: 2026-01-16
**Status**: Complete

This document captures research findings and technology decisions for the Rugby Animation Tool implementation.

---

## 1. Canvas Rendering Library

### Decision: React-Konva

### Rationale
React-Konva provides a declarative React API on top of Konva.js (HTML5 Canvas library). This aligns with the React-based architecture and enables treating canvas elements as React components.

### Alternatives Considered

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **React-Konva** | Declarative API, React integration, good documentation, active maintenance | Learning curve for canvas concepts | ✅ Selected |
| **Fabric.js** | Rich feature set, object manipulation | jQuery-style API, not React-native | ❌ Rejected |
| **Pixi.js** | High performance, WebGL | Overkill for 2D diagrams, larger bundle | ❌ Rejected |
| **Raw Canvas API** | No dependencies | Imperative, verbose, reinvents the wheel | ❌ Rejected |
| **SVG (react-spring)** | Native DOM, easier debugging | Performance issues with many animated elements | ❌ Rejected |

### Key Konva Patterns for This Project

```typescript
// Declarative stage setup
<Stage width={width} height={height}>
  <Layer>
    <Image image={fieldBackground} />
  </Layer>
  <Layer>
    {entities.map(entity => (
      <Circle key={entity.id} {...entity} draggable onDragEnd={handleDrag} />
    ))}
  </Layer>
</Stage>

// Transient updates for animation (no React re-renders)
// Use Konva node refs for direct manipulation during playback
```

---

## 2. State Management

### Decision: Zustand with Transient Updates

### Rationale
Zustand offers minimal boilerplate, TypeScript support, and critically: transient updates that bypass React's reconciliation. This is essential for 60fps animation where updating state 60 times per second would cause render thrashing.

### Alternatives Considered

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| **Zustand** | Minimal API, transient updates, no providers | Less structured than Redux | ✅ Selected |
| **Redux Toolkit** | Industry standard, DevTools | Boilerplate, no native transient updates | ❌ Rejected |
| **Jotai** | Atomic state, minimal | Less suited for complex nested state | ❌ Rejected |
| **MobX** | Reactive, automatic tracking | Magic can be confusing, larger bundle | ❌ Rejected |

### Zustand Pattern for Animation

```typescript
// Transient update pattern - updates state without triggering re-renders
const useProjectStore = create<ProjectStore>((set, get) => ({
  // ... state

  // For animation: update internal refs without React reconciliation
  setPlaybackPosition: (position) => {
    // Direct Konva node manipulation via refs
    // Do NOT call set() during animation frames
  }
}));
```

---

## 3. Video Export Strategy

### Decision: MediaRecorder API with CanvasCaptureMediaStream

### Rationale
The MediaRecorder API is natively supported in Chrome and Edge, requires no external dependencies, and can capture canvas output as WebM video. This aligns with the offline-first, zero-backend principle.

### Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **MediaRecorder + Canvas** | Native, no deps, WebM output | Safari incompatible | ✅ Selected |
| **ffmpeg.wasm** | MP4 output, broad compatibility | Large bundle (~25MB), WASM complexity | ⚠️ Optional future |
| **Server-side rendering** | Professional quality | Requires backend, violates Constitution | ❌ Rejected |
| **GIF export** | Universal compatibility | Large files, limited colors, no audio | ❌ Rejected |

### Export Implementation Pattern

```typescript
const exportAnimation = async (canvas: HTMLCanvasElement): Promise<Blob> => {
  const stream = canvas.captureStream(60); // 60fps
  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 5000000 // 5 Mbps
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  recorder.start();
  await playAnimationToCompletion();
  recorder.stop();

  return new Blob(chunks, { type: 'video/webm' });
};
```

### Browser Support Matrix

| Browser | MediaRecorder | WebM VP9 | Status |
|---------|---------------|----------|--------|
| Chrome 90+ | ✅ | ✅ | Full support |
| Edge 90+ | ✅ | ✅ | Full support |
| Firefox 90+ | ✅ | ⚠️ VP8 only | Partial support |
| Safari | ❌ | ❌ | Not supported |

---

## 4. Animation Interpolation

### Decision: Custom Linear Interpolation (Lerp)

### Rationale
The PRD specifies linear interpolation between entity positions. A simple lerp implementation is sufficient and keeps the bundle size minimal. Advanced easing is explicitly out of scope for v1.0.

### Implementation

```typescript
// utils/interpolation.ts
export const lerp = (start: number, end: number, t: number): number => {
  return start + (end - start) * Math.max(0, Math.min(1, t));
};

export const lerpPosition = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number } => ({
  x: lerp(start.x, end.x, t),
  y: lerp(start.y, end.y, t)
});
```

### Future Consideration
If easing is later needed, consider adding a simple easing function library or implementing common curves (ease-in, ease-out, ease-in-out) without external dependencies.

---

## 5. Field Background Assets

### Decision: SVG Backgrounds with Inline Embedding

### Rationale
SVG provides crisp rendering at any resolution, small file size, and can be styled with CSS. Fields are static backgrounds, so performance is not a concern.

### Field Specifications

| Sport | Dimensions (Real) | Canvas Coordinates | Key Markings |
|-------|-------------------|-------------------|--------------|
| Rugby Union | 100m × 70m | 2000 × 1400 | 22m lines, try lines, halfway, 10m lines |
| Rugby League | 100m × 68m | 2000 × 1360 | 20m lines, try lines, halfway, goal areas |
| Soccer | 105m × 68m | 2000 × 1295 | Penalty areas, center circle, goal areas |
| American Football | 100yd × 53.3yd | 2000 × 1066 | Yard lines (every 5), end zones, hash marks |

### Asset Location
```
src/assets/fields/
├── rugby-union.svg
├── rugby-league.svg
├── soccer.svg
└── american-football.svg
```

---

## 6. UI Component Library

### Decision: shadcn/ui

### Rationale
shadcn/ui provides accessible, unstyled components that can be customized to match the Tactical Clubhouse aesthetic. Components are copied into the project (not installed as a dependency), enabling full control and zero-config customization.

### Components Needed

| Component | Usage |
|-----------|-------|
| Button | All action triggers |
| Slider | Duration control, speed control |
| Dialog | Confirmation dialogs, export progress |
| Select | Sport selector, color picker |
| Input | Label editing |
| Tooltip | Keyboard shortcut hints |

### Styling Override
shadcn/ui components will be customized to enforce Constitution IV (Tactical Clubhouse Aesthetic):
- Remove all border-radius
- Use 1px borders with `--color-border`
- Remove shadows
- Apply monospace font to numeric displays

---

## 7. Local Storage Strategy

### Decision: LocalStorage for Auto-Save with JSON Serialization

### Rationale
LocalStorage is synchronous, simple, and has 5-10MB capacity per origin—sufficient for project data. IndexedDB is more complex and unnecessary for this use case.

### Storage Schema

```typescript
// Storage keys
const STORAGE_KEYS = {
  AUTOSAVE: 'animatorapp_autosave',
  BACKUP: 'animatorapp_backup',
  SETTINGS: 'animatorapp_settings'
} as const;

// Storage format
interface StoredProject {
  version: string;
  savedAt: string; // ISO timestamp
  data: Project;
}
```

### Quota Management
- Check available quota before saving
- Rotate old backups if quota exceeded
- Warn user if storage is persistently full

---

## 8. Drag-and-Drop Implementation

### Decision: Konva Native Drag Events

### Rationale
Konva provides built-in `draggable` property and drag events. No additional library needed. This integrates cleanly with React-Konva's declarative approach.

### Implementation Pattern

```typescript
<Circle
  x={entity.x}
  y={entity.y}
  radius={20}
  fill={entity.color}
  draggable
  onDragStart={() => setDragging(true)}
  onDragMove={(e) => {
    // Optional: show position preview
  }}
  onDragEnd={(e) => {
    const newPos = e.target.position();
    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(newPos.x, CANVAS_WIDTH));
    const clampedY = Math.max(0, Math.min(newPos.y, CANVAS_HEIGHT));
    updateEntityPosition(entity.id, clampedX, clampedY);
    setDragging(false);
  }}
/>
```

---

## 9. Keyboard Shortcuts

### Decision: Native Event Listeners with useEffect

### Rationale
Keyboard shortcuts are simple (Spacebar, Delete, Ctrl+S) and don't require a library. A custom hook provides clean abstraction.

### Shortcut Map

| Key | Action | Context |
|-----|--------|---------|
| `Space` | Play/Pause | Global |
| `Delete` / `Backspace` | Remove selected entity | Entity selected |
| `Ctrl/Cmd + S` | Save project | Global |
| `Left Arrow` | Previous frame | Global |
| `Right Arrow` | Next frame | Global |
| `Escape` | Deselect all | Entity selected |

---

## 10. Build and Bundling

### Decision: Vite with Default Configuration

### Rationale
Vite provides fast HMR, TypeScript support out of the box, and optimized production builds. The default configuration is sufficient for this project size.

### Production Considerations
- Tree-shaking removes unused code
- Code splitting for lazy-loaded routes (if any)
- Asset optimization for field SVGs
- Target: ES2020 for Chrome/Edge 90+ compatibility

---

## Summary of Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Build | Vite | ^5.x |
| Framework | React | ^18.x |
| Language | TypeScript | ^5.x |
| Canvas | React-Konva | ^18.x |
| State | Zustand | ^4.x |
| Styling | Tailwind CSS | ^3.x |
| UI | shadcn/ui | Latest |
| Icons | Lucide React | ^0.400+ |
| Testing | Vitest + RTL | ^1.x |

---

## Resolved Clarifications

All technical context items from the plan have been researched and documented. No outstanding NEEDS CLARIFICATION items remain.
