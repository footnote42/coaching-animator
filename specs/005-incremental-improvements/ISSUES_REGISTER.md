# Issues Register: Incremental Improvements

**Spec**: 005-incremental-improvements  
**Created**: 2026-02-01  
**Purpose**: Detailed issue descriptions with validation steps

---

## 🔴 CRITICAL Issues

### CRIT-001: Save Operations Have No Retry Logic

**Risk**: 🔴 CRITICAL  
**Impact**: 💾 Data Loss  
**Effort**: Low (2-4 hours)

#### Description
The `SaveToCloudModal` component uses direct `fetch()` calls instead of the retry wrapper. When network requests fail (timeout, 500 error, etc.), users lose their work permanently.

The retry logic exists in `lib/api-client.ts` with exponential backoff, but it's not being used.

#### Current Behavior
1. User creates animation in editor
2. User clicks "Save to Cloud"
3. Network request fails (timeout, server error, etc.)
4. Error message shown
5. **Work is lost** - no retry attempted

#### Expected Behavior
1. User creates animation in editor
2. User clicks "Save to Cloud"
3. Network request fails
4. System automatically retries up to 3 times with exponential backoff
5. Only shows error if all retries fail
6. User's work is saved successfully

#### Files to Modify
- `components/SaveToCloudModal.tsx`

#### Implementation Steps
1. Import `postWithRetry` and `putWithRetry` from `lib/api-client.ts`
2. Replace direct `fetch()` calls with retry wrappers
3. Update error handling to show retry attempts
4. Add loading state during retries

#### Validation Steps
1. Open editor, create animation
2. Open browser DevTools → Network tab
3. Enable "Offline" mode
4. Click "Save to Cloud"
5. Verify: Error message shows retry attempts
6. Disable "Offline" mode during retry
7. Verify: Save succeeds after network restored

#### Success Criteria
- ✅ Save operations retry on network failures
- ✅ User sees retry progress (e.g., "Retrying... (1/3)")
- ✅ Save succeeds after temporary network issues
- ✅ Error only shown after all retries exhausted

---

### CRIT-002: Gallery Fails on Network Issues

**Risk**: 🔴 CRITICAL  
**Impact**: 🚫 Feature Broken  
**Effort**: Low (2-4 hours)

#### Description
The gallery page uses direct `fetch()` calls instead of the retry wrapper. When network requests fail, the entire gallery fails to load instead of retrying.

#### Current Behavior
1. User navigates to /gallery
2. Network request fails (slow connection, server hiccup)
3. Gallery shows error or blank page
4. User must manually refresh

#### Expected Behavior
1. User navigates to /gallery
2. Network request fails
3. System automatically retries up to 3 times
4. Gallery loads successfully after retry
5. Only shows error if all retries fail

#### Files to Modify
- `app/gallery/page.tsx`

#### Implementation Steps
1. Import `fetchWithRetry` from `lib/api-client.ts`
2. Replace fetch calls with retry wrapper
3. Add loading state during retries
4. Update error handling

#### Validation Steps
1. Open /gallery page
2. Open browser DevTools → Network tab
3. Throttle network to "Slow 3G"
4. Refresh page
5. Verify: Gallery loads after retries
6. Set network to "Offline"
7. Refresh page
8. Verify: Error shown only after retries exhausted

#### Success Criteria
- ✅ Gallery retries on network failures
- ✅ Gallery loads on slow/unstable connections
- ✅ Loading indicator shows during retries
- ✅ Error only shown after all retries fail

---

## 🟠 HIGH Priority Issues

### HIGH-001: No Site-Wide Navigation

**Risk**: 🟠 HIGH  
**Impact**: 😕 UX Issue  
**Effort**: Medium (1 day)

#### Description
The `Navigation` component exists in `components/Navigation.tsx` and includes role-based links (Editor, Gallery, My Gallery, Profile, Admin), but it's not integrated into any page layouts. Users must use browser back button or manually type URLs.

#### Current Behavior
- No navigation bar on any page
- Users can't easily navigate between pages
- Feels like disconnected pages, not a cohesive app

#### Expected Behavior
- Navigation bar visible on all pages
- Shows appropriate links based on user role (guest vs authenticated vs admin)
- Consistent navigation experience across site

