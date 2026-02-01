# Getting Started: Coaching Animator

**Last Updated**: 2026-01-31
**Framework**: Next.js 14 App Router with Supabase
**Target Audience**: New developers

---

## Overview

Coaching Animator is a web application for creating, sharing, and discovering coaching animations. This guide walks you through setup and running the development server.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18 or higher ([download](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Git**: For cloning the repository
- **Supabase Account**: For backend services (free tier available)
- **Text Editor**: VS Code, Cursor, or similar

### Verify Installation

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
git --version   # Any recent version
```

---

## Clone & Install

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/coaching-animator.git
cd coaching-animator
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages defined in `package.json`.

---

## Environment Setup

### 1. Supabase Project Setup

Create a free Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create new project
4. Note your credentials:
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: Public key visible in Settings

### 2. Create `.env.local`

In the project root, create `.env.local` with your Supabase credentials:

```bash
# Copy the template
cp .env.example .env.local

# Edit with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important**:
- Never commit `.env.local` to Git
- The `.env.example` file shows what variables are needed
- `NEXT_PUBLIC_*` variables are visible to the browser (this is intentional)

### 3. Verify Configuration

```bash
# Check if .env.local is in .gitignore
grep ".env.local" .gitignore

# You should see the line: .env.local
```

---

## First Run

### 1. Start Development Server

```bash
npm run dev
```

You should see:
```
> coaching-animator@1.0.0 dev
> next dev

  ▲ Next.js 14.2.29
  - Local:        http://localhost:3000
```

### 2. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

You should see the Coaching Animator landing page.

### 3. Test Authentication

1. Click "Sign Up" or "Log In"
2. Create test account with email
3. You should be able to access the animation editor at `/app`

---

## Project Structure

```
coaching-animator/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (legal)/           # Legal pages (terms, privacy)
│   ├── api/               # API routes
│   ├── gallery/           # Public gallery
│   ├── profile/           # User profile
│   ├── app/               # Animation editor
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── src/                   # Core animation components (from Vite)
│   ├── components/        # Canvas, Sidebar, Timeline
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── lib/                   # Shared utilities
│   ├── supabase/          # Supabase client setup
│   ├── contexts/          # React contexts (UserContext)
│   └── schemas/           # Zod validation schemas
├── docs/                  # Documentation
├── tests/                 # Test files
│   └── e2e/              # Playwright E2E tests
├── public/                # Static assets
├── package.json           # Project dependencies
├── next.config.js         # Next.js configuration
└── README.md              # Project overview
```

**Key Files**:
- `lib/contexts/UserContext.tsx` - Auth state management
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `middleware.ts` - Auth refresh middleware
- `CLAUDE.md` - Comprehensive development guidelines

---

## Common Commands

### Development

```bash
# Start dev server
npm run dev

# Run type checking
npx tsc --noEmit

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run e2e

# Run E2E with visible browser
npm run e2e:headed

# View E2E report
npm run e2e:report
```

### Build & Deploy

```bash
# Create production build
npm run build

# Start production server
npm run start

# Deploy to Vercel
vercel deploy
```

---

## Project Status

### Current Iteration: 003-Online-Platform

**Status**: ✅ 111/111 development tasks complete

**Completed Features**:
- ✅ User authentication (Supabase)
- ✅ Cloud save/load animations
- ✅ Personal gallery
- ✅ Public gallery with search
- ✅ Link sharing
- ✅ Upvoting & remix
- ✅ Content reporting
- ✅ Admin dashboard

**Current Phase**: Production deployment (Phase 13)

See `CLAUDE.md` for comprehensive development guidelines.

---

## Understanding Authentication

The app uses **Supabase Auth** with a **cloud-first model**:

### Tiers

- **Tier 0 (Guest)**: 10-frame editor, no cloud save
- **Tier 1 (Authenticated)**: Cloud storage, personal gallery (50 max)
- **Tier 2 (Public)**: Link sharing, public gallery, upvoting
- **Tier 3 (Admin)**: Moderation, user management

### How Auth Works

```
1. User logs in → Supabase stores session in cookies
2. Middleware auto-refreshes token if needed
3. UserContext provides auth state to app
4. Protected routes check auth and redirect if needed
```

**Key Files**:
- `lib/contexts/UserContext.tsx` - Auth state provider
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `middleware.ts` - Auth refresh
- `app/(auth)/` - Auth pages

See `docs/architecture/auth-patterns.md` for detailed auth patterns.

---

## Running Tests

### Unit Tests (Vitest)

```bash
npm test
```

### E2E Tests (Playwright)

```bash
# First time: Install browsers
npx playwright install

# Run tests
npm run e2e

# Run with browser visible (debugging)
npm run e2e:headed

# View results
npm run e2e:report
```

See `docs/testing/strategy.md` and `docs/testing/e2e-guide.md` for details.

---

## Documentation

### Quick Links

- **Architecture**:
  - [Database Schema](../architecture/database-schema.md)
  - [API Contracts](../architecture/api-contracts.md)
  - [Auth Patterns](../architecture/auth-patterns.md)

- **Testing**:
  - [Testing Strategy](../testing/strategy.md)
  - [E2E Guide](../testing/e2e-guide.md)

- **Troubleshooting**:
  - [Session Persistence](../troubleshooting/session-persistence.md)
  - [Production Stability](../troubleshooting/production-stability.md)

- **Governance**:
  - [Constitution](../../.specify/memory/constitution.md) - Core principles
  - [PRD](../../.specify/memory/PRD.md) - Product requirements
  - [CLAUDE.md](../../CLAUDE.md) - Auto-generated guidelines

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in your IDE. The dev server will hot-reload.

### 3. Test

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run tests
npm test
npm run e2e
```

### 4. Commit

```bash
git add .
git commit -m "feat: your feature description"
```

### 5. Create Pull Request

Push to GitHub and create a PR for review.

---

## Troubleshooting

### "Cannot find module" Error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

```bash
# Use different port
npm run dev -- -p 3001
```

### Supabase Connection Error

1. Check `.env.local` has correct values
2. Verify Supabase project is running (check dashboard)
3. Check internet connection
4. Try restarting dev server

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Fix with ESLint
npm run lint -- --fix
```

---

## Next Steps

1. **Explore the Codebase**: Open `app/page.tsx` and `components/Editor.tsx`
2. **Read CLAUDE.md**: Comprehensive guidelines for development
3. **Check the Docs**: Review architecture and testing docs
4. **Run Tests**: Verify everything works with `npm test`
5. **Create Feature Branch**: Start building!

---

## Getting Help

- **Documentation**: Read docs/ and CLAUDE.md first
- **Type Hints**: Use TypeScript for IDE autocomplete
- **Linting**: Run `npm run lint` to catch issues early
- **Tests**: Verify changes with tests before committing
- **GitHub Issues**: Search existing issues or create new one

---

## Architecture Overview

The app is built with:

- **Frontend**: React 18 + Next.js 14 App Router
- **Canvas**: React-Konva for animation rendering
- **State**: Zustand for global state
- **Backend**: Supabase PostgreSQL + Auth
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel
- **Testing**: Vitest + Playwright

For deeper dive into architecture, see `docs/architecture/` and CLAUDE.md.

---

## Key Concepts

### Animation Data Model

Animations are stored as JSON with:
- **Frames**: Array of frame objects (each frame has field positions)
- **Duration**: Total animation time in milliseconds
- **Metadata**: Title, description, tags, animation type

### Database

- **user_profiles**: User metadata and quota
- **saved_animations**: Animation data + metadata
- **upvotes**: User upvote relationships
- **content_reports**: Moderation queue
- **follows**: User follower relationships (Phase 2)

See `docs/architecture/database-schema.md` for full details.

---

## Support & Questions

- Check `CLAUDE.md` for comprehensive guidelines
- Review docs in `docs/` directory
- Search GitHub issues
- Create new issue with clear description

---

**Welcome to Coaching Animator! Happy coding! 🎬**
