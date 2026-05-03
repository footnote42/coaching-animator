# Personal AI Collaboration Protocol
**Date**: 2026-05-03
**Derived from**: coaching-animator Phase 0-2 retrospective

---

## Ownership Tally

| Ownership Type | Count | % |
|----------------|-------|---|
| AI-originated, accepted | 9 | 24% |
| AI-originated, shaped | 5 | 14% |
| Human-directed, AI-executed | 20 | 54% |
| Collaborative | 3 | 8% |
| **Total** | **37** | **100%** |

**Signal**: The headline ratio (54% human-directed) overstates directing strength — the 24% accepted and 14% shaped categories cluster around the architectural and implementation-detail decisions that carry the most structural consequence.

---

## My AI Dependency Signatures

*(Contexts where I consistently defer to AI instead of directing)*

1. **Technical decomposition without pre-drawn boundaries.** When asked to decompose a monolith or split a component, I let AI scan the codebase and name the boundaries (hook names, groupings, scope of each unit) before I have articulated the boundaries myself. The four-way Editor.tsx hook split, the `useEffect` retention decision, and the state-ownership routing across hooks were all AI-resolved without a recorded developer view.

2. **Implementation-detail disambiguation accepted silently.** When AI research docs resolve a contested implementation detail mid-research — coordinate system model, persistence asymmetry between sidebar and Focus Mode, canvas measurement basis — I accept the resolution without recording whether I agreed with the reasoning or simply didn't notice the decision was being made.

3. **Menu-of-choices selection in place of originating a constraint.** For several UI structure decisions (collapsible sidebar mode, Focus Mode scope, mobile drawer content), I selected from an AI-generated option list rather than arriving with a constraint of my own. The selection is real but the origination was not mine.

4. **Scope expansion driven by AI proposal rather than stated user need.** The v1 scope grew from 7 Phase 2 tasks to 12+ specs across ROADMAP versions, with Phase 4 features pulled forward, without a developer-authored cost/benefit note. Additions were reactive to what AI surfaced in clarification sessions rather than traceable to a named user behaviour.

5. **Methodology adoption without independent validation.** When AI proposed the PM/Architect framing for the 2026-04-28 ROADMAP audit, I approved the process and accepted the conclusions without a recorded independent check on whether the audit's framing of scope drift was accurate.

---

## My Genuine Directing Strengths

*(Patterns where I set direction well and AI executed)*

1. **Product strategy and access model.** The cloud-first pivot, tiered access model (Guest/Auth/Org), primary usage pattern (desktop edit / WhatsApp share to players), and mobile editor deferral were all articulated with explicit rationale before AI touched the spec. These are the most consequential decisions in the project and they are fully human-originated.

2. **Domain knowledge in rugby.** Pitch marking defect diagnosis (H-posts, 5m markers, phantom lines, dashed 22m, grey try lines) was precise and technical. The 6-colour palette was justified by kit reality worldwide. Grid resolution was tied to real pitch zones (5m/10m/22m). APES framework content was named by the developer. AI could not have originated any of these without being handed the constraint.

3. **Brand and aesthetic identity.** The Oswald + cream palette brief, the "coaching whiteboard tradition, anti-SaaS" positioning, the amber CTA rule, and the `border-radius: 0` commitment were authored in `.impeccable.md` before any implementation. When enforcement drifted (amber proliferation, radius inconsistencies), the developer caught and corrected it.

4. **Constitutional constraints and governance corrections.** The OAuth provider correction (identifying and fixing the prior prohibition on Google/Apple/GitHub) and the no-telemetry/no-advertising constraints reflect authorship, not selection. The developer identified an error in a prior ruling and personally corrected the authoritative documents.

5. **Scope discipline through explicit deferral.** Auth state indicator parked with a named reason. Mobile editor deferred to v2 with an explicit rationale. Snap-to-grid defaulted OFF with a stated "power user opt-in" principle. These are cases where AI offered and the developer actively declined or constrained, which is a different and stronger pattern than selection from a menu.

---

## The Protocol

*(Rules in "Before asking AI to [X], I will first [Y]" format)*

Before asking AI to propose an architecture or design, I will first:
→ Sketch the key boundaries myself — even informally — and write down what the design MUST NOT do. If I can't name one thing the design must not do, I'm not ready to commission it.