#### Files to Modify
- `app/layout.tsx` - Add Navigation to root layout
- `app/(auth)/layout.tsx` - Add simplified Navigation to auth pages
- `app/app/page.tsx` - Ensure Navigation visible in editor

#### Implementation Steps
1. Import `Navigation` component in each layout
2. Add `<Navigation />` at top of layout
3. Test with different user roles (guest, authenticated, admin)
4. Adjust styling if needed for different pages

#### Validation Steps
1. **As Guest**:
   - Visit / (home) - verify "Sign In" and "Get Started" links visible
   - Visit /gallery - verify navigation present
   - Verify no authenticated-only links shown

2. **As Authenticated User**:
   - Visit /app - verify "Editor", "Gallery", "My Gallery", "Profile" links
   - Visit /gallery - verify same links
   - Visit /my-gallery - verify same links
   - Verify "Sign Out" link present

3. **As Admin**:
   - Verify "Admin" link visible
   - Verify all other links present

#### Success Criteria
- ✅ Navigation visible on all pages
- ✅ Links change based on user role
- ✅ Navigation styling consistent across pages
- ✅ Active page highlighted in navigation

---

### HIGH-002: Safari/iOS Users Can't Export Animations

**Risk**: 🟠 HIGH  
**Impact**: 🚫 Feature Broken  
**Effort**: High (2-3 days)

#### Description
The export functionality only generates WebM format, which Safari and iOS don't support. Approximately 30% of users (all Safari/iOS users) cannot export their animations at all.

#### Current Behavior
1. Safari/iOS user creates animation
2. User clicks "Export"
3. WebM file generated
4. Browser can't play or download WebM
5. **User cannot export their work**

#### Expected Behavior
1. System detects Safari/iOS browser
2. User clicks "Export"
3. System generates GIF or MP4 instead of WebM
4. User can download and view their animation

#### Files to Create/Modify
- `lib/browser-detect.ts` (new) - Detect Safari/iOS
- `src/hooks/useExport.ts` - Add GIF/MP4 export logic
- Export modal component - Show format based on browser

#### Implementation Steps
1. Create browser detection utility
2. Research GIF generation library (e.g., gif.js)
3. Research MP4 generation (may need server-side)
4. Implement fallback export logic
5. Update export UI to show format

#### Validation Steps
1. **On Chrome/Firefox**:
   - Export animation
   - Verify: WebM format generated
   - Verify: Video plays correctly

2. **On Safari (macOS)**:
   - Export animation
   - Verify: GIF or MP4 format generated
   - Verify: File downloads and plays

3. **On iOS Safari**:
   - Export animation
   - Verify: GIF or MP4 format generated
   - Verify: File downloads and plays

#### Success Criteria
- ✅ Safari users can export animations
- ✅ iOS users can export animations
- ✅ Export format appropriate for browser
- ✅ Exported files play correctly on all platforms

---

### HIGH-003: Tackle Equipment Feature Missing

**Risk**: 🟠 HIGH  
**Impact**: 🚫 Feature Broken  
**Effort**: High (3-4 days)

#### Description
Spec 004 claimed to implement tackle shields and tackle bags (T121-T126), but the feature is completely missing from the codebase. The types don't exist, rendering isn't implemented, and UI buttons aren't present.

#### Current Behavior
- No tackle-shield or tackle-bag entity types
- No orientation field on entities
- No tackle equipment buttons in entity palette

#### Expected Behavior
- Tackle shield entity type with 4-way orientation (up, down, left, right)
- Tackle bag entity type with 2 states (upright, fallen)
- Buttons in entity palette to add tackle equipment
- Visual rendering of tackle equipment on canvas

#### Files to Create/Modify
- `src/types/index.ts` - Add entity types and orientation field
- `src/components/Canvas/PlayerToken.tsx` - Add rendering logic
- `src/components/Sidebar/EntityPalette.tsx` - Add UI buttons
- `src/store/projectStore.ts` - Add spawn logic

#### Implementation Steps
1. Add `'tackle-shield' | 'tackle-bag'` to EntityType
2. Add `orientation?: 'up' | 'down' | 'left' | 'right'` to Entity interface
3. Implement tackle-shield rendering (rectangle with orientation)
4. Implement tackle-bag rendering (oval with upright/fallen states)
5. Add buttons to entity palette
6. Update spawn positions based on entity type

