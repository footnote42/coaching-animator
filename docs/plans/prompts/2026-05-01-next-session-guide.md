# Next Session: Cosmetic Polish & Security Hardening

Continue the development of **Coaching Animator** by addressing the remaining polish items and starting the security audit.

## Context
Phase 2k (User Guide) is complete. The application now has a functional help system and onboarding flow. The rugby ball has been correctly documented as a "White oval token".

## Priority Tasks
1. **Phase 2l — Cosmetic Polish**:
    - Obtain and integrate the Hampshire RFU endorsement icon asset (<50 KB).
    - Review and fix landing page copy (LANDING-001..004).
    - Ensure My Playbook cards have full layout parity with Public Gallery cards (MYPLAYBOOK-001/002).
2. **Phase 3b — Security Hardening**:
    - Implement rate limiting on API endpoints (SEC-002).
    - Audit free-text fields for SQL injection and XSS (SEC-003).

## Verification
- Run `npm run lint` and `npx tsc --noEmit` before any push.
- Run `npm test -- --run` to ensure no regressions in logic.

## Reference
- ROADMAP.md (v3.2)
- ISSUES.md
- HANDOFF.md
