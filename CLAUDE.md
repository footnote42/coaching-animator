# coaching-animator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-16

## Active Technologies

- TypeScript 5.x with React 18+ (001-rugby-animation-tool)
- Vite + Tailwind CSS + shadcn/ui
- React-Konva for canvas rendering
- Zustand for state management

## Project Structure

```text
src/
├── components/
│   ├── Canvas/         # Canvas rendering layers (Field, Stage, EntityLayer, etc.)
│   ├── Timeline/       # Playback and frame controls
│   ├── Sidebar/        # Entity palette and project actions
│   └── UI/            # shadcn/ui components
├── hooks/             # Custom React hooks (useAnimationLoop, useKeyboardShortcuts)
├── store/             # Zustand stores (projectStore, uiStore)
├── utils/             # Utilities (validation, sanitization, interpolation)
├── types/             # TypeScript type definitions
├── constants/         # Design tokens and validation constants
└── assets/            # Field SVGs and other assets
tests/
```

## Commands

- `npm run dev` - Start development server (port 5175)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Code Style

TypeScript 5.x with React 18+: Follow standard conventions

## Project Status

### Phase 3: User Story 1 - Basic Animation ✅ COMPLETE & VERIFIED

All core animation features implemented and verified (T031-T044):
- Entity management (add, update, remove)
- Frame management (add, navigate, duplicate, remove)
- Smooth animation with interpolation (60fps)
- Playback controls (play/pause/reset, speed control, loop)
- Keyboard shortcuts (Space, Delete)
- Entity selection and deselection
- Responsive UI with sidebar and timeline

### Phase 4: User Story 2 - Save/Load ⏳ PENDING
### Phase 5: User Story 3 - Export Video ⏳ PENDING

## Recent Changes

- **Verified Phase 3**: Successfully resolved rendering blockers (Tailwind v4/react-konva mismatch/Layer nesting).
- Updated `tasks.md` with verified status and retrospective.
- Updated `package.json`: Downgraded `react-konva` to v18 for compatibility.
- Updated `index.css`: Migrated to Tailwind v4 CSS-based configuration.
- Restructured Konva layers for correct Stage->Layer hierarchy.
- Development server running at http://localhost:5175

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