#### Validation Steps
1. Open editor
2. Verify: Tackle shield button in entity palette
3. Click tackle shield button
4. Verify: Tackle shield appears on canvas
5. Verify: Can rotate tackle shield (4 orientations)
6. Repeat for tackle bag
7. Verify: Can save and load animations with tackle equipment

#### Success Criteria
- ✅ Tackle shield and tackle bag entity types exist
- ✅ Visual rendering matches rugby equipment
- ✅ Orientation controls work correctly
- ✅ Equipment saves/loads correctly

**Alternative**: If this feature isn't needed, remove it from spec 004 documentation.

---

### HIGH-004: Password Reset Not Implemented

**Risk**: 🟠 HIGH  
**Impact**: 🚫 Feature Broken  
**Effort**: Medium (1-2 days)

#### Description
Users who forget their password have no way to reset it. They are permanently locked out of their account. This is a critical authentication feature that's missing.

#### Current Behavior
1. User forgets password
2. User tries to sign in
3. Sign in fails
4. **No "Forgot Password?" link**
5. User is locked out permanently

#### Expected Behavior
1. User forgets password
2. User clicks "Forgot Password?" on sign-in page
3. User enters email address
4. System sends password reset email
5. User clicks link in email
6. User enters new password
7. User can sign in with new password

#### Files to Create
- `app/(auth)/reset-password/page.tsx` - Password reset request page
- `app/(auth)/reset-password/confirm/page.tsx` - New password entry page
- `app/api/auth/reset-password/route.ts` - API endpoint (if needed)

#### Implementation Steps
1. Add "Forgot Password?" link to sign-in page
2. Create password reset request page
3. Integrate with Supabase password reset
4. Create password reset confirmation page
5. Add email template (if custom needed)
6. Test full flow

#### Validation Steps
1. Go to /login page
2. Verify: "Forgot Password?" link visible
3. Click link
4. Enter email address
5. Verify: Email sent confirmation shown
6. Check email inbox
7. Click reset link in email
8. Verify: Redirected to password reset page
9. Enter new password
10. Verify: Password updated successfully
11. Sign in with new password
12. Verify: Sign in successful

#### Success Criteria
- ✅ "Forgot Password?" link on sign-in page
- ✅ Password reset email sent successfully
- ✅ Reset link works and doesn't expire too quickly
- ✅ User can set new password
- ✅ User can sign in with new password

---

### HIGH-005: Individual Animation Sharing Broken

**Risk**: 🟠 HIGH  
**Impact**: 🚫 Feature Broken  
**Effort**: Medium (1-2 days)

#### Description
Users can share animations from the public gallery, but the share functionality doesn't work from the editor (/app) where users create their animations. The share button either doesn't exist or doesn't work.

#### Current Behavior
- User creates animation in /app
- User wants to share with others
- **No working share button or functionality**
- User must publish to gallery first, then share from there

#### Expected Behavior
- User creates animation in /app
- User clicks "Share" button
- Share modal opens with link
- User can copy link and share with others
- Link works and shows animation

#### Files to Modify
- `app/app/page.tsx` - Add share button/modal
- Share modal component - Ensure works from editor
- API routes - Verify share endpoint works

#### Implementation Steps
1. Add "Share" button to editor UI
2. Create or reuse share modal component
3. Wire up share functionality
4. Generate share link
5. Test link works correctly

#### Validation Steps
1. Open editor (/app)
2. Create animation
3. Save animation
4. Verify: "Share" button visible
5. Click "Share" button
6. Verify: Share modal opens
7. Verify: Share link generated
8. Copy share link
9. Open link in incognito/private window
10. Verify: Animation loads and plays correctly

#### Success Criteria
- ✅ Share button visible in editor
- ✅ Share modal opens correctly
- ✅ Share link generated successfully
- ✅ Share link works in any browser
- ✅ Shared animation displays correctly

---

## 🟡 MEDIUM Priority Issues

### MED-001: Replay Playback Performance Poor

**Risk**: 🟡 MEDIUM  
**Impact**: 🐌 Performance  
**Effort**: Low (2-3 hours)

