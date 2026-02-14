# Technology Stack

**Last Updated**: 2026-02-14

This document lists all active technologies used in the coaching-animator project.

---

## Frontend

### Core Framework
- **React 18+** - UI library with hooks and concurrent features
- **TypeScript 5.x** - Static type checking and enhanced developer experience
- **Next.js 14** - React framework with App Router for SSR/SSG

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS framework with CSS-based configuration
- **React-Konva** - React wrapper for Konva.js (HTML5 Canvas library)
- **shadcn/ui patterns** - Base UI primitives (Button, Dialog, Input, Select, Slider)

### State Management
- **Zustand** - Lightweight state management (projectStore, uiStore)
- **React Context** - Auth state via UserContext

### PWA & Offline
- **@serwist/next** - Service worker for Progressive Web App functionality
- **LocalStorage** - Offline persistence and auto-save

---

## Backend

### Database & Auth
- **Supabase PostgreSQL** - Database with Row Level Security (RLS)
- **Supabase Auth** - Email-based authentication (no third-party providers)
- **@supabase/ssr** - Cookie-based session management for Next.js

### API Layer
- **Next.js API Routes** - Serverless API endpoints
- **Vercel Functions** - Serverless deployment runtime

---

## Development Tools

### Build & Bundling
- **Next.js Built-in Compiler** - Rust-based SWC compiler
- **Turbopack** - Next.js 14 dev server (optional)

### Testing
- **Playwright** - End-to-end testing framework
- **Vitest** - Unit testing framework (fast, Vite-powered)
- **@testing-library/react** - React component testing utilities

### Code Quality
- **ESLint** - Linting with Next.js and TypeScript rules
- **TypeScript Compiler** - Type checking (`tsc --noEmit`)
- **Prettier** - Code formatting (via ESLint plugin)

---

## DevOps & Hosting

### Hosting
- **Vercel** - Frontend hosting and serverless functions
- **Supabase Cloud** - Database and authentication hosting

### CI/CD
- **GitHub Actions** - Continuous integration pipeline (`.github/workflows/ci.yml`)
- **Vercel Git Integration** - Automatic deployments on push

### Monitoring
- **Vercel Analytics** - Build and deployment logs (no user tracking)
- **Supabase Dashboard** - Database metrics and logs

---

## Asset Management

### Media
- **SVG** - Vector graphics for sport field backgrounds
- **PNG** - Raster graphics for thumbnails and exports
- **WebM** - Video export format (MediaRecorder API)

### Fonts
- **System Fonts** - No custom fonts (performance optimization)
- **Monospace** - Used for data fields (frame counts, timecode)

---

## Third-Party Services

### Required
- **Supabase** - Backend services (database, auth, storage)
- **Vercel** - Hosting and serverless functions

### None
- ❌ No analytics services (Google Analytics, etc.)
- ❌ No third-party auth (Google, Facebook, etc.)
- ❌ No CDN (Vercel's built-in CDN only)
- ❌ No payment processors (free tier only)

---

## Browser Support

| Browser | Version | Support Level |
|---------|---------|---------------|
| **Chrome** | 90+ | ✅ Full support |
| **Edge** | 90+ | ✅ Full support |
| **Firefox** | Latest | ✅ Full support |
| **Safari** | Latest | ⚠️ Limited (WebM export issues) |

**Recommendation**: Use Chrome or Edge for full feature support, especially video export.

---

## Deprecated Technologies

### Removed in Migrations

**Vite (Jan 2024)**:
- Replaced with Next.js 14 for SSR/SSG capabilities
- All Vite code removed in cleanup (Feb 2024)

**Create React App (Never Used)**:
- Project started with Vite, never used CRA

---

## Version Constraints

### Node.js
- **Required**: Node.js 18+
- **Recommended**: Node.js 20 LTS

### Package Manager
- **npm** - Default package manager (no Yarn/pnpm lock files)

### Browser APIs
- **Canvas API** - Required for React-Konva rendering
- **MediaRecorder API** - Required for video export
- **LocalStorage API** - Required for offline persistence
- **Service Worker API** - Required for PWA functionality

---

## Future Considerations (V2.0)

**Planned Additions**:
- **WebSockets** (Supabase Realtime) - For real-time collaboration
- **IndexedDB** - For larger offline storage (replace LocalStorage)
- **Web Workers** - For background video export processing
- **WebRTC** - For peer-to-peer collaboration (optional)

**Not Planned**:
- Third-party analytics (prohibited by Constitution)
- Third-party auth providers (prohibited by Constitution)
- Server-side rendering frameworks other than Next.js

---

## Related Documentation

- **[Getting Started](getting-started.md)** - Setup and installation
- **[Migration History](../architecture/migration-history.md)** - Technology migration timeline
- **[Development Patterns](patterns.md)** - Framework-specific patterns
- **[Constitution](../authority/constitution.md)** - Technology governance rules
