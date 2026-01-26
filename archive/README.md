# Archive Directory

This directory contains historical documents and superseded implementations from the coaching-animator project.

## Contents

### Cleanup Reports
- `CLEANUP_REPORT.md` - Project cleanup documentation (2026-01-23)

### Historical Documentation
- `HANDOFF.md` - Historical handoff documentation
- `KNOWN_ISSUES.md` - Historical known issues
- `manifest.json` - Archive metadata with move reasons

### Implementation Plans (Superseded)
- `implementation_plans/` - 21 archived phase plans and starter prompts

### GIF Export Research (2026-01-25)
- `gif-export-research.md` - Phase 2 research findings for GIF export feature
- `gif-export-plan.md` - Implementation roadmap for GIF export (7 phases, 26-35 hours)

**Rationale**: Documents superseded by actual implementation in Phase 5 (User Story 3 - Export Video).

### FFmpeg.wasm Investigation (Phase 2)

**Context**: MP4 export via ffmpeg.wasm was investigated but blocked by CORS/cross-origin isolation requirements.

**Technical Findings**:
- SharedArrayBuffer requires COOP/COEP headers
- CDNs lack CORP headers
- Conflicts with offline-first architecture

**Decision**: Deferred MP4 export to Phase 2; GIF export via gif.js satisfies user need with no deployment complexity.

**Artifacts**: No public/ffmpeg-core directory was created (investigation completed before file generation).

**Documentation**: See CLAUDE.md "Development Learnings" > "Video Export Format Decision (24 January 2026)"

---

## Why These Files Are Archived

Files are archived (not deleted) when they:
1. Provide historical context for decisions made
2. Document technical investigations and learnings
3. Are superseded by actual implementation
4. May be useful for future reference

---

## Retrieving Archived Files

All archived files are tracked in Git history. Use:
```bash
git log --follow -- archive/[filename]
```

To see the full history including when the file was moved.
