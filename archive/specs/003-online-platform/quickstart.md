# Quickstart: Development Environment

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29

## Prerequisites

- **Node.js**: v18.17+ (LTS recommended)
- **npm**: v9+
- **Git**: Latest
- **Supabase CLI**: For local development (optional)
- **Editor**: VS Code recommended

---

## 1. Clone and Checkout Branch

```bash
git clone https://github.com/footnote42/coaching-animator.git
cd coaching-animator
git checkout 003-online-platform
```

---

## 2. Install Dependencies

```bash
npm install
```

**New dependencies for this branch** (will be added during migration):
```bash
# Next.js core
npm install next@latest

# Supabase SSR auth
npm install @supabase/ssr

# PWA support
npm install @serwist/next

# Content moderation
npm install bad-words

# OG image generation
npm install @vercel/og
```

---

## 3. Environment Setup

Copy the example env file and configure:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Formspree for contact form
NEXT_PUBLIC_FORMSPREE_ID=your-formspree-id
```

**Where to get Supabase keys**:
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API
3. Copy "URL" and "anon public" key
4. Copy "service_role" key (keep secret!)

---

## 4. Supabase Project Setup

### Option A: Use Existing Project

If you have a Supabase project ready, run the migrations:

```bash
# Via Supabase CLI
supabase db push

# Or manually: 
# Go to Supabase Dashboard → SQL Editor → Run migration SQL
```

### Option B: Create New Project

1. Create project at [supabase.com](https://supabase.com)
2. Enable **Email Auth** in Authentication → Providers
3. Run migration SQL (see `supabase/migrations/001_online_platform.sql`)
4. Configure email templates in Authentication → Email Templates

---

## 5. Database Migration

Run the schema migration:

```sql
-- supabase/migrations/001_online_platform.sql
-- Run this in Supabase SQL Editor

-- 1. User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  animation_count INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_at TIMESTAMPTZ,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Saved animations (see data-model.md for full schema)
-- 3. Upvotes
-- 4. Content reports
-- 5. RLS policies

-- Full migration file will be in supabase/migrations/
```

---

## 6. Run Development Server

### During Migration (Vite still available)

```bash
# Run Vite (existing)
npm run dev

# Run Next.js (after Phase 1)
npm run dev:next
```

### After Migration Complete

```bash
npm run dev
# Opens http://localhost:3000
```

---

## 7. Project Structure (Post-Migration)

```
coaching-animator/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page (/)
│   ├── globals.css
│   ├── (auth)/              # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (legal)/             # Static pages route group
│   │   ├── terms/
│   │   ├── privacy/
│   │   └── contact/
│   ├── app/                 # Animation tool (/app)
│   │   └── page.tsx
│   ├── gallery/             # Public gallery
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── my-gallery/          # Personal gallery (protected)
│   │   └── page.tsx
│   ├── replay/[id]/         # Shareable replay
│   │   └── page.tsx
│   ├── admin/               # Admin dashboard
│   │   └── page.tsx
│   └── api/                 # API routes
│       ├── auth/callback/
│       ├── animations/
│       ├── gallery/
│       ├── report/
│       └── og/[id]/
├── components/              # Shared components (from src/)
├── lib/                     # Utilities
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   ├── schemas/             # Zod schemas
│   └── moderation.ts
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service worker (generated)
├── supabase/
│   └── migrations/
├── middleware.ts            # Auth middleware
├── next.config.js
└── package.json
```

---

## 8. Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

---

## 9. Testing Checklist

### Auth Flow
- [ ] Register new account with email
- [ ] Verify email (check Supabase logs or email)
- [ ] Login with credentials
- [ ] Logout
- [ ] Password reset flow

### Animation Tool
- [ ] Create animation as guest (10 frame limit)
- [ ] Create animation as user (50 frame limit)
- [ ] Save to cloud
- [ ] Load from cloud
- [ ] Export GIF

### Gallery
- [ ] View personal gallery
- [ ] Change animation visibility
- [ ] View public gallery
- [ ] Search public gallery
- [ ] Upvote animation
- [ ] Report animation

### Offline Mode
- [ ] Load app, go offline
- [ ] Create animation offline
- [ ] Save locally (JSON download)
- [ ] Reconnect, save to cloud

---

## 10. Troubleshooting

### "Supabase not connecting"
- Verify `.env.local` has correct URL and keys
- Check Supabase project is not paused
- Ensure RLS policies are in place

### "Konva errors during build"
- Ensure animation components are wrapped with `'use client'`
- Use `next/dynamic` with `{ ssr: false }`

### "Auth callback failing"
- Check redirect URL in Supabase → Authentication → URL Configuration
- Must include `http://localhost:3000/api/auth/callback`

### "PWA not working offline"
- Service worker only registers in production or with HTTPS
- Test with `npm run build && npm run start`

### "Hydration mismatch errors"
- Ensure components using Zustand store are client components
- Use `useEffect` for client-only state initialization

### "Rate limiting not working"
- Check `rate_limits` table exists in Supabase
- Verify RLS policies allow inserts/updates

---

## 11. Useful Links

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@serwist/next PWA](https://serwist.pages.dev/docs/next)
- [Vercel OG Image Generation](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Zod Documentation](https://zod.dev/)

---

## 12. Environment Variables Reference

| Variable | Required | Exposed to Client | Description |
|----------|----------|-------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **No** | Supabase service role key (admin) |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Application base URL |
| `NEXT_PUBLIC_FORMSPREE_ID` | No | Yes | Formspree form ID for contact |

---

## 13. Development Workflow

### Feature Development
1. Create feature branch from `003-online-platform`
2. Implement changes following existing patterns
3. Run `npm run lint` and `npm run test`
4. Create PR back to `003-online-platform`

### Database Changes
1. Add migration file to `supabase/migrations/`
2. Test locally with `supabase db reset`
3. Apply to production via Supabase dashboard or CLI

### Deployment
- Push to `003-online-platform` triggers Vercel preview
- Merge to `main` triggers production deployment

---

## 14. Contact

Questions? Check the spec files:
- `specs/003-online-platform/spec.md` - User stories and requirements
- `specs/003-online-platform/MIGRATION_PLAN.md` - Phase-by-phase migration
- `specs/003-online-platform/data-model.md` - Database schemas
- `specs/003-online-platform/contracts/api-contracts.md` - API specifications
- `specs/003-online-platform/research.md` - Technical decisions
