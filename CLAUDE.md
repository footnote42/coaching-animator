# coaching-animator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-27

## Active Technologies

- TypeScript 5.x with React 18+ (001-rugby-animation-tool)
- Vite + Tailwind CSS + shadcn/ui
- React-Konva for canvas rendering
- Zustand for state management
- **Backend (Tier 2)**: Vercel Functions + Supabase PostgreSQL (link-sharing feature)

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
### Phase 5: User Story 3 - Export Video (GIF) ⏳ IN PROGRESS (Spike complete, WhatsApp compatibility pending)
### Phase 6: User Story 10 - Share Animation Link 🔄 IN PROGRESS
- ✅ Phase 3.1: Supabase Setup & API Infrastructure (2026-01-26)
- ✅ Phase 3.2: Vercel Functions API Implementation (2026-01-27)
- ⏳ Phase 3.3: Vercel Deployment Configuration (Pending)
- ⏳ Phase 4: Frontend Integration (Pending)
- ⏳ Phase 5: Deployment & Testing (Pending)

## Recent Changes

- **Phase 3.2: Vercel Functions API Implementation Complete (2026-01-27)**: Production-ready API handlers implemented for link-sharing feature. Created SharePayloadV1 type definitions, Supabase client singleton, and validation utilities. POST /api/share creates shareable links with 100KB size limit. GET /api/share/:id retrieves animations with expiry validation. Environment-aware CORS configuration. Local testing script with 10 automated tests. All TypeScript compilation passed. See PHASE_3.2_VERIFICATION.md for full checklist.
- **Phase 3.1: Supabase Setup Complete (2026-01-26)**: Backend infrastructure established for link-sharing feature. Supabase PostgreSQL database configured with `shares` table, RLS policies, and 90-day retention. API stub handlers created. Dependencies installed: @supabase/supabase-js (v2.93.1), @vercel/node (v5.5.28). Existing offline features remain unchanged.
- **Constitution v2.0.0 Ratified (2026-01-25)**: Amended Principle V from "Offline-First Privacy" to "Privacy-First Architecture" with tiered governance (Tier 1: Sacred Offline, Tier 2: Controlled Networked). Enables link-sharing feature while preserving offline-first core.
- **Link-Sharing Architecture Approved**: Vercel Functions + Supabase PostgreSQL backend for read-only animation replay URLs (90-day retention, no authentication).
- **Verified Phase 3**: Successfully resolved rendering blockers (Tailwind v4/react-konva mismatch/Layer nesting).
- Updated `tasks.md` with verified status and retrospective.
- Updated `package.json`: Downgraded `react-konva` to v18 for compatibility.
- Updated `index.css`: Migrated to Tailwind v4 CSS-based configuration.
- Restructured Konva layers for correct Stage->Layer hierarchy.
- Development server running at http://localhost:5175

## Development Learnings

### Video Export Format Decision (24 January 2026)
**Investigation**: MP4 Export via ffmpeg.wasm
- **Outcome**: Blocked by CORS/cross-origin isolation requirements
- **Technical Findings**: SharedArrayBuffer requires COOP/COEP headers; CDNs lack CORP headers; conflicts with offline-first architecture
- **Decision**: Defer MP4 export to Phase 2; GIF export satisfies user need with no deployment complexity

**Key Lesson**: Validate user need before pursuing technically complex solutions. "Works everywhere" > "Perfect format."

### GIF Export Implementation (Phase 2)
**Library**: gif.js (client-side GIF encoding)
- **Performance**: 5-second animation: 18s total (7s capture + 11s encoding) ✅ Meets P1 requirement (<90s)
- **Memory**: Peak 634.52 MB (acceptable for desktop, may need optimization for low-memory devices)
- **File Size**: 1.30 MB for 5s; extrapolated 20s: ~5.2 MB ✅ Meets P2 requirement (<10 MB)
- **Quality**: 4/5 (readable labels, minor dithering acceptable)

### WhatsApp Web GIF Playback Issue (25 January 2026)
**Problem**: GIF displays as static image on WhatsApp Web
- **Root Cause**: Missing NETSCAPE2.0 loop extension
- **Fix**: Add `repeat: 0` to gif.js options (0 = infinite loop)
- **Status**: Investigation active; spike code demonstrates viability

**Alternative Libraries** (if gif.js incompatible):
- modern-gif (better TypeScript support)
- gifenc (low-level encoder with metadata control)
- gif-encoder-2 (better NETSCAPE extension support)

### React-Konva Rendering Patterns
- **Critical**: Stage->Layer hierarchy must be correct; Layer cannot contain Layer
- **Compatibility**: react-konva v18 required for Tailwind v4 compatibility
- **Performance**: Transient Zustand updates for animation prevent re-renders

### Tailwind v4 Migration
- **Configuration**: CSS-based configuration in `index.css` (no `tailwind.config.js`)
- **Design Tokens**: Custom properties defined in CSS for Tactical Clubhouse aesthetic
- **Compatibility**: Requires react-konva downgrade to v18

## Constitutional Compliance

**Constitution Location**: `.specify/memory/constitution.md`
**Current Version**: 2.0.0 (ratified 2026-01-16, amended 2026-01-25)

**Tiered Architecture**:
- **Tier 1 (Sacred Offline)**: Animation creation, editing, local persistence, local export - MUST remain 100% offline
- **Tier 2 (Controlled Networked)**: Link sharing - MAY use network with explicit consent, clear UI indication, graceful degradation

**Governance**: All backend features require Necessity Test, Privacy Impact Assessment, and Constitutional Amendment approval.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
