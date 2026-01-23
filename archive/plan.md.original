# Implementation Plan: Rugby Animation Tool

**Branch**: `001-rugby-animation-tool` | **Date**: 2026-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rugby-animation-tool/spec.md`

## Summary

Build a browser-based keyframe animation tool for rugby coaches to create tactical visualizations. The tool enables drag-and-drop positioning of player tokens on sports fields, multi-frame animation with smooth interpolation, and video export for sharing. Built as a fully offline, privacy-first React application with no backend dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18+
**Primary Dependencies**:
- Vite (build tooling)
- React 18.2.0 (UI framework)
- react-konva 18.2.14 / konva 9.3.22 (canvas rendering)
- Zustand 5.x (state management)
- Tailwind CSS 4.x (styling)
- shadcn/ui (UI components)
- Lucide React (icons)
- MediaRecorder API (video export)

**Storage**: Browser LocalStorage/IndexedDB (auto-save and crash recovery)
**Testing**: Vitest + React Testing Library
**Target Platform**: Desktop browsers (Chrome 90+, Edge 90+)
**Project Type**: Web (single-page application)
**Performance Goals**: 60fps animation playback, <100ms interaction response, <3s initial load
**Constraints**: Offline-capable, no network calls, no telemetry, <25MB exported video for typical animations
**Scale/Scope**: Personal use tool, single user, max 50 frames per project

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Modular Architecture ✅
- [x] Components will be independently testable and reusable (Canvas/, Timeline/, Sidebar/ structure)
- [x] Complex logic extracted into custom hooks (useAnimationLoop, useExport, useAutoSave)
- [x] State organized into Zustand slices (projectStore, uiStore)
- [x] Utilities in dedicated modules (interpolation, validation, sanitization)
- [x] DAG module structure enforced via ESLint

### II. Rugby-Centric Design Language ✅
- [x] Default field: Rugby Union pitch with proper markings
- [x] Terminology: "phases" for animation states (per FR-CON-01)
- [x] Color semantics: Attack (blue/green), Defense (red/orange)
- [x] Sport-specific iconography (jerseys, rugby balls, pitch markers)

### III. Intuitive UX ✅
- [x] Drag-and-drop first: All entity positioning via direct manipulation
- [x] 2-click rule: All features accessible within 2 clicks from canvas
- [x] Progressive disclosure: Advanced options (speed, loop, resolution) hidden by default
- [x] <100ms feedback: Canvas updates immediately on drag
- [x] Error prevention: Coordinates clamped to bounds, minimum 1 frame enforced

### IV. Tactical Clubhouse Aesthetic ✅
- [x] Color Palette: Pitch Green (#1A3D1A) + Tactics White (#F8F9FA) (defined in index.css @theme)
- [x] Typography: Monospace for frame counts/timecodes, bold sans-serif for headings
- [x] Sharp corners (border-radius: 0), 1px schematic borders (Tailwind v4 defaults)
- [x] No drop shadows, no stock photography

### V. Offline-First Privacy ✅
- [x] No network calls required (FR-PRV-01)
- [x] LocalStorage/IndexedDB only (FR-PRV-03)
- [x] Zero telemetry (FR-PRV-02)
- [x] Standalone export files (JSON projects, WebM videos)
- [x] No authentication (FR-PRV-04)

**Gate Status**: ✅ PASSED - All Constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-rugby-animation-tool/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts - N/A for client-only app)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   ├── Stage.tsx           # Main Konva stage wrapper
│   │   ├── Field.tsx           # Background field rendering
│   │   ├── EntityLayer.tsx     # Player/ball rendering
│   │   ├── AnnotationLayer.tsx # Arrows and lines
│   │   ├── GhostLayer.tsx      # Previous frame ghosts
│   │   └── PlayerToken.tsx     # Individual player component
│   ├── Timeline/
│   │   ├── FrameStrip.tsx      # Thumbnail navigation
│   │   ├── PlaybackControls.tsx
│   │   └── FrameSettings.tsx
│   ├── Sidebar/
│   │   ├── EntityPalette.tsx   # Add players/ball
│   │   ├── SportSelector.tsx
│   │   └── ProjectActions.tsx  # Save/Load/Export
│   └── UI/                     # shadcn/ui components
│       ├── Button.tsx
│       ├── Slider.tsx
│       ├── Dialog.tsx
│       └── ...
├── hooks/
│   ├── useAnimationLoop.ts     # Core animation logic
│   ├── useExport.ts            # Video recording
│   ├── useAutoSave.ts          # Persistence
│   └── useKeyboardShortcuts.ts
├── store/
│   ├── projectStore.ts         # Main Zustand store
│   └── uiStore.ts              # UI state (modals, selection)
├── utils/
│   ├── interpolation.ts        # Lerp functions
│   ├── validation.ts           # Schema validation
│   ├── sanitization.ts         # Input cleaning
│   └── fileIO.ts               # Save/load helpers
├── types/
│   └── index.ts                # TypeScript interfaces
├── constants/
│   ├── fields.ts               # Sport field dimensions/SVGs
│   ├── validation.ts           # Validation constants
│   └── design-tokens.ts        # Color/spacing tokens
└── assets/
    └── fields/                 # Field background images/SVGs
        ├── rugby-union.svg
        ├── rugby-league.svg
        ├── soccer.svg
        └── american-football.svg

tests/
├── unit/
│   ├── interpolation.test.ts
│   ├── validation.test.ts
│   └── sanitization.test.ts
├── integration/
│   ├── projectStore.test.ts
│   └── export.test.ts
└── e2e/                        # Optional: Playwright tests
```

**Structure Decision**: Single web application structure. No backend required per Constitution V (Offline-First Privacy). All source in `src/` with co-located tests for unit testing, integration tests in `tests/`.

## Complexity Tracking

> No violations identified - design aligns with Constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
