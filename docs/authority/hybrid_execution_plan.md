# Hybrid Execution Plan

Based on the ROADMAP.md, ISSUES.md, and SpecKit framework, the project has been deconstructed into a granular delivery schedule. Tasks are bifurcated to maximize ROI: high-reasoning tasks go to Claude Code / Gemini, mid-tier tasks to mid-range models, and boilerplate/routine tasks to your Local LLM.

## Task Allocation & Delivery Schedule

| Sprint/Step | Task Description | Model Assignment | Risk (1-10) | Logic/Reasoning | Dependency Status | Parallelism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Core Launch Readiness** | | | | | |
| 1.1 | Canvas Scaling & Pitch SVG (PITCH-001/2) | Claude / Gemini | 7 | Complex coordinate math and state mapping. | **Foundational**: Core visual grid. | **Sequential**: Blocks 1.2. |
| 1.2 | Floating Playback Remote (PLAYBACK-001) | Claude / Gemini | 6 | Cross-component draggable state. | **Dependent**: Needs stable canvas bounds. | **Sequential**: Follows 1.1. |
| 1.3 | Share Workflow (FLOW-001, GALLERY-002) | Mid-Range | 5 | Routing and Web Share API. | **Foundational**: Critical for core loop. | **Parallel**: Independent of UI polish. |
| 1.4 | Entity Styling & Palette (EDITOR-004/9) | Local LLM | 3 | Isolated UI/CSS modifications. | **Independent**: Purely cosmetic. | **Parallel**: Run anytime. |
| **Sprint 2** | **Launch Polish** | | | | | |
| 2.1 | Auth Indicator & Playbook Filters (UX-005) | Mid-Range | 4 | CRUD array filtering. | **Independent**: Standard feature add. | **Parallel**: Run anytime. |
| 2.2 | Legal Docs & Cookie Banner (LEGAL-001) | Local LLM | 2 | Markdown & boilerplate components. | **Foundational**: Launch requirement. | **Parallel**: Run anytime. |
| 2.3 | User Guide & Onboarding (Phase 2h) | Local LLM | 2 | Documentation & tooltips. | **Independent**: Content-heavy. | **Parallel**: Run anytime. |
| **Sprint 3** | **Debt & Security (Pre-Beta)** | | | | | |
| 3.1 | Refactor `Editor.tsx` (Phase 3a) | Claude Code | 9 | Architectural redesign of core massive file. | **High Foundation**: Blocks 3.2. | **Sequential**: Blocking step. |
| 3.2 | `projectStore.ts` Optimization (Phase 3a) | Claude / Gemini | 8 | Performance tuning (selectors). | **Dependent**: Requires refactored state. | **Sequential**: Follows 3.1. |
| 3.3 | Security Hardening (SEC-001, SEC-002) | Claude / Gemini | 9 | API protection & SQLi checks. | **Foundational**: Non-negotiable safety. | **Parallel**: Independent of UI. |
| **Sprint 4** | **Tests & Final Polish** | | | | | |
| 4.1 | E2E Core Loop Tests (Phase 3c) | Mid-Range | 5 | Standard test logic for full flow. | **Dependent**: Needs stable core loop. | **Sequential**: Follows Sprint 3. |
| 4.2 | Entity Z-Order Control (FEAT-006) | Mid-Range | 5 | JSON schema & layer UI updates. | **Independent**: Functional enhancement. | **Parallel**: Run anytime. |
| 4.3 | Unit Tests for Pure Functions | Local LLM | 2 | Routine boilerplate generation. | **Independent**: Isolated logic. | **Parallel**: Run anytime. |
| 4.4 | Lighthouse Audit Fixes (PERF-001) | Local LLM | 3 | HTML/CSS web vitals tuning. | **Independent**: Final polish. | **Parallel**: Run anytime. |

---

## Critical Path Summary

These are the 3 most risky elements of the remaining pre-launch roadmap that require close monitoring and should strictly be handled by the **Primary Agent (Claude Code/Gemini)**:

1. **`Editor.tsx` & Store Refactoring (Risk: 9)**
   Decomposing an 853-line core component while simultaneously optimizing Zustand selectors threatens the fundamental editing loop. If state desyncs during this refactor, the canvas will break. This must be heavily monitored and gated by manual verification at every step.
2. **Security Hardening & Rate Limiting (Risk: 9)**
   Implementing rate-limiting, securing Supabase RLS, and protecting free-text fields against SQL injection is non-negotiable before public launch. Errors here expose user data and platform integrity.
3. **Canvas Scaling & Pitch Math (Risk: 7)**
   Ensuring the pitch SVG markings map perfectly to coordinates across varying viewport sizes (desktop editor vs. mobile share view) is geometrically complex. If the scaling math is off, players on mobile devices will see broken tactical positions, entirely undermining the product's credibility.
