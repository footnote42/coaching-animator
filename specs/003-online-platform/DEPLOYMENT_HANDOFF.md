# Deployment Handoff: Rugby Animation Tool

**Date**: 2026-01-30  
**Status**: Ready for Production Deployment  
**Phase**: 13 - Production Deployment

---

## Project Overview

The Rugby Animation Tool is a web-based tactical animation tool for rugby coaches. It has been migrated from a local Vite/React MVP to a Next.js 16 app with online platform features including:

- User authentication (Supabase Auth)
- Cloud storage for animations
- Public gallery with upvotes and sharing
- Content reporting and admin moderation
- Guest mode with 10-frame limit
- PWA offline support

---

## Current State

### ✅ Completed (Phases 1-12)

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 1 | Setup (Next.js, PWA) | T001-T007 | ✅ Complete |
| 2 | Foundational (DB, Auth helpers) | T008-T026 | ✅ Complete |
| 3 | US1: Auth + Cloud Save | T027-T047 | ✅ Complete |
| 4 | US2: Public Share | T048-T052 | ✅ Complete |
| 5 | US3: Public Gallery | T053-T063 | ✅ Complete |
| 6 | US4: Guest Mode | T064-T067 | ✅ Complete |
| 7 | US5: Upvotes | T068-T073 | ✅ Complete |
| 8 | US6: Content Reports | T074-T078 | ✅ Complete |
| 9 | US7: Landing Page | T079-T085 | ✅ Complete |
| 10 | US8: Admin Moderation | T086-T092 | ✅ Complete |
| 11 | US9: Remix | T093-T097 | ✅ Complete |
| 12 | Polish & Security | T098-T111 | ✅ Complete |

### 🔄 Pending (Phase 13)

| Phase | Description | Tasks | Status |
|-------|-------------|-------|--------|
| 13 | Production Deployment | T112-T136 | ⏳ Pending |

---

## Build Verification

```bash
# Verify build passes before deployment
cd coaching-animator
npm run build
```

**Expected Output**: 23 static pages, 15 API routes, no errors

---

## Start Prompt for New Agent

Copy this prompt to start a new session for Phase 13 deployment:

```
## Task: Execute Phase 13 - Production Deployment

### Context
You are continuing work on the Rugby Animation Tool. All development phases (1-12) are complete with 111 tasks done. The codebase is production-ready and builds successfully.

### Your Mission
Execute Phase 13 tasks (T112-T136) from `/specs/003-online-platform/tasks.md` to deploy the application to production.

### Key Files
- **Tasks**: `/specs/003-online-platform/tasks.md` (Phase 13 section)
- **Progress**: `/specs/003-online-platform/PROGRESS.md`
- **Migration SQL**: `/supabase/migrations/001_online_platform.sql`
- **Environment Template**: `/.env.local.example`

### Execution Rules
1. Execute tasks sequentially within each sub-phase
2. Mark tasks complete in `tasks.md` as you finish them
3. Verify each checkpoint before proceeding
4. Stop at sub-phase boundaries for user verification
5. Token check at each sub-phase start (must be < 110K)

### Phase 13 Sub-Phases
- **13a**: Supabase Setup (T112-T116) - Create project, run migration, configure auth
- **13b**: Environment & Deployment (T117-T120) - Vercel setup, env vars, deploy
- **13c**: Admin Setup (T121-T123) - Create admin account
- **13d**: End-to-End Testing (T124-T132) - Verify all 9 user stories
- **13e**: Final Verification (T133-T136) - PWA, SEO, security checks

### User Interaction Required
Some tasks require manual user action:
- T112: User must create Supabase project (provide instructions)
- T113: User must run SQL in Supabase dashboard (provide SQL)
- T115: User must configure auth settings (provide checklist)
- T117-T118: User must create Vercel project and set env vars
- T121-T122: User must register and set admin role

### Start Command
Begin by reading the current state:
1. Read `/specs/003-online-platform/tasks.md` (Phase 13 section)
2. Confirm build passes: `npm run build`
3. Start with T112 - guide user through Supabase project creation
```

---

## Environment Variables Required

Create these in Vercel (or your deployment platform):

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIs...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJhbGciOiJIUzI1NiIs...` |
| `NEXT_PUBLIC_SITE_URL` | Production site URL | `https://coaching-animator.vercel.app` |

---

## Supabase Setup Checklist

### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Create new project (free tier is sufficient)
- Note the project URL and API keys from Settings → API

### 2. Run Migration
- Go to SQL Editor in Supabase dashboard
- Copy contents of `supabase/migrations/001_online_platform.sql`
- Execute the SQL
- Verify 6 tables created: `user_profiles`, `saved_animations`, `upvotes`, `content_reports`, `follows`, `rate_limits`

### 3. Configure Auth
- Go to Authentication → Providers
- Enable Email provider
- Go to Authentication → URL Configuration
- Set Site URL: `https://your-domain.vercel.app`
- Add Redirect URLs:
  - `https://your-domain.vercel.app/api/auth/callback`
  - `http://localhost:3000/api/auth/callback` (for local dev)

### 4. Email Templates (Optional)
- Go to Authentication → Email Templates
- Customize confirmation and reset password emails

---

## Admin Setup

After deployment, create an admin account:

1. Register a new account on production site
2. Get the user ID from Supabase Auth → Users
3. Run in SQL Editor:
```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```
4. Verify admin dashboard accessible at `/admin`

---

## Testing Checklist

### User Story Verification

| US | Test | Expected Result |
|----|------|-----------------|
| US1 | Register → Save animation → Logout → Login | Animation in My Playbook |
| US2 | Set public → Share link | Viewable in incognito |
| US3 | Browse gallery → Filter → Sort | Animations display correctly |
| US4 | Guest mode → Add 11th frame | Upgrade prompt appears |
| US5 | Upvote animation | Count increases, toggles |
| US6 | Report animation | Appears in admin queue |
| US7 | Visit landing page | Hero, features, CTA visible |
| US8 | Admin actions | Dismiss/Hide/Ban work |
| US9 | Remix public animation | Copy in personal gallery |

### Technical Verification

| Check | How to Verify |
|-------|---------------|
| PWA | Install on mobile, go offline |
| SEO | Check `/sitemap.xml`, OG tags |
| Security | Check CSP headers in dev tools |
| Performance | Lighthouse audit > 80 |

---

## Troubleshooting

### Common Issues

**Auth callback fails**
- Check redirect URLs in Supabase match exactly
- Verify `NEXT_PUBLIC_SITE_URL` is correct

**Tables not found**
- Ensure migration SQL ran completely
- Check for errors in SQL Editor output

**Admin dashboard 403**
- Verify user role is 'admin' in `user_profiles` table
- Check user is logged in

**Build fails on Vercel**
- Ensure all env vars are set
- Check build logs for missing dependencies

---

## File Reference

```
coaching-animator/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register, etc.)
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── gallery/           # Public gallery
│   ├── my-gallery/        # Personal gallery
│   └── app/               # Animation editor
├── components/            # React components
├── lib/                   # Utilities, Supabase clients
├── specs/003-online-platform/
│   ├── tasks.md          # Task list with Phase 13
│   ├── PROGRESS.md       # Session history
│   └── DEPLOYMENT_HANDOFF.md  # This file
└── supabase/migrations/   # Database schema
```

---

## Contact

For issues with this deployment:
1. Check `/specs/003-online-platform/PROGRESS.md` for session history
2. Review `/specs/003-online-platform/spec.md` for feature specifications
3. Check API contracts in `/specs/003-online-platform/contracts/`
