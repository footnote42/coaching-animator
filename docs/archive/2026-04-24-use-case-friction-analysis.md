# Next Session Prompt: Use Case Flow Friction & Feature Development

**Date prepared**: 2026-04-24  
**Current project state**: Phase 2 (Landing page + UAT) complete. Core loop stable. Audit score 15/20.  
**Next focus**: Identify user friction points in the primary job-to-do, then develop new features to address them.

---

## Session Objectives

1. **Identify flow friction** — Map the primary user journey (desktop create → mobile view → share) and flag where coaches get stuck or feel friction
2. **Validate with design context** — Each friction point should be mapped back to the brand personality and the stated use case
3. **Design features to address friction** — Propose 2–3 specific features that would meaningfully reduce friction
4. **Prototype or spec out** — Either mock up the feature (Figma/wireframe) or write a SpecKit spec if the design is clear

---

## Context: User Profile & Job-to-Do

From `.impeccable.md`:

**User**: Grassroots rugby coach — club coach, PE teacher, weekend volunteer. Time-poor. Technically ordinary (WhatsApp is their benchmark).

**Primary device split**: Desktop to *create*, mobile to *view*. Coaches consume plays on phones at the pitch, outdoors, in daylight, often mid-session with gloves on.

**Job-to-do**: Communicate a play to their players faster than a verbal explanation. Tool works if a player can understand the play just from watching the animation.

---

## Primary User Journey

1. **Create** (desktop): Open editor → place players on pitch → add frames → animate play → save
2. **View** (mobile): Receive link in WhatsApp → tap link → watch animation without pinch-zoom → understand play
3. **Share** (any device): Generate shareable link or GIF → send to team group chat

---

## Known Friction Points (From Earlier Sessions & UX Audits)

✓ **Mobile scaling fixed** (Phase 1, 2026-04-18) — ShareViewer now fits without pinch-zoom  
⚠️ **Landing page unclear value** — Does a first-time visitor understand what the tool does in 10 seconds?  
⚠️ **Onboarding friction** — New users encounter blank canvas; no guided tutorial in v1  
⚠️ **Gallery discoverability** — Public gallery exists but how do coaches find inspiration?  
❓ **Export friction** — GIF export is mentioned but is it easy? Do coaches use it?  
❓ **Team sharing** — Does the link-share workflow actually match how coaches communicate? (WhatsApp group, email, Slack, etc.)  
❓ **Offline usage** — Tool is web-only; can a coach use it at a pitch with poor connectivity?  

---

## Friction Analysis Framework

For each flow stage, ask:

**Desktop Create**:
- How does a first-time user get past the blank canvas?
- Are the pitch markings (Union, League, Touch) obvious?
- Is the player-placement UI intuitive? (Drag-and-drop works, but is it discoverable?)
- Do coaches understand what "frame" means?
- Is the save/cloud flow scary? (Authentication?)
- Can a coach export a GIF quickly, or is it buried?

**Mobile View**:
- Does the animation autoplay or does the user tap to start? (Confusion risk)
- Can they replay easily, or is there friction in the UI?
- On gloved touch, are buttons/controls big enough? (44px minimum re-enforced in audit)
- Does the animation render clearly in bright sunlight? (Color contrast at high brightness?)

**Share**:
- Is generating a share link obvious? (Does it appear in the "done" flow?)
- Can coaches copy it and paste into WhatsApp in < 5 seconds?
- Does the shared link feel secure, or do coaches worry about privacy?

---

## Feature Design Approach

Once you've identified friction, propose features like:

- **Onboarding tutorial** (guided arrow-click flow for first-time users)
- **Template library** (pre-built plays coaches can remix — addresses blank canvas paralysis)
- **Offline mode** (local storage, sync when online)
- **Mobile editor lite** (drag players on mobile for quick edits on the sideline)
- **AI play suggestion** (given a field setup, suggest standard plays — addresses creativity friction)
- **Analytics/replay insights** (show coaches their most-watched plays, helps them iterate)
- **Collaborative editing** (multiple coaches edit same play in real-time)
- **Direct messaging** (in-app chat instead of WhatsApp handoff)

---

## Recommended Session Flow

1. **Map the journey** (30 min)
   - Walk through the create → view → share flow as a first-time user
   - List every click, wait, and moment of ambiguity
   - Note: use the *actual* app, not the spec — lived experience reveals friction the spec doesn't

2. **Validate friction against brand** (20 min)
   - Each friction point: does it conflict with "direct", "tactical", or "grassroots"?
   - Example: If authentication feels corporate, that's a brand friction too

3. **Brainstorm features** (20 min)
   - For each friction, propose 2 features that could fix it
   - Estimate effort (small/medium/large)
   - Map to roadmap priority (Phase 2? Phase 3? Post-launch?)

4. **Prototype or spec the top 1–2 features** (remaining time)
   - If design is clear: create a wireframe or Figma mockup
   - If design needs thinking: write a SpecKit spec outline

---

## Openings for New Features

Based on the roadmap + brand direction:

**Phase 2 extensions** (could ship with or immediately after landing page):
- Template library (reduces blank canvas friction)
- Onboarding tutorial (guided first-session)
- Mobile editor lite (edit on sideline)

**Phase 3 exploration** (post-launch, post-UAT):
- AI play suggestion (given formation, suggest standard plays)
- Analytics dashboard (replay heatmap, most-watched plays)
- Offline mode (local storage, PWA)

**Post-launch (Phase 4+)**:
- Collaborative editing
- Video integration (sync animation with actual match footage)

---

## Execution Notes

- **Start from user empathy, not feature ideas** — friction first, features second
- **Test against the stated use case** — every feature should make it faster/easier for a coach to communicate a play
- **Keep "grassroots" in mind** — no feature should require tech literacy beyond "tap, drag, share"
- **Reference `.impeccable.md`** — design direction should inform feature shape and UX, not be bolted on after
- **Spec template**: `docs/authority/.specify/templates/spec-template.md` if you decide to write a full spec

---

## Quick Pre-Session Maintenance (Optional)

If time permits before diving deep:

Quick `/shape` + `/colorize` passes on P1 audit issues (estimated 20–30 min):
- Remove `rounded-*` from profile/admin form elements
- Swap `bg-white` in editor components to `bg-surface`
- Fix `bg-black/50` overlays to `bg-primary/60`
- Add `font-heading` to auth page headings

This keeps the design system score healthy and gives you a clean slate for new feature design.

Audit report: `docs/issues/audit-2026-04-24-score-15-20.md`

---

## Resources

- **Design context**: `.impeccable.md`
- **Roadmap**: `docs/authority/ROADMAP.md`
- **SpecKit template**: `.specify/templates/spec-template.md`
- **Constitution (v3.4.1)**: `docs/authority/constitution.md`
- **Previous friction notes**: This document + git history
