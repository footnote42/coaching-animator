# Hybrid Execution Plan

Based on the ROADMAP.md, ISSUES.md, and SpecKit framework, the project has been deconstructed into a granular delivery schedule. Tasks are bifurcated to maximize ROI: high-reasoning tasks go to Claude Code / Gemini, mid-tier tasks to mid-range models, and boilerplate/routine tasks to your Local LLM.

## Task Allocation & Delivery Schedule

| Sprint/Step | Task Description | Model Assignment | Status | Risk (1-10) | Dependency Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Core Loop & Layout** | Claude / Gemini | ✅ | 7 | **Completed**: Canvas, Remote, Share, Mobile Drawer. |
| **Sprint 2** | **Auth & Clarity** | Mid-Range / Local | ✅ | 4 | **Completed**: Profile redesign, Workflow clarity. |
| **Sprint 3** | **Debt, Security & Grid** | | | | |
| 3.1 | Refactor `Editor.tsx` (Phase 3a) | Claude Code | ✅ | 9 | **Completed**: LOC reduced 852 → 504. |
| 3.2 | `projectStore.ts` Optimization | Claude / Gemini | ✅ | 8 | **Completed**: 25 granular selectors. |
| 3.3 | Snap-to-Grid (Phase 2j) | Claude / Gemini | **Next** | 6 | **Ready**: Pulled forward. |
| 3.4 | Security Hardening (Phase 3b) | Claude / Gemini | Open | 9 | **Critical**: API protection & SQLi checks. |
| **Sprint 4** | **Launch Finalization** | | | | |
| 4.1 | E2E Core Loop Tests (Phase 3c) | Mid-Range | **In Flight** | 5 | **Active**: Stabilizing editor.spec.ts. |
| 4.2 | User Guide & Onboarding (Phase 2k) | Local LLM | Open | 2 | **Ready**: Inline help & pedagogy. |
| 4.3 | Performance & Audit (Phase 3e/3f) | Local LLM | Open | 3 | **Ready**: Lighthouse & audit remediation. |

---

## Critical Path Summary

These are the 3 most risky elements of the remaining pre-launch roadmap:

1. **Security Hardening & Rate Limiting (Risk: 9)**
   Implementing rate-limiting and securing Supabase RLS is non-negotiable before public launch. Errors here expose user data and platform integrity.
2. **Snap-to-Grid Integration (Risk: 6)**
   Injecting snap logic into the existing Konva/Zustand loop. Must ensure it doesn't break coordinate precision for non-snapped legacy data.
3. **E2E Test Reliability (Risk: 5)**
   Ensuring the CI gate is robust and doesn't flake due to modal race conditions or auth initialization delays. (Addressed in Phase 2i, but needs ongoing monitoring).

