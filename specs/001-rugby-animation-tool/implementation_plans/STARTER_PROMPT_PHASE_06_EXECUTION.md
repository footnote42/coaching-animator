# Starter Prompt: Phase 6 - User Story 4 Execution

**Role & Framework Alignment**
You are the implementation agent for the **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project:
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (The "What" and "Why")
   - [specs/001-rugby-animation-tool/plan.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/plan.md) (Tech stack and architecture)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Project status and completed work)
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens and aesthetic principles)
3. **Current Status:** Phases 1-5 complete (US1-US3 fully implemented). All P1 user stories delivered and verified.
4. **Execution Goal:** Implement **User Story 4 - Manage Multiple Frames** by adding a duration slider to frame thumbnails.

---

## Implementation Plan

**READ THIS FIRST:** [specs/001-rugby-animation-tool/implementation_plans/phase-06-us4.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/phase-06-us4.md)

The plan documents:
- ✅ What's already implemented (duplicate frame, update frame actions, navigation)
- ⏳ What needs to be added (duration slider UI)
- 📋 Detailed changes for 3 files (FrameThumbnail.tsx, FrameStrip.tsx, App.tsx)
- ✅ Verification steps and acceptance criteria

---

## Quick Summary

### What You Need to Implement

**Main Task:** Add an interactive duration slider to each frame thumbnail that adjusts per-frame transition times.

**Files to Modify:**
1. **FrameThumbnail.tsx** - Add Slider component with duration control
2. **FrameStrip.tsx** - Pass through duration change handler
3. **App.tsx** - Wire up handler to `updateFrame` store action

**Key Details:**
- Slider range: 0.1s to 10s (100ms to 10,000ms)
- Step: 0.1s (100ms increments)
- Update on change (immediate feedback)
- Constitution-compliant styling (sharp corners, monospace font, pitch green)

---

## Implementation Steps

### Step 1: Modify FrameThumbnail.tsx

Add duration slider below the current duration display:

1. Import `Slider` from `@/components/ui/slider`
2. Add `onDurationChange` prop to interface
3. Add local state for slider value (in seconds)
4. Render slider below duration text
5. Handle slider change → convert to ms → call `onDurationChange`
6. Apply Constitution styling (border-radius: 0, font-mono, pitch-green)

**Key Code:**
```typescript
const [durationSeconds, setDurationSeconds] = useState(frame.duration / 1000);

const handleDurationChange = (value: number[]) => {
  const seconds = value[0];
  setDurationSeconds(seconds);
  onDurationChange(frame.id, seconds * 1000); // Convert to ms
};
```

### Step 2: Modify FrameStrip.tsx

1. Add `onDurationChange` to props interface
2. Pass prop to each `FrameThumbnail`

### Step 3: Modify App.tsx

1. Add `updateFrame` to store destructuring (line 44)
2. Create `handleFrameDurationChange` handler
3. Pass to `FrameStrip` as `onDurationChange` prop (line 282)

**Handler:**
```typescript
const handleFrameDurationChange = (frameId: string, durationMs: number) => {
  updateFrame(frameId, { duration: durationMs });
};
```

### Step 4: Verify Implementation

**Build Check:**
```bash
npm run build
```

**Browser Tests:**
```bash
npm run dev
```

Run all verification tests from the implementation plan:
1. Test duration slider (adjust to 0.1s, 3.0s, play animation)
2. Test duplicate frame (copy frame with entities)
3. Test prev/next navigation (arrow buttons)
4. Test persistence (save/load with custom durations)

**Acceptance Criteria:**
- [ ] AC-3: Duplicate frame creates exact copy
- [ ] AC-5: Duration slider updates transition time

---

## Constitution Compliance Checklist

From [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md):

- [ ] **Sharp corners**: Slider uses `border-radius: 0` (not rounded)
- [ ] **Monospace font**: Duration value uses `font-mono` class
- [ ] **Pitch Green**: Slider track/thumb uses `bg-pitch-green` or primary color
- [ ] **No drop shadows**: Slider uses borders for visual separation
- [ ] **Immediate feedback**: Updates on `onValueChange`, not `onValueCommit`

---

## Success Criteria

**Phase 6 is complete when:**
1. All 5 User Story 4 acceptance criteria pass
2. Duration slider adjusts frame transition times in real-time
3. Changes persist through save/load cycle
4. `npm run build` completes with no errors
5. All browser verification tests pass
6. Constitution aesthetic maintained

---

## Key Files Reference

### Source Files
- **FrameThumbnail**: [src/components/Timeline/FrameThumbnail.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/FrameThumbnail.tsx)
- **FrameStrip**: [src/components/Timeline/FrameStrip.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/FrameStrip.tsx)
- **App**: [src/App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)
- **Slider UI**: [src/components/ui/slider.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/ui/slider.tsx)
- **Store**: [src/store/projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)

### Constants
- **Validation**: [src/constants/validation.ts](file:///c:/Coding%20Projects/coaching-animator/src/constants/validation.ts)
  - `VALIDATION.FRAME.DURATION_MIN_MS` = 100
  - `VALIDATION.FRAME.DURATION_MAX_MS` = 10000

---

## Next Steps After Completion

1. ✅ Mark Phase 1 tasks complete in task.md
2. ✅ Create walkthrough.md with screenshots
3. ✅ Update HANDOFF.md to mark User Story 4 complete
4. 📋 Consider moving to User Story 5 (Configure Player Tokens) or US9 (Playback Speed UI)

---

## Notes

- **Low Risk**: Most functionality already exists in the store
- **High Value**: Completes all P2 frame management features for US4
- **Quick Win**: Estimated 1-2 tasks, ~30-60 minutes
- **Slider Already Exists**: shadcn/ui Slider component is installed and working
- **No Breaking Changes**: Additive changes only, no modifications to existing functionality

---

**Ready to implement! Start with Step 1: FrameThumbnail.tsx**
