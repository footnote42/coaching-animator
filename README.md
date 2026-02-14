# Rugby Animation Tool

A web-based tactical animation tool for rugby coaches to create, save, and share animated play diagrams. Now with online features including cloud storage, public gallery, and community features.

## ✨ Features

### Core Animation Tools
- **Position Players**: Drag players, balls, cones, and markers onto a rugby field
- **Multi-Frame Animation**: Create smooth animations by adding multiple frames
- **Video Export**: Export your animations as .webm video files to share via WhatsApp or email
- **Save & Load**: Save your tactical diagrams as JSON files for later use
- **Multiple Sports**: Switch between Rugby Union, Rugby League, Soccer, and American Football fields
- **Annotations**: Draw arrows and lines to show movement patterns and tactical instructions
- **Ghost Mode**: See previous frame positions while setting up the next frame
- **Auto-Save**: Automatic crash recovery with 30-second auto-save
- **Offline-First**: No account needed, all data stays on your device

### Online Platform Features
- **User Accounts**: Free registration with 50 animation storage limit
- **Cloud Storage**: Save animations to the cloud and access from any device
- **Public Gallery**: Browse and discover animations shared by coaches worldwide
- **Social Features**: Upvote animations, share links, and community interaction
- **Guest Mode**: Try the tool instantly with 10-frame limit (no signup required)
- **Content Reporting**: Help keep the community safe with reporting tools
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Modern web browser (Chrome 90+, Edge 90+, or Firefox)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd coaching-animator

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open at http://localhost:3000/

### Online Platform Setup (Optional)
For cloud features, create a Supabase project and configure environment variables:
```bash
# Copy environment template
cp .env.local.example .env.local

# Add your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# FRONTEND_URL=http://localhost:3000
```

The core animation tool works fully offline. Online features require Supabase configuration.

### For Developers

**Comprehensive Documentation Available**:
- **[Getting Started Guide](docs/development/getting-started.md)** - Setup, development workflow, and testing
- **[Developer Documentation](docs/)** - Architecture, API contracts, database schema
- **[Feature Modules](src/features/)** - Animation & Gallery READMEs with usage examples
- **[Core Module](src/core/README.md)** - Shared utilities, hooks, stores, and types
- **[Shared Components](src/shared/README.md)** - UI component library and design system

