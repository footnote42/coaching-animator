
# **AI Test Script for Antigravity with Gemini Flash**

## **Test Environment Setup**

**Base URL**: `http://localhost:3000` (or your deployed URL)
**Browser**: Chrome/Edge for full feature support
**Screen Resolution**: 1920x1080 (desktop), 375x812 (mobile)
**Test Data**: Create test animations with various complexity levels

---

## **Comprehensive Test Script**

### **Phase 1: First-Time User Experience (5 minutes)**

**Objective**: Evaluate landing page effectiveness and user onboarding

```
Navigate to: http://localhost:3000

SCREENSHOT: Landing page hero section
TASKS:
1. Capture full landing page screenshot
2. Identify and document all CTAs (Get Started, Learn More, etc.)
3. Test mobile responsiveness (resize to 375x812)
4. Screenshot mobile landing page
5. Click "Get Started" button
6. Document destination URL and page content

EVALUATION CRITERIA:
- Value proposition clarity (5-second test)
- Visual hierarchy and scan patterns
- Mobile vs desktop experience
- Navigation intuitiveness
```

### **Phase 2: Authentication Flow (3 minutes)**

**Objective**: Test registration and login user experience

```
Navigate to: Registration page

SCREENSHOT: Registration form
TASKS:
1. Screenshot complete registration form
2. Test form validation (submit empty form)
3. Screenshot validation error states
4. Fill registration form with test data:
   - Email: testcoach@example.com
   - Password: TestPassword123!
   - Accept Terms checkbox
5. Screenshot filled form
6. Submit registration
7. Document email verification flow
8. Test login with registered credentials
9. Screenshot login form and dashboard

EVALUATION CRITERIA:
- Form clarity and error messaging
- Registration completion time
- Email verification process
- Login flow efficiency
```

### **Phase 3: Core Animation Tool (10 minutes)**

**Objective**: Evaluate animation creation workflow and tool usability

```
Navigate to: /app

SCREENSHOT: Animation tool interface
TASKS:
1. Capture full tool interface (canvas, sidebar, timeline)
2. Test player entity creation:
   - Click "Attack Player" button
   - Screenshot entity palette
   - Drag player to field
   - Screenshot positioned player
3. Test multi-frame animation:
   - Add 3 frames to timeline
   - Create simple passing play
   - Screenshot each frame setup
4. Test playback controls:
   - Play animation
   - Screenshot playback in progress
   - Test speed controls
5. Test annotations:
   - Draw arrow for movement
   - Screenshot annotation tools
   - Screenshot final annotated play
6. Test export functionality:
   - Click "Export Video"
   - Document export options
   - Screenshot export dialog

EVALUATION CRITERIA:
- Tool discoverability and learning curve
- Canvas interaction responsiveness
- Timeline and frame management
- Export process clarity
```

### **Phase 4: Cloud Storage & Gallery (5 minutes)**

**Objective**: Test save functionality and gallery management

```
TASKS:
1. Save animation to cloud:
   - Click "Save to Cloud"
   - Screenshot save modal
   - Fill metadata (title: "Test Lineout Play")
   - Screenshot filled save form
   - Submit save
   - Document save confirmation

2. Test personal gallery:
   - Navigate to /my-gallery
   - Screenshot gallery view
   - Verify saved animation appears
   - Test sorting options
   - Screenshot sorting controls

3. Test animation management:
   - Click edit metadata on saved animation
   - Screenshot edit modal
   - Test visibility change (Private → Public)
   - Screenshot visibility options
   - Test delete functionality
   - Screenshot delete confirmation

EVALUATION CRITERIA:
- Save process efficiency
- Gallery organization
- Metadata management
- Visibility controls clarity
```

### **Phase 5: Public Gallery & Social Features (5 minutes)**

**Objective**: Evaluate content discovery and social interaction

```
Navigate to: /gallery

SCREENSHOT: Public gallery
TASKS:
1. Test search functionality:
   - Search for "lineout"
   - Screenshot search results
   - Test filter by animation type
   - Screenshot filter controls

2. Test animation viewing:
   - Click on public animation
   - Screenshot detail page
   - Test playback on detail page
   - Screenshot playback controls

3. Test social features:
   - Test upvote button (if logged in)
   - Screenshot upvote interaction
   - Test share functionality
   - Screenshot share options
   - Test remix feature
   - Screenshot remix confirmation

4. Test content reporting:
   - Click report button
   - Screenshot report modal
   - Test reason selection
   - Document report flow

EVALUATION CRITERIA:
- Search and filter effectiveness
- Social feature discoverability
- Content engagement flow
- Moderation tools accessibility
```