#### Description
The replay viewer uses `setTimeout` for animation playback instead of `requestAnimationFrame`. This results in choppy playback, inconsistent frame timing, and poor performance.

#### Current Behavior
- Replay playback is choppy
- Frame timing inconsistent
- Doesn't sync with display refresh rate
- Looks unprofessional

#### Expected Behavior
- Smooth 60fps playback
- Frame timing consistent
- Syncs with display refresh rate
- Professional-looking animation

#### Files to Modify
- `app/replay/[id]/ReplayViewer.tsx`

#### Implementation Steps
1. Replace `setTimeout` with `requestAnimationFrame`
2. Calculate frame timing based on timestamp
3. Handle pause/play correctly
4. Test on different devices

#### Validation Steps
1. Open any replay page
2. Play animation
3. Verify: Smooth playback
4. Verify: Consistent frame timing
5. Test on different browsers
6. Test on mobile devices

#### Success Criteria
- ✅ Playback is smooth (60fps)
- ✅ Frame timing is consistent
- ✅ Works on all browsers
- ✅ Works on mobile devices

---

### MED-002: Replay Page Layout Lacks Polish

**Risk**: 🟡 MEDIUM  
**Impact**: 🎨 Polish  
**Effort**: Medium (1 day)

#### Description
The replay page doesn't show pitch markings and looks less polished than the editor. The animation playback isn't as smooth, and the overall layout feels less refined.

#### Current Behavior
- No pitch markings on replay page
- Layout doesn't match editor quality
- Feels like a downgrade from editor

#### Expected Behavior
- Pitch markings visible (same as editor)
- Layout matches editor quality
- Smooth animation playback
- Professional appearance

#### Files to Modify
- `app/replay/[id]/ReplayViewer.tsx` - Use Field component
- `app/replay/[id]/page.tsx` - Improve layout

#### Implementation Steps
1. Import Field component from editor
2. Add pitch markings to replay
3. Improve layout spacing and styling
4. Match editor visual quality
5. Test on different screen sizes

#### Validation Steps
1. Open replay page
2. Verify: Pitch markings visible
3. Verify: Layout looks polished
4. Compare to editor
5. Verify: Similar visual quality
6. Test on mobile devices

#### Success Criteria
- ✅ Pitch markings visible on replay
- ✅ Layout matches editor quality
- ✅ Looks professional
- ✅ Responsive on all screen sizes

---

### MED-003: Staging Environment Configuration Missing

**Risk**: 🟡 MEDIUM  
**Impact**: 🚫 Feature Broken (DevOps)  
**Effort**: Low (1 hour)

#### Description
The `.env.staging` file doesn't exist, preventing deployment to a staging environment for testing before production.

#### Current Behavior
- No staging environment configuration
- Can't test changes before production
- Higher risk of production bugs

#### Expected Behavior
- Staging environment configured
- Can deploy to staging for testing
- Verify changes before production

#### Files to Create
- `.env.staging`

#### Implementation Steps
1. Copy `.env.example` to `.env.staging`
2. Update with staging Supabase credentials
3. Document staging setup process
4. Test staging deployment

#### Validation Steps
1. Verify: `.env.staging` file exists
2. Verify: Contains staging Supabase URL
3. Verify: Contains staging Supabase key
4. Deploy to staging
5. Verify: Staging site works correctly

#### Success Criteria
- ✅ `.env.staging` file exists
- ✅ Staging deployment works
- ✅ Staging environment documented

---

### MED-004: Editor Layout Needs Refinement

**Risk**: 🟡 MEDIUM  
**Impact**: 😕 UX Issue  
**Effort**: Medium (1-2 days)

#### Description
The editor layout (/app) feels cramped or unbalanced. Spacing, sizing, and proportions need visual refinement for better user experience.

#### Current Behavior
- Layout feels cramped
- Spacing inconsistent
- Some elements too large/small
- Not visually balanced

#### Expected Behavior
- Comfortable spacing
- Balanced proportions
- Elements appropriately sized
- Professional appearance

#### Files to Modify
- `app/app/page.tsx`
- Editor component files
- CSS/styling files