Before asking AI to generate a spec or plan, I will first:
→ Write one paragraph in my own words describing the problem and the constraint that makes it non-trivial. If I can't write that paragraph, I'm not ready to generate the spec.

Before accepting AI's proposed implementation approach, I will first:
→ Ask myself: "Can I explain this approach to a coaching colleague in plain language?" If no, ask AI to explain the trade-offs before accepting.

Before asking AI to refactor or restructure code, I will first:
→ State the specific reason the current structure is wrong — the symptom, not just "it feels messy". AI can't make good refactoring decisions without that constraint.

Before adding a new phase or feature to the roadmap, I will first:
→ Name the specific user behaviour or pain point that makes this necessary. If I can only describe it as "would be nice" or "AI suggested it", park it.

Before moving on from a completed phase, I will first:
→ Write one sentence naming the most important thing I learned from this phase that I didn't know before. If I can't name it, I moved too fast.

Before accepting an AI research document's conclusion on an implementation detail, I will first:
→ Read the section where the decision is made and ask: "Did I author this constraint, or did AI resolve it for me?" If the latter, record a brief note on whether I agree with the reasoning or am accepting it on trust.

---

## Decisions Log

*(Evidence from the archaeology — fill in as you read)*

| Decision | Phase/Spec | Ownership | Understanding | Note |
|----------|-----------|-----------|---------------|------|
| Cloud-first pivot: removed offline/localStorage persistence model in favour of Supabase-required architecture | PRD v2.0 §1.2.1 | Human-directed, AI-executed | Full | Developer cited Hampshire RFU partnership and org tiers as explicit rationale; AI documented and flagged UX regression risks |
| Tiered access model (Guest Tier 0 = 10 frames, Auth Tier 1 = cloud storage, Org Tier 4) | Constitution v3.4 / PRD §1 | Human-directed, AI-executed | Full | Developer drove the tier structure and frame limits; constitutional constraints were authored with clear intentionality |
| Primary usage pattern: desktop edit / mobile view (WhatsApp share link to players) | Phase 0 — project direction interview | Human-directed, AI-executed | Full | Developer articulated the pattern explicitly; AI structured around it; no AI shaping of this core product decision |
| Deferred mobile editor to v2; mobile replay is v1 blocker | Phase 0 — project direction interview | Human-directed, AI-executed | Full | Developer classified tiers of mobile fidelity; AI accepted the scope boundary cleanly |
| `position:fixed; inset:0` layout for ShareViewer — full-screen, no-scroll canvas | Phase 1 / 001-fix-share-scaling | AI-originated, shaped | Partial | AI proposed fixed-inset; developer accepted but later discovered interaction with root Navigation sibling — now documented as a protected invariant; thin understanding of tradeoffs at acceptance |
| 4:3 aspect ratio for canvas locked to pitch proportions | Phase 1 / 001-fix-share-scaling | Collaborative | Partial | Rugby pitch shape drove the ratio, but exact implementation (ResizeObserver fitting to container) was AI-proposed and accepted |
| Entity layer scaleX/scaleY transform for mobile coordinate mapping | Phase 1 / 001-fix-share-scaling | AI-originated, accepted | Thin | Bug was discovered mid-implementation; fix was AI-proposed; developer accepted without fully auditing the coordinate system model |
| Oswald headings + cream palette as brand aesthetic — "coaching whiteboard tradition, anti-SaaS" | Phase 2 T3 / 002-landing-rebrand | Human-directed, AI-executed | Full | Developer ran `/impeccable teach`, wrote the `.impeccable.md` brief personally, and specified "tactical, direct, grassroots" direction; AI implemented to spec |
| Amber as the single CTA accent colour; no amber on non-CTA elements | 002-landing-rebrand | Human-directed, AI-executed | Full | Explicit in the .impeccable.md brief; developer enforced it when audit found "amber proliferation" |
| `border-radius: 0` across all UI surfaces as a design system rule | Constitution v3.4 / design tokens | Human-directed, AI-executed | Partial | Developer committed to the square aesthetic, but the audit cycle to enforce it (15/20 → remediation) suggests the implication across all surfaces was not fully anticipated |
| Technical debt refactor: extract 4 domain hooks from Editor.tsx monolith | Phase 3a / 004-technical-debt-refactor | Collaborative | Full | Developer identified the monolith as a problem and specified the decomposition goal; AI proposed the specific hook boundary design (entity/playback/progression/contextMenu split); developer accepted the granularity |
| 25 granular Zustand store selectors replacing 2 broad destructures | Phase 3a / 004-technical-debt-refactor | AI-originated, accepted | Partial | AI identified the re-render storm pattern and proposed selector granularity; developer accepted; understanding of Zustand selector semantics was partial at acceptance time |
| Mini-pitch SVG from first-frame entity data (no thumbnail generation or storage) | Phase 2f / 009-gallery-playbook | Human-directed, AI-executed | Full | Developer answered the clarification question directly and definitively; clear cost/complexity reasoning |
| Progression strip: always-visible compact horizontal strip (no expand/collapse) | Phase 2f / 009-gallery-playbook | Human-directed, AI-executed | Full | Developer chose this from a multi-option clarification; deliberate UX tradeoff |
| Endorsement system (FEATURE-001) pulled forward from Phase 4 into Phase 2f | Phase 2f / 009-gallery-playbook | Human-directed, AI-executed | Full | Developer decision; HANDOFF notes it was delivered silently without "pulled forward" marking — hygiene gap identified in the 2026-04-28 audit |
| Auth state indicator (UX-005) parked as potentially redundant | Phase 2g / 010-auth-profile | Human-directed, AI-executed | Full | Developer actively chose to defer; reasoning documented clearly (My Playbook nav link already signals auth state) |
| Collapsible sidebar: fully hidden with chevron reveal (not icon-only) | Phase 2i / 012-editor-workspace-remodel | Human-directed, AI-executed | Partial | Developer answered the design question in the 2026-04-28 prompt; rationale not fully documented — may have been AI suggestion accepted via option list |
| Focus Mode hides sidebar only (not footer PlaybackControls) | Phase 2i / 012-editor-workspace-remodel | Human-directed, AI-executed | Partial | Similar to above — answered from a clarification menu; tradeoffs not deeply explored |
| Snap-to-grid defaults OFF; grid overlay is a separate toggle | Phase 2j / 013-snap-to-grid | Human-directed, AI-executed | Full | Developer specified "power user opt-in"; consistent with not cluttering the editor for new users |
| Grid resolution: pitch-marking-relative (5m/10m/22m zones) rather than arbitrary pixel grid | Phase 2j / 013-snap-to-grid | Collaborative | Partial | ROADMAP audit surfaced the option; developer answered, but understanding of the coordinate translation complexity (pitch-relative vs pixel-absolute) is uncertain |
| APES framework (Active, Purposeful, Enjoyable, Safe) as coaching pedagogy content | Phase 2k / 014-user-guide | Human-directed, AI-executed | Full | Developer specified the coaching framework by name; AI wrote the documentation content |
| Roadmap reconciliation methodology: doc-first audit then ROADMAP v3.1 rewrite | Phase 0 / 2026-04-28 audit | AI-originated, shaped | Partial | AI proposed the PM/Architect audit framing; developer approved the methodology; the extent to which the audit conclusions were independently validated by the developer is unclear |
| OAuth provider allowlist (Google/Apple/GitHub only; Facebook/Meta/Twitter prohibited) | Constitution §V.2.3 / CA-2026-001 | Human-directed, AI-executed | Full | Developer identified the error in the prior prohibition and personally corrected both CLAUDE.md and ROADMAP; clear authorship |
| `EntityColors` service as mandatory single source of truth for all entity colours | CLAUDE.md / design system | AI-originated, shaped | Partial | Service design originated in AI-proposed refactor; developer accepted and elevated to a constitutional rule; the "mandatory" enforcement posture reflects genuine ownership |
| Hook boundary names and groupings (`useEditorEntityHandlers`, `useEditorPlaybackHandlers`, `useEditorProgressionHandlers`, `useEditorContextMenuHandlers`) | 004-technical-debt-refactor / research.md R1 | AI-originated, accepted | Partial | Research doc records AI scanning Editor.tsx and identifying handler clusters before naming the hooks; developer specified the goal (decompose the monolith) but the four-way split and each hook's exact scope came from the AI's codebase scan |
| `useEffect` hooks retained in `Editor.tsx` rather than extracted | 004-technical-debt-refactor / research.md R3, plan.md | AI-originated, accepted | Partial | The decision to leave all 4 effects in Editor.tsx was reasoned in the AI plan doc; it reads as AI resolving a design edge case rather than a developer-directed call |
| `showGuestLimitModal` state owned by entity handlers hook; setter passed as param to playback hook | 004-technical-debt-refactor / research.md R4 | AI-originated, accepted | Thin | State ownership routing across hooks is an architectural micro-decision; plan shows AI proposed the arrangement with no recorded developer deliberation |
| Rugby pitch SVG rewritten from scratch (not patched) preserving 2000×1400 canvas | 005-editor-canvas / research.md PITCH-001 | Human-directed, AI-executed | Full | Developer specified all five marking defects (H-posts, 5m markers, phantom lines, dashed 22m, grey try lines) in detail; the diagnosis was precise and domain-specific; AI executed the rewrite to spec |
| Tactical 6-colour palette: Red/Blue/White/Yellow/Green/Black (replacing 12-colour attack/defence/neutral set) | 005-editor-canvas / research.md EDITOR-009 | Human-directed, AI-executed | Full | Spec explicitly required "exactly 6 colours"; developer cited "decision paralysis" as the reason to reduce; colour semantics (rugby kit worldwide) were stated in the rationale, suggesting genuine domain knowledge |
| Colour semantics are a UI concern (`TACTICAL_PALETTE`), not a domain concern (`EntityColors` service defaults) | 005-editor-canvas / research.md EDITOR-009 | AI-originated, accepted | Partial | The architectural separation between the picker palette and EntityColors service defaults was articulated in the AI research doc; developer accepted the distinction without recorded deliberation on the tradeoff |
| Tackle shield and tackle bag redesigned as Konva primitives (whiteboard-style shapes) rather than SVG imports | 005-editor-canvas / research.md EDITOR-005 | Human-directed, AI-executed | Full | Developer articulated "whiteboard-recognizable shapes" as the design goal; AI proposed the Konva rect-plus-notch implementation |
| Team selector removed from EntityProperties post-creation; team is implicit at entity creation | 005-editor-canvas / research.md EDITOR-008 | Human-directed, AI-executed | Full | Developer identified the control as confusing (colour override not visible); removal rationale is well-reasoned and domain-aware |
| Collapsible sidebar persists to localStorage; Focus Mode does NOT persist (session-level) | 012-editor-workspace-remodel / research.md Area 1, Area 2 | AI-originated, accepted | Thin | Persistence asymmetry appears in the AI research doc without developer-authored rationale; the distinction between "session preference" and "persistent preference" reads as AI taxonomy accepted implicitly |
| Focus Mode canvas area calculated as 100% of viewport container (not 85% of canvas element) | 012-editor-workspace-remodel / research.md Area 2 | AI-originated, accepted | Thin | Research doc contains the AI's own SC-001 re-interpretation (correcting the spec criterion mid-research); developer acceptance of this re-interpretation is unrecorded |
| Mobile drawer includes EntityPalette and ProjectActions but excludes EntityProperties | 012-editor-workspace-remodel / research.md Area 5 | AI-originated, accepted | Partial | Research doc attributes this to "spec Assumption" — scope defined in the spec, but the rationale ("entity editing on mobile is secondary use case") reads as AI-supplied; no developer voice on this tradeoff |
| Scope expansion from Phase 2 (7 tasks, 2026-04-19) to v1 launch definition (12+ specs, 2026-04-25) with pulled-forward Phase 4 features | ROADMAP 2026-02-21 → 2026-04-19 → 2026-04-25 | AI-originated, shaped | Partial | Phase 2 scope grew significantly across ROADMAP versions; endorsement system (Phase 4) pulled forward into Phase 2f without recorded developer-led cost/benefit analysis; scope additions appear reactive to AI proposals in clarification sessions rather than from a stated user need |
| ROADMAP v3.1 audit methodology introduced mid-project to reconcile doc-code drift | ROADMAP 2026-04-25 / 2026-04-28 audit | AI-originated, shaped | Partial | The "PM and Architect reviewing their own notes" framing for the reconciliation audit was AI-proposed; developer approved the process; the degree to which audit conclusions were independently challenged is unclear |
