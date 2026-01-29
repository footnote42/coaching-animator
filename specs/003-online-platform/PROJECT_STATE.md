# Project State: 003-online-platform

**Branch**: `003-online-platform`
**Status**: Specification Complete
**Last Updated**: 2026-01-29

## Current Phase

**Phase 1: Specification** - COMPLETE

## Completed

- [x] Architecture exploration (hosting, pages, security)
- [x] User decisions captured (Next.js migration, Formspree, in-memory rate limiting)
- [x] Feature specification drafted (spec.md)
- [x] Requirements checklist validated

## In Progress

- [ ] Constitution v3.0 amendment (required for user accounts)
- [ ] PRD updates (new sections for accounts, gallery, hosting, security)

## Pending

- [ ] Technical implementation plan (MIGRATION_PLAN.md)
- [ ] Task breakdown and dependency ordering
- [ ] Implementation execution

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js (migrate from Vite) | SSR for SEO, static pages, API routes |
| Hosting | Vercel (default domain) | Already deployed, seamless Next.js integration |
| Auth | Supabase Auth (email/password) | Already using Supabase, simple integration |
| Contact Form | Formspree | External service, no backend needed |
| Rate Limiting | In-memory | Simple, sufficient for MVP scale |
| Admin Access | Same domain (/admin) | Single deployment, simpler auth |

## User Limits

| Limit | Guest | Registered |
|-------|-------|------------|
| Frames per animation | 10 | 50 |
| Cloud saves | 0 | 50 |
| Max duration | 20s | 60s |
| Upvoting | No | Yes |
| Public gallery | View only | View + Publish |

## Essential Pages (MVP)

- `/` - Landing page
- `/login`, `/register` - Auth pages
- `/terms`, `/privacy` - Legal pages
- `/app` - Animation tool
- `/my-gallery` - User's saved animations
- `/gallery` - Public gallery with search
- `/replay/:id` - Shareable replay view

## Dependencies

1. **Constitution Amendment**: Must amend v2.1 to v3.0 to permit user accounts
2. **PRD Update**: Add sections 16-21 covering new features
3. **Database Schema**: New tables for users, saved_animations, upvotes, reports
4. **Supabase RLS**: Row-level security policies for all new tables

## Risks

| Risk | Mitigation |
|------|------------|
| Next.js migration breaks animation features | Incremental migration, thorough testing of Konva integration |
| Supabase Auth complexity | Use Supabase UI components, follow official guides |
| SEO requirements for gallery | SSR with proper meta tags, sitemap generation |