#### Implementation Steps
1. Review current layout
2. Identify spacing issues
3. Adjust margins and padding
4. Resize elements as needed
5. Test on different screen sizes
6. Get user feedback

#### Validation Steps
1. Open editor
2. Verify: Comfortable spacing
3. Verify: Balanced layout
4. Test on different screen sizes
5. Get feedback from users

#### Success Criteria
- ✅ Layout feels comfortable
- ✅ Spacing is consistent
- ✅ Elements appropriately sized
- ✅ Works on all screen sizes

---

### MED-005: Entity Labeling Needs Refinement

**Risk**: 🟡 MEDIUM  
**Impact**: 😕 UX Issue  
**Effort**: Low (2-4 hours)

#### Description
The default entity naming convention (Att 01, Def 01, etc.) could be clearer or more intuitive for users.

#### Current Behavior
- Entities labeled "Att 01", "Def 01", etc.
- May not be immediately clear to new users
- Could be more descriptive

#### Expected Behavior
- Clear, intuitive entity labels
- Easy to understand for new users
- Follows rugby conventions

#### Files to Modify
- `src/store/projectStore.ts`

#### Implementation Steps
1. Review current naming convention
2. Research rugby position naming
3. Propose new naming convention
4. Implement changes
5. Test with users

#### Validation Steps
1. Add new entities
2. Verify: Labels are clear
3. Verify: Labels are intuitive
4. Get feedback from rugby coaches

#### Success Criteria
- ✅ Labels are clear and intuitive
- ✅ Follow rugby conventions
- ✅ Positive user feedback

---

## 🟢 LOW Priority Issues

### LOW-001: Cone Visual Thickness

**Risk**: 🟢 LOW  
**Impact**: 🎨 Polish  
**Effort**: Very Low (30 minutes)

#### Description
Cones are now rendered as hollow circles (correct), but the circle outline is too thin and hard to see on the pitch.

#### Current Behavior
- Cones are hollow circles
- Outline is very thin
- Hard to see, especially on green pitch

#### Expected Behavior
- Cones are hollow circles
- Outline is thicker and more visible
- Easy to see on pitch

#### Files to Modify
- `src/components/Canvas/PlayerToken.tsx`

#### Implementation Steps
1. Find cone rendering code
2. Increase `strokeWidth` property
3. Test different thicknesses
4. Choose optimal thickness

#### Validation Steps
1. Add cone to canvas
2. Verify: Outline is visible
3. Verify: Not too thick
4. Test on different backgrounds

#### Success Criteria
- ✅ Cone outline clearly visible
- ✅ Thickness looks professional
- ✅ Works on all backgrounds

---

### LOW-002: Pitch Layout Type Missing from Types

**Risk**: 🟢 LOW  
**Impact**: 🐌 Performance (TypeScript)  
**Effort**: Very Low (15 minutes)

#### Description
The `PitchLayout` type isn't defined in the types file, even though the pitch layout feature exists. This is a TypeScript hygiene issue that doesn't affect users but should be fixed.

#### Current Behavior
- PitchLayout type not defined
- TypeScript may show errors
- Code less maintainable

#### Expected Behavior
- PitchLayout type properly defined
- No TypeScript errors
- Code more maintainable

#### Files to Modify
- `src/types/index.ts`

#### Implementation Steps
1. Add type definition:
   ```typescript
   export type PitchLayout = 'standard' | 'attack' | 'defence' | 'training';
   ```
2. Update any components using pitch layouts
3. Verify TypeScript errors resolved

#### Validation Steps
1. Run `npx tsc --noEmit`
2. Verify: No TypeScript errors
3. Verify: Type autocomplete works

#### Success Criteria
- ✅ PitchLayout type defined
- ✅ No TypeScript errors
- ✅ Type autocomplete works

---

## Issue Statistics

| Priority | Count | Total Effort |
|----------|-------|--------------|
| 🔴 CRITICAL | 2 | 4-8 hours |
| 🟠 HIGH | 5 | 8-13 days |
| 🟡 MEDIUM | 5 | 5-8 days |
| 🟢 LOW | 2 | 45 minutes |

**Total**: 14 issues, estimated 14-22 days of work

---

**Recommendation**: Start with the 2 critical issues (8 hours total), then pick high-priority issues based on user impact and available time.
