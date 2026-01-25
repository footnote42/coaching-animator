# Technical Investigations & Lessons

## Video Export Format Decision (24 January 2026)

### Investigation: MP4 Export via ffmpeg.wasm
**Duration:** 2 hours
**Outcome:** Blocked by CORS/cross-origin isolation requirements

**Technical Findings:**
- ffmpeg.wasm requires SharedArrayBuffer
- SharedArrayBuffer requires COOP/COEP headers
- CDNs don't provide necessary CORP headers
- Self-hosting requires server infrastructure changes
- **Conflicts with offline-first architecture principle**

**Decision:** Defer MP4 export to Phase 2
**Rationale:** 
- GIF export satisfies user need (shareable tactical diagrams)
- No deployment complexity
- Maintains offline-first requirement
- Allows faster iteration on coach feedback

**Phase 2 Consideration:**
If MP4 becomes critical based on user feedback, explore:
1. Deployment with proper CORS headers (Vercel configuration)
2. WebM with platform-specific guidance for conversion
3. Server-side conversion endpoint (violates offline-first)

### Key Lesson
Validate user need before pursuing technically complex solutions. "Works everywhere" > "Perfect format."

---

## WhatsApp Web GIF Playback Issue (25 January 2026)

### Investigation: GIF Not Animating on WhatsApp Web
**Duration:** Phase 2 - T010 Testing
**Status:** 🔴 ACTIVE INVESTIGATION

**Problem:**
- Exported GIF uploads successfully to WhatsApp Web
- Displays as static image (does not animate)
- File plays correctly in Chrome and Edge browsers
- File size: 1.30 MB (within WhatsApp limits)

**Current Configuration (gif.js):**
```typescript
const gif = new GIF({
    workers: navigator.hardwareConcurrency,
    quality: 10,
    width: 1280,
    height: 720,
    workerScript: '/gif-worker/gif.worker.js',
    // ❓ Missing: repeat parameter
});
```

**Root Cause Hypothesis (Ranked by Likelihood):**

1. **🔴 Missing NETSCAPE2.0 Loop Extension** (Most Likely)
   - gif.js may not add loop metadata by default
   - WhatsApp may require explicit loop count to treat file as animated
   - **Fix**: Add `repeat: 0` to GIF options (0 = infinite loop)

2. **🟡 Frame Disposal Method** (Possible)
   - Incorrect disposal may cause first frame to persist
   - gif.js default should be correct, but needs verification

3. **🟡 WhatsApp GIF Detection Heuristics** (Possible)
   - WhatsApp may have specific criteria for "animated GIF" detection
   - May require minimum frame count, duration, or file size thresholds

4. **🟢 File Size** (Unlikely - 1.3 MB is reasonable)
5. **🟢 Frame Timing** (Unlikely - 33ms delays are standard)

**Investigation Steps:**

**Step 1**: Add `repeat: 0` parameter (Quick Fix)
```typescript
const gif = new GIF({
    workers: workerCount,
    quality: quality,
    width: width,
    height: height,
    workerScript: '/gif-worker/gif.worker.js',
    repeat: 0, // 0 = infinite loop (NETSCAPE2.0 extension)
});
```

**Step 2**: Re-test on WhatsApp Web
- Export new GIF with loop metadata
- Upload to WhatsApp Web
- Verify animation plays

**Step 3**: If still fails, analyze GIF structure
```bash
# Use online tool or install gif-info
npm install -g gif-info
gif-info rugby-animation-spike-*.gif

# Check for:
# - NETSCAPE2.0 extension block
# - Loop count value
# - Frame disposal methods
```

**Step 4**: Compare with working GIF
- Download known-working GIF from giphy.com
- Compare metadata structure
- Identify missing/incorrect fields

**Alternative Libraries (If gif.js incompatible):**
- **modern-gif**: Modern alternative with better TypeScript support
- **gifenc**: Low-level encoder with more metadata control
- **gif-encoder-2**: Better NETSCAPE extension support

**Success Criteria:**
- [ ] GIF uploads to WhatsApp Web
- [ ] GIF animates/plays in chat
- [ ] GIF loops continuously
- [ ] Quality remains acceptable

**Next Actions:**
1. Implement `repeat: 0` fix in gifExportSpike.ts
2. Re-test on WhatsApp Web
3. Document results in gif-export-research.md
4. Update tasks.md T010 status
5. If resolved, proceed to Phase 3; if not, evaluate alternative libraries

### Performance Findings (Phase 2)

**✅ Encoding Performance: EXCEEDS REQUIREMENTS**
- 5-second animation: 18 seconds total (7s capture + 11s encoding)
- Extrapolated 20s animation: ~72 seconds
- **P1 requirement (<90s): ✅ MET**

**⚠️ Memory Usage: HIGH BUT ACCEPTABLE**
- Peak: 634.52 MB for 180-frame capture
- Acceptable for desktop browsers
- May need optimization for low-memory devices (future)

**✅ File Size: MEETS REQUIREMENTS**
- 1.30 MB for 5-second animation
- Extrapolated 20s: ~5.2 MB
- **P2 requirement (<10 MB): ✅ MET**

**✅ Visual Quality: ACCEPTABLE**
- Label legibility: ✅ Readable
- Color accuracy: Good
- Artifacts: Minor dithering (acceptable)
- Rating: 4/5