# Spec 005: Quick Start Guide

**Created**: 2026-02-01  
**Purpose**: Get started with incremental improvements

---

## What Is This?

Spec 005 is a **backlog of 14 issues** discovered during verification of spec 004, plus your observations. Each issue is **risk-rated** so you can pick what to fix based on priority and available time.

**No pressure to complete everything.** This is designed for incremental improvements at your own pace.

---

## The 14 Issues at a Glance

### 🔴 CRITICAL (Fix Before Production) - 2 issues

**CRIT-001**: Save operations don't retry on network failures → **Users lose work**  
**CRIT-002**: Gallery doesn't retry on network failures → **Gallery fails to load**

**Both are quick fixes** (2-4 hours each) - just wire up existing retry logic.

---

### 🟠 HIGH (Major Features Broken) - 5 issues

**HIGH-001**: Navigation component exists but not integrated → **No site-wide navigation**  
**HIGH-002**: Safari/iOS users can't export animations → **30% of users affected**  
**HIGH-003**: Tackle equipment completely missing → **Promised feature doesn't exist**  
**HIGH-004**: No password reset → **Users get locked out permanently**  
**HIGH-005**: Can't share from editor → **Sharing only works from gallery**

---

### 🟡 MEDIUM (Annoying but Workable) - 5 issues

**MED-001**: Replay uses setTimeout instead of requestAnimationFrame → **Choppy playback**  
**MED-002**: Replay page lacks pitch markings → **Looks unprofessional**  
**MED-003**: No .env.staging file → **Can't deploy to staging**  
**MED-004**: Editor layout needs refinement → **Feels cramped**  
**MED-005**: Entity labeling could be clearer → **Slightly confusing**

---

### 🟢 LOW (Nice to Have) - 2 issues

**LOW-001**: Cone outline too thin → **Hard to see**  
**LOW-002**: PitchLayout type not defined → **TypeScript hygiene**

---

## Recommended First Steps

### Option 1: Critical Fixes Only (1 day)
1. Fix CRIT-001: Wire up retry logic to SaveToCloudModal (2-4 hours)
2. Fix CRIT-002: Wire up retry logic to gallery (2-4 hours)
3. Test thoroughly with network throttling
4. **Result**: Data loss risk eliminated

### Option 2: Critical + Quick Wins (2-3 days)
1. Fix both critical issues (1 day)
2. Fix HIGH-001: Add navigation (1 day)
3. Fix MED-003: Create .env.staging (1 hour)
4. Fix LOW-001: Thicken cone outline (30 min)
5. **Result**: Core reliability + better UX

### Option 3: User-Facing Features (1 week)
1. Fix both critical issues (1 day)
2. Fix HIGH-001: Add navigation (1 day)
3. Fix HIGH-004: Password reset (1-2 days)
4. Fix HIGH-005: Individual sharing (1-2 days)
5. **Result**: Complete authentication + sharing

---

## How to Pick an Issue

1. **Open** `specs/005-incremental-improvements/README.md`
2. **Browse** the issue backlog
3. **Pick** an issue based on:
   - Priority (🔴 > 🟠 > 🟡 > 🟢)
   - Available time (see effort estimates)
   - User impact (see plain English descriptions)
4. **Read** detailed description in `ISSUES_REGISTER.md`
5. **Implement** following the steps provided
6. **Validate** using the validation steps
7. **Update** `PROGRESS.md` with your work

---

## File Structure

```
specs/005-incremental-improvements/
├── README.md              ← Issue backlog with risk ratings
├── ISSUES_REGISTER.md     ← Detailed descriptions + validation steps
├── PROGRESS.md            ← Track your work
└── QUICK_START.md         ← This file
```

---

## Key Documents

### README.md
- Overview of all 14 issues
- Risk rating system explained
- Recommended approach
- Summary statistics

### ISSUES_REGISTER.md
- Detailed description for each issue
- Current vs expected behavior
- Files to modify
- Implementation steps
- Validation steps
- Success criteria

### PROGRESS.md
- Track which issues you're working on
- Log session notes
- Mark issues complete
- Note any blockers

---

## Risk Rating Explained

| Icon | Meaning | Plain English |
|------|---------|---------------|
| 🔴 | CRITICAL | Users lose data or can't use core features |
| 🟠 | HIGH | Major features broken or missing |
| 🟡 | MEDIUM | Annoying but not blocking |
| 🟢 | LOW | Nice to have, polish |

---

## Example Workflow

1. **Pick**: "I have 4 hours, let me fix CRIT-001"
2. **Read**: Open ISSUES_REGISTER.md → Find CRIT-001
3. **Code**: Follow implementation steps
4. **Test**: Follow validation steps
5. **Log**: Update PROGRESS.md with session notes
6. **Done**: Mark issue complete, pick next one

---

## Questions?

- **What if I find a new issue?** Add it to the backlog in README.md
- **What if an issue is harder than estimated?** Update the effort estimate
- **What if I can't fix an issue?** Note it as blocked in PROGRESS.md
- **Can I skip critical issues?** Not recommended - they're critical for a reason
- **Can I work on multiple issues at once?** Yes, but finish one before starting another

---

## Next Steps

1. ✅ Read this guide
2. ⏳ Review README.md to understand all issues
3. ⏳ Pick your first issue (recommend CRIT-001 or CRIT-002)
4. ⏳ Read detailed description in ISSUES_REGISTER.md
5. ⏳ Start coding!

---

**Remember**: This is incremental. No rush. Pick what matters most to you and your users.

Good luck! 🚀