The codebase follows a **feature-based architecture** (refactored Feb 2024) for V2.0 readiness. See the [Project Structure](#project-structure-feature-based-architecture) section below for details.

---

## 📖 Usage Guide

### Creating Your First Animation

1. **Add Players**: Click "Attack Player" or "Defense Player" buttons in the sidebar to add team members
2. **Position Entities**: Drag players to their starting positions on the field
3. **Add Labels**: Double-click a player to add a jersey number or name
4. **Create Next Frame**: Click the "+" button in the timeline to add a new frame
5. **Set End Positions**: Reposition players to their target positions in Frame 2
6. **Play Animation**: Press the Play button (or Spacebar) to see your animation
7. **Export Video**: Click "Export Video" to save as a .webm file
8. **Save Project**: Click "Save Project" to download a .json file you can load later

### Advanced Features

#### Ball Possession
1. Add a ball entity using the "Ball" button
2. Select the ball
3. Use the "Possession" dropdown in Entity Properties to assign it to a player
4. The ball will follow that player during animation

#### Annotations
1. Click "Draw Arrow" or "Draw Line" in the Entity Palette
2. Click and drag on the canvas to create your annotation
3. Right-click annotations to delete them
4. Set frame visibility in Entity Properties to show annotations only on specific frames

#### Ghost Mode
- Enable "Show Ghosts" to see semi-transparent previous frame positions
- Helps align players for realistic movement sequences

#### Duration Control
- Each frame has a duration slider (default: 2 seconds)
- Adjust to create faster or slower transitions between frames
- Range: 100ms to 10,000ms

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Spacebar** | Play / Pause animation |
| **Delete** | Remove selected entity |
| **Escape** | Deselect entity |
| **Ctrl+S** (Cmd+S on Mac) | Save project |
| **Left Arrow** | Previous frame |
| **Right Arrow** | Next frame |

---

## 🌐 Browser Support

| Browser | Drag & Drop | Animation | Video Export |
|---------|-------------|-----------|--------------|
| **Chrome 90+** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Edge 90+** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Firefox** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Safari** | ✅ Supported | ✅ Supported | ⚠️ Limited |

> **Recommendation**: Use Chrome or Edge for full feature support, especially for video export.

---

## 📝 Known Limitations

- **50-Frame Limit**: Projects can have a maximum of 50 frames (per FR-FRM-01)
- **Export Format**: Videos are exported as .webm only (limited Safari support)
  - **Workaround**: Use Chrome or Edge for best video export compatibility
- **Max Animation Duration**: 5 minutes per export (300,000ms total frame duration per FR-EXP-04)
- **No Cloud Sync**: All data is stored locally in your browser (offline-first design)
- **Auto-Save Quota**: Auto-save limited to ~5MB (browser LocalStorage limit)
  - **Behavior**: If quota exceeded, app displays warning toast and prompts manual save
- **Safari Limitations**: 
  - MediaRecorder API has limited support → Video export may be unstable
  - Recommend using Chrome/Edge for full functionality
- **Entity Limits**: While not enforced, performance is optimal with ≤30 entities per frame
- **Annotation Limits**: Maximum 100 annotations per frame (per data-model.md validation rules)

---

## 🎨 Design Philosophy

The Rugby Animation Tool follows the **Tactical Clubhouse Aesthetic**:
- **Pitch Green** (#1A3D1A) and **Tactics White** (#F8F9FA) color scheme
- Sharp corners (no rounded edges) for a professional, tactical feel
- Monospace fonts for data fields (frame counts, timecode)
- Rugby-first terminology and workflow

---

## 🏉 Tips for Rugby Coaches

### Creating Lineout Plays
1. Use the "Rugby Union" field
2. Add 7-8 attack players for your lineout jumpers and lifters
3. Add 2-3 defense players for opposition
4. Use cones to mark the 5m and 15m lines
5. Add the ball and assign possession to your thrower
6. Annotate with arrows to show lifting calls and throws

### Creating Backline Moves
1. Position 7 attack players across the field (halfback, flyhalf, centers, wingers, fullback)
2. Add the ball to the halfback
3. Create 3-4 frames showing the passing sequence
4. Use annotations to highlight running lines and switches
5. Adjust frame durations to match real-time play speed

### Sharing with Players
1. Export your animation as .webm
2. Share via WhatsApp, email, or your team's messaging app
3. Players can watch on any device that supports video playback
4. Consider using screen recording software to convert to MP4 for iOS devices

---

## 🛠️ Technical Details

### Built With
- **Next.js 14** - React framework with App Router
- **React 18** + TypeScript
- **Konva** - HTML5 Canvas library for smooth rendering
- **Zustand** - Lightweight state management
- **Tailwind CSS v4** - Modern utility-first styling with CSS-based configuration
- **Supabase** - Authentication, database, and storage
- **Serwist** - PWA service worker for offline support

### Project Structure (Feature-Based Architecture)

The project follows a **feature-based architecture** (refactored Feb 2024) for scalability and V2.0 readiness:

```
├── src/
│   ├── app/                 # Next.js App Router (pages, API routes, layouts)
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (legal)/         # Legal pages (Terms, Privacy, Contact)
│   │   ├── admin/           # Admin dashboard
│   │   ├── api/             # API endpoints
│   │   ├── gallery/         # Public gallery pages
│   │   ├── my-gallery/      # Personal gallery page
│   │   ├── app/             # Animation tool (main application)
│   │   ├── replay/          # Animation replay pages
│   │   ├── page.tsx         # Landing page
│   │   └── layout.tsx       # Root layout
│   ├── core/                # Shared utilities and domain logic
│   │   ├── hooks/           # Custom React hooks (8 files)
│   │   ├── stores/          # Zustand state management
│   │   ├── types/           # TypeScript type definitions
│   │   ├── utils/           # Pure utility functions
│   │   ├── constants/       # Design tokens, validation rules
│   │   └── README.md        # Core module documentation
│   ├── features/            # Feature modules (domain-driven design)
│   │   ├── animation/       # Animation editor feature
│   │   │   ├── components/  # Canvas, Sidebar, Timeline, Editor
│   │   │   ├── services/    # EntityColors service
│   │   │   └── README.md    # Animation feature documentation
│   │   └── gallery/         # Gallery feature
│   │       ├── components/  # AnimationCard, PublicAnimationCard
│   │       └── README.md    # Gallery feature documentation
│   ├── shared/              # Reusable UI components
│   │   ├── components/      # Navigation, ErrorBoundary, Modals
│   │   ├── ui/              # Base UI primitives (Button, Dialog, etc.)
│   │   └── README.md        # Shared module documentation
│   └── lib/                 # Third-party integrations (Supabase, contexts)
├── docs/                    # Developer documentation
│   ├── README.md            # Documentation index
│   ├── architecture/        # System design docs
│   ├── development/         # Developer guides
│   ├── testing/             # Testing strategy
│   ├── troubleshooting/     # Debugging guides
│   └── operations/          # CI/CD, deployment
├── archive/specs/           # Archived specifications
│   ├── 003-online-platform/ # Completed: User accounts, galleries
│   ├── 004-post-launch-improvements/
│   └── 005-incremental-improvements/
└── supabase/                # Database migrations
```

**Path Aliases** (configured in `tsconfig.json`):
- `@/core/*` → Shared utilities, hooks, stores, types, constants
- `@/features/*` → Feature modules (animation, gallery, future: organizations)
- `@/shared/*` → Shared UI components and primitives
- `@/lib/*` → Third-party integrations (Supabase, contexts)

---

## 🤝 Contributing

This project follows a spec-driven development workflow with comprehensive documentation.

### Current Project Status

**Online Platform (003-online-platform)**: ✅ Complete (111/111 tasks)
- ✅ User accounts, cloud storage, galleries
- ✅ Social features (upvoting, reporting)
- ✅ Admin moderation dashboard
- ✅ PWA with offline support

**V2 Foundation Refactor (T001)**: ✅ Complete (Feb 2024)
- ✅ T002: PRD v2.0 updated with audit findings
- ✅ T003: Feature-based architecture (85 files migrated, 132+ imports updated)
- ✅ T004: Barrel exports for all modules
- ✅ T005: Comprehensive README documentation (~9,700 lines)

**Current Iteration**: 005-incremental-improvements
- 14 identified issues (2 critical, 5 high, 5 medium, 2 low priority)
- Pick-and-choose approach for incremental fixes
- See `archive/specs/005-incremental-improvements/` for details

### Documentation Quick Links

**For New Contributors**:
- [Getting Started](docs/development/getting-started.md) - Setup and onboarding
- [Architecture Overview](docs/README.md) - System design
- [Feature Modules](src/features/) - Animation, Gallery READMEs
- [Core Module](src/core/README.md) - Shared utilities and state management
- [Shared Components](src/shared/README.md) - UI component library

**For Development**:
- [API Contracts](docs/architecture/api-contracts.md) - Endpoint specifications
- [Database Schema](docs/architecture/database-schema.md) - Supabase tables and RLS
- [Testing Strategy](docs/testing/strategy.md) - E2E testing approach
- [Troubleshooting](docs/troubleshooting/) - Debugging guides

**Submit Issues**:
- Reference Task IDs (e.g., T001-T111) or issue codes (e.g., CRIT-001, HIGH-001)
- Check `archive/specs/005-incremental-improvements/` for known issues
- Include steps to reproduce, expected vs actual behavior, and browser/OS details

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase project (for online features)
- Vercel account (recommended for hosting)

### Production Setup

1. **Environment Variables**
   ```bash
   # Required for production
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=https://your-domain.com
   ```

2. **Build and Deploy**
   ```bash
   # Build for production
   npm run build
   
   # Deploy to Vercel (recommended)
   npx vercel
   ```

3. **Database Setup**
   - Run migrations in Supabase dashboard
   - Set up Row Level Security policies
   - Configure authentication providers

### Known Issues

- **Static Generation**: Current build has issues with static generation - use dynamic rendering for now
- **Video Export**: Requires Chrome/Edge for best compatibility
- **Mobile Safari**: Limited video export support
- **Supabase AbortError (Console Warning)**: You may see `AbortError: signal is aborted without reason` in the browser console during auth initialization. This is a known, harmless issue in the `@supabase/ssr` package that doesn't affect functionality. The error can be safely ignored.

---

## 📚 Documentation

The project includes comprehensive documentation for developers, architects, and contributors:

### Feature Module READMEs

Each feature module has detailed documentation:

- **[Animation Feature](src/features/animation/README.md)** (~3,800 lines)
  - Editor, ReplayViewer, Canvas components
  - EntityColors service and color management patterns
  - State management integration with Zustand
  - Custom hooks (useAnimationLoop, useExport, useFrameCapture, etc.)
  - Testing patterns and V2.0 roadmap

- **[Gallery Feature](src/features/gallery/README.md)** (~1,100 lines)
  - Gallery card components (personal & public)
  - Optimistic updates pattern
  - Infinite scroll implementation
  - API integration examples

- **[Core Module](src/core/README.md)** (~2,900 lines)
  - Zustand stores (projectStore, uiStore) with full API docs
  - 8 custom hooks with usage examples
  - Type definitions and constants
  - Utilities (serialization, validation, interpolation)
  - Dependency architecture rules

- **[Shared Components](src/shared/README.md)** (~1,900 lines)
  - Application components (Navigation, Modals, ErrorBoundary)
  - UI primitives (Button, Dialog, Input, Select, Slider)
  - Custom components (ColorPicker, ConfirmDialog, EntityContextMenu)
  - Tailwind v4 design system and accessibility patterns

### Developer Documentation

Comprehensive guides in the `docs/` directory:

- **[Documentation Index](docs/README.md)** - Quick navigation
- **[Architecture](docs/architecture/)** - System design, database schema, API contracts
- **[Development](docs/development/)** - Getting started, setup guides
- **[Testing](docs/testing/)** - E2E strategy, Playwright guides
- **[Troubleshooting](docs/troubleshooting/)** - Debugging session persistence, production stability
- **[Operations](docs/operations/)** - CI/CD, deployment, staging setup

### Product & Governance

- **[PRD v1.0](docs/authority/PRD.md)** - Original product requirements (89% coverage)
- **[PRD v2.0 (DRAFT)](docs/authority/PRD-v2.0.md)** - Rugby coaching platform vision
- **[Constitution](docs/authority/constitution.md)** - v3.3 with organizational tier & privacy-preserving metrics
- **[V2 Vision](docs/authority/V2_VISION.md)** - Future roadmap and features

---

## 📄 License

[Specify your license here]

---

## 🙏 Acknowledgments

- Built for rugby coaches who want simple, effective tools
- Inspired by the need for offline, privacy-first tactical diagramming
- Designed to work on any device with a modern browser

---

**Made with ❤️ for coaches who love the tactical side of rugby**