### **Phase 6: Guest Mode & Limitations (3 minutes)**

**Objective**: Test guest user experience and upgrade prompts

```
TASKS:
1. Test guest tool access:
   - Logout from account
   - Navigate to /app
   - Screenshot guest mode interface
   - Create animation with 10 frames
   - Screenshot 10-frame limit indicator

2. Test upgrade prompts:
   - Attempt to add 11th frame
   - Screenshot registration prompt
   - Test "Save to Cloud" as guest
   - Screenshot upgrade prompt
   - Test local download functionality
   - Screenshot download options

EVALUATION CRITERIA:
- Guest mode clarity
- Limitation communication
- Upgrade prompt effectiveness
- Local save accessibility
```

### **Phase 7: Admin & Moderation (2 minutes)**

**Objective**: Test administrative interface and content moderation

```
Navigate to: /admin (with admin credentials)

SCREENSHOT: Admin dashboard
TASKS:
1. Screenshot moderation queue
2. Test report review interface
3. Screenshot report details
4. Test moderation actions:
   - Dismiss report
   - Hide content
   - Ban user (test only)
5. Document admin workflow efficiency

EVALUATION CRITERIA:
- Admin interface clarity
- Moderation workflow efficiency
- Action confirmation safety
```

### **Phase 8: Mobile Responsiveness (3 minutes)**

**Objective**: Evaluate mobile experience across key features

```
Resize browser to: 375x812 (mobile)

TASKS:
1. Test mobile landing page
2. Screenshot mobile navigation
3. Test mobile registration flow
4. Test mobile animation tool:
   - Screenshot mobile canvas
   - Test touch interactions
   - Document mobile usability issues
5. Test mobile gallery browsing
6. Screenshot mobile gallery view

EVALUATION CRITERIA:
- Touch target sizes
- Mobile navigation patterns
- Content readability
- Feature parity with desktop
```

### **Phase 9: Performance & Accessibility (2 minutes)**

**Objective**: Basic performance and accessibility checks

```
TASKS:
1. Performance testing:
   - Document page load times
   - Test animation rendering performance
   - Check for memory leaks

2. Accessibility testing:
   - Test keyboard navigation (Tab through interface)
   - Test screen reader compatibility
   - Check color contrast
   - Document accessibility issues

EVALUATION CRITERIA:
- Load time benchmarks
- Keyboard navigation completeness
- Color contrast compliance
- Screen reader compatibility
```

---

## **Screenshot Capture Requirements**

**Required Screenshots** (total ~25-30):
1. Landing page (desktop + mobile)
2. Registration/login forms
3. Animation tool interface
4. Entity palette and canvas
5. Timeline and playback
6. Save/Export modals
7. Gallery views (personal + public)
8. Social features (upvote, share, remix)
9. Guest mode prompts
10. Admin dashboard
11. Mobile responsive views

**Screenshot Naming Convention**:
`[Phase]_[Feature]_[State].png`
Example: `Phase3_AnimationTool_Canvas.png`

---

## **Evaluation Framework**

**Scoring Criteria (1-5 scale)**:
- **Usability**: Ease of use and intuitiveness
- **Functionality**: Feature completeness and reliability
- **Design**: Visual appeal and consistency
- **Performance**: Speed and responsiveness
- **Accessibility**: Inclusivity and compliance

**Critical Issues to Flag**:
- Broken functionality
- Navigation dead-ends
- Performance problems (>3s load times)
- Accessibility violations
- Mobile usability issues
- Security concerns

---

## **Test Execution Instructions for AI**

1. **Sequential Execution**: Complete each phase before moving to next
2. **Documentation**: Capture screenshots at each checkpoint
3. **Error Handling**: Document any errors or unexpected behavior
4. **Time Tracking**: Note time spent on each major task
5. **Comparative Analysis**: Compare experience across user stories

**Expected Test Duration**: 35-40 minutes total
**Output Format**: Structured report with screenshots, metrics, and recommendations

This script provides comprehensive coverage of all 9 user stories and will give you detailed insights into user experience, functionality, and areas for improvement.