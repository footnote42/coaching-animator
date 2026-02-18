# V2.0 Phase 1 Batch 4 Design - Video URL & E2E Tests

**Date**: 2026-02-16
**Epic**: T006 - V2.0 Upgrade - Phase 0-1
**Tasks**: T024 (Video URL UI), T025 (E2E Tests)
**Status**: ✅ Complete (2026-02-18)

## Executive Summary

Batch 4 completes Phase 1 with two deliverables:
1. **T024**: YouTube video URL support in editor (metadata input) and replay viewer (link display)
2. **T025**: Comprehensive E2E test coverage for all Phase 0-1 features (6 test suites)

Both tasks build on completed infrastructure:
- T016 (Collections migration) added `saved_animations.video_url` column
- T020 (Animations API) added video URL validation and persistence
- Playwright configuration exists with test directory ready

---

## T024: Video URL UI Implementation

### Overview

Add YouTube video URL input to editor and display link in replay viewer. Enables coaches to link tutorial videos to their animations.

### Architecture

**Components Modified**:
1. `src/features/animation/components/Sidebar/ProjectActions.tsx` - Add metadata section with video URL input
2. `src/app/replay/[id]/page.tsx` - Add video link display below coaching notes
3. `src/core/stores/projectStore.ts` - Add `videoUrl` to project state

**No API Changes**: T020 completed all backend work (schema validation, endpoints, database).

### Design Decisions

#### 1. Video URL Input Placement

**Chosen Approach**: Dedicated "Metadata" section in ProjectActions sidebar

**Rationale**:
- Clean separation between field settings, metadata, and actions
- Scalable for future metadata fields (tags in V2.0+)
- Follows existing section pattern (Field Settings, Project, Share, Export)
- Discoverable location for content-related inputs

**Section Structure**:
```tsx
<div>
  <h3>Metadata</h3>

  {/* Title Input - Already exists in project store */}
  <Input
    label="Animation Title"
    value={project.name}
    onChange={...}
  />

  {/* Description Textarea - NEW */}
  <Textarea
    label="Description"
    value={project.description}
    onChange={...}
    maxLength={2000}
  />

  {/* Video URL Input - NEW */}
  <Input
    label="Tutorial Video URL (YouTube)"
    placeholder="https://youtube.com/watch?v=..."
    value={videoUrl}
    onChange={handleVideoUrlChange}
    onBlur={handleVideoUrlBlur}
    error={videoUrlError}
  />
</div>
```

**Rejected Alternatives**:
- ~~Add to "Project" section~~ - Mixes actions with metadata, cluttered
- ~~Modal dialog~~ - Extra click required, over-engineered for single field

#### 2. Validation Strategy

**Client-Side Validation** (Immediate feedback):
```typescript
const YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;

const validateVideoUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  return YOUTUBE_URL_REGEX.test(url);
};
```

**Validation Triggers**:
- On blur: After user leaves input field
- On save: Before API call (prevents invalid data submission)

**Error Messages**:
- Invalid format: "Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)"
- Non-HTTPS: Caught by regex (only HTTPS allowed)
- Empty: No error (field is optional)

**Server-Side Validation** (Security layer):
- Already implemented in Zod schema (`src/lib/schemas/animations.ts` lines 74-79)
- Returns 400 error if validation fails
- No additional changes needed

**Supported Formats**:
- ✅ `https://youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- ✅ `https://youtu.be/dQw4w9WgXcQ`
- ❌ `http://youtube.com/...` (must be HTTPS)
- ❌ `https://m.youtube.com/...` (mobile URLs not supported)
- ❌ `https://youtube.com/playlist?list=...` (playlists not supported)

**Rationale**: Standard URLs only encourages clean links and simplifies regex. Mobile URLs redirect to standard URLs anyway.

#### 3. Replay Viewer Link Display

**Location**: Below coaching notes in `/src/app/replay/[id]/page.tsx`

**Implementation**:
```tsx
{/* Coaching Notes */}
{animation.coaching_notes && (
  <div className="mt-8 p-4 bg-surface border border-border rounded">
    <h2 className="text-lg font-heading font-bold text-text-primary mb-3">
      Coaching Notes
    </h2>
    <div className="text-text-primary/90 whitespace-pre-wrap break-words">
      {animation.coaching_notes}
    </div>
  </div>
)}

{/* Video URL - NEW */}
{animation.video_url && (
  <div className="mt-4 p-4 bg-surface border border-border rounded">
    <a
      href={animation.video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
    >
      <Video className="w-4 h-4" />
      Watch Tutorial Video
    </a>
  </div>
)}
```

**Design Choices**:
- **Conditional rendering**: Only show if `video_url` exists (no empty state)
- **Security**: `rel="noopener noreferrer"` prevents tab hijacking and referrer leakage
- **New tab**: `target="_blank"` keeps replay page open
- **Icon**: `Video` icon from lucide-react (already imported in page)
- **Styling**: Matches existing link patterns (primary color, hover underline)
- **Placement**: Below coaching notes (natural reading flow: notes → video)

**Accessibility**:
- Link text is descriptive ("Watch Tutorial Video" vs "Click here")
- Icon provides visual cue
- Keyboard navigable (standard `<a>` tag)

### Data Flow

#### Save Flow (Editor → Database)
```
1. User enters YouTube URL in metadata section
2. On blur: Client-side validation runs, error displays if invalid
3. User clicks "Save to Cloud" button
4. Editor collects project state including video_url
5. POST/PUT /api/animations with video_url in request body
6. Server validates with Zod schema (line 74-79)
7. Supabase saves to saved_animations.video_url column
8. Success: Toast notification + clear dirty flag
9. Error: Toast with friendly error message
```

#### Retrieval Flow (Database → Replay)
```
1. User navigates to /replay/[id]
2. Server component queries Supabase (lines 49-70)
3. SELECT statement MUST include video_url field ⚠️
4. Animation object passed to page component
5. Conditional block checks animation.video_url
6. If exists: Render "Watch Tutorial Video" link
7. Click: Open YouTube in new tab
```

**Required Changes**:
1. ✅ Database column - EXISTS (T016 migration)
2. ✅ API endpoints - SUPPORT IT (T020)
3. ⚠️ ProjectStore state - ADD `videoUrl: string | undefined`
4. ⚠️ Replay SELECT - ADD `video_url` to query (line 51-66)

### Edge Cases

| Case | Behavior |
|------|----------|
| Empty video URL | Treated as "no video" (removes from DB if previously set) |
| Whitespace only | Trimmed before validation, treated as empty |
| Very long URL | Zod schema enforces max length (2000 chars) |
| Invalid URL after save | Server returns 400, toast displays error |
| Video deleted from YouTube | Link still displays (404 on YouTube's side) |
| Shortened URLs (youtu.be) | Supported by regex |
| Mobile URLs (m.youtube.com) | Rejected by regex (intentional) |
| Playlist URLs | Rejected by regex (intentional) |

### Testing Strategy

**Unit Tests** (Optional - covered by E2E):
- `validateVideoUrl()` function with test cases
- Edge cases: empty, invalid, various formats

**E2E Tests** (Required - T025):
- Add video URL in editor → Save → Verify in replay
- Invalid URL shows error message
- Link opens in new tab
- See `video-url.spec.ts` in T025 design

---

## T025: E2E Test Coverage for Phase 0-1

### Overview

Create comprehensive E2E test suites covering all Phase 0-1 features using Playwright. Ensures regression prevention and validates integration between components.

### Test Architecture

**Framework**: Playwright (already configured in `playwright.config.ts`)
**Test Directory**: `tests/e2e/` (exists, currently empty)
**Browsers**: Chromium, Firefox, WebKit (parallel execution)
**Base URL**: `localhost:3000` (dev) or staging URL (configurable)

**Test Execution**:
```bash
# Local development (requires npm run dev in separate terminal)
npm run e2e

# CI environment (uses BASE_URL env var)
BASE_URL=https://staging.example.com npm run e2e
```

### Test Suites (6 Files)

#### 1. `cleanup-v2.spec.ts` - Phase 0 Cleanup Verification

**Purpose**: Verify breaking changes from Phase 0 are correctly implemented.

**Test Cases**:
```typescript
test.describe('Phase 0 Cleanup', () => {
  test('grid overlay toggle button should not exist', async ({ page }) => {
    await page.goto('/app');
    const gridToggle = page.locator('[data-testid="grid-toggle"]');
    await expect(gridToggle).toHaveCount(0);
  });

  test('marker entities should auto-convert to cones on load', async ({ page }) => {
    // Load fixture with legacy "marker" type
    const legacyPayload = { /* ... marker entities ... */ };
    await page.goto('/app');
    // Load payload via JS injection or file upload
    // Verify entities are now type "cone"
  });

  test('sport dropdown should only show Rugby Union', async ({ page }) => {
    await page.goto('/app');
    const sportSelect = page.locator('[data-testid="sport-selector"]');
    await sportSelect.click();
    const options = sportSelect.locator('option');
    await expect(options).toHaveCount(1);
    await expect(options).toHaveText('Rugby Union');
  });
});
```

**Coverage**: Phase 0 breaking changes
**Dependencies**: None

---

#### 2. `mobile-replay.spec.ts` - Mobile Optimization

**Purpose**: Verify responsive design and mobile UX improvements (T015).

**Test Cases**:
```typescript
test.describe('Mobile Replay', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('canvas should be responsive at 375px viewport', async ({ page }) => {
    await page.goto('/replay/[test-id]');
    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('touch targets should be minimum 48x48px', async ({ page }) => {
    await page.goto('/replay/[test-id]');
    const playButton = page.locator('[title="Play"]');
    const box = await playButton.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(48);
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });

  test('landscape hint should display in portrait < 600px', async ({ page }) => {
    await page.goto('/replay/[test-id]');
    const hint = page.locator('text=Rotate device for best viewing');
    await expect(hint).toBeVisible();
  });

  test('landscape hint should be dismissible', async ({ page }) => {
    await page.goto('/replay/[test-id]');
    const hint = page.locator('text=Rotate device for best viewing');
    const dismissButton = hint.locator('button[aria-label="Dismiss hint"]');
    await dismissButton.click();
    await expect(hint).not.toBeVisible();
  });
});

test.describe('Editor Mobile Warning', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('editor should show mobile warning < 768px', async ({ page }) => {
    await page.goto('/app');
    const warning = page.locator('text=For best experience, use desktop');
    await expect(warning).toBeVisible();
  });
});
```

**Coverage**: T015 (Mobile replay optimization)
**Dependencies**: Test animation with valid payload
**Viewports**: 375x667 (iPhone SE), 412x915 (Pixel 7)

---

#### 3. `collections.spec.ts` - Collections Feature

**Purpose**: Verify collection creation, management, and sharing (T016, T018, T022).

**Test Cases**:
```typescript
test.describe('Collections', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    // ... auth flow ...
  });

  test('should create collection via API', async ({ page }) => {
    const response = await page.request.post('/api/collections', {
      data: {
        title: 'Test Collection',
        description: 'E2E test collection',
        is_public: false
      }
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.collection.title).toBe('Test Collection');
  });

  test('should add animation to collection', async ({ page }) => {
    // Create collection and animation via API
    const collectionId = '...';
    const animationId = '...';

    const response = await page.request.post(
      `/api/collections/${collectionId}/animations`,
      { data: { animation_id: animationId } }
    );
    expect(response.status()).toBe(201);
  });

  test('should display collection detail page', async ({ page }) => {
    const collectionId = '...'; // Test fixture
    await page.goto(`/collections/${collectionId}`);

    await expect(page.locator('h1')).toContainText('Test Collection');
    const animationCards = page.locator('[data-testid="animation-card"]');
    await expect(animationCards).toHaveCount(2); // Fixture has 2 animations
  });

  test('share button should copy collection URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);

    await page.goto('/collections/[test-id]');
    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );
    expect(clipboardText).toContain('/collections/');
  });

  test('should remove animation from collection', async ({ page }) => {
    const collectionId = '...';
    const animationId = '...';

    const response = await page.request.delete(
      `/api/collections/${collectionId}/animations/${animationId}`
    );
    expect(response.status()).toBe(200);
  });
});
```

**Coverage**: T016 (Collections migration), T018 (Collections API), T022 (Collection detail page)
**Dependencies**: Auth required, test user with permissions
**Fixtures**: Pre-created collection with 2 animations

---

#### 4. `versions.spec.ts` - Version History

**Purpose**: Verify version control and restoration (T017, T019, T023).

**Test Cases**:
```typescript
test.describe('Version History', () => {
  test.beforeEach(async ({ page }) => {
    // Login and create base animation
    await page.goto('/app');
    // ... create animation ...
  });

  test('first save should create v1.0', async ({ page }) => {
    // Save animation
    await page.click('button:has-text("Save to Cloud")');
    await page.waitForResponse('/api/animations');

    // Check version via API
    const animationId = '...';
    const response = await page.request.get(
      `/api/animations/${animationId}/versions`
    );
    const data = await response.json();
    expect(data.versions[0].version_number).toBe('1.0');
  });

  test('edit should create v1.1 (minor version)', async ({ page }) => {
    // Modify animation
    await page.click('[data-testid="add-cone-button"]');

    // Save without major version flag
    await page.click('button:has-text("Save to Cloud")');
    await page.waitForResponse('/api/animations');

    // Verify v1.1 created
    const animationId = '...';
    const response = await page.request.get(
      `/api/animations/${animationId}/versions`
    );
    const data = await response.json();
    expect(data.versions[0].version_number).toBe('1.1');
  });

  test('should open version history modal', async ({ page }) => {
    await page.goto('/my-gallery');

    // Click history icon on animation card
    const historyIcon = page.locator('[data-testid="version-history-icon"]').first();
    await historyIcon.click();

    const modal = page.locator('[data-testid="version-history-modal"]');
    await expect(modal).toBeVisible();

    // Verify versions listed newest-first
    const versionItems = modal.locator('[data-testid="version-item"]');
    await expect(versionItems).toHaveCount(2); // v1.0 and v1.1
    await expect(versionItems.first()).toContainText('1.1');
  });

  test('restore v1.0 should create v2.0', async ({ page }) => {
    await page.goto('/my-gallery');

    // Open version history
    await page.click('[data-testid="version-history-icon"]');

    // Click restore on v1.0
    const restoreButton = page.locator(
      '[data-testid="version-item"]:has-text("1.0") button:has-text("Restore")'
    );
    await restoreButton.click();

    // Confirm restoration
    await page.click('button:has-text("Restore Version")');
    await page.waitForResponse('/api/animations/*/versions/*/restore');

    // Verify v2.0 created
    const animationId = '...';
    const response = await page.request.get(
      `/api/animations/${animationId}/versions`
    );
    const data = await response.json();
    expect(data.versions[0].version_number).toBe('2.0');
    expect(data.versions[0].is_major).toBe(true);
  });
});
```

**Coverage**: T017 (Version history migration), T019 (Version history API), T023 (Version history modal)
**Dependencies**: Auth required, my-gallery page access
**Data Setup**: Create animation with multiple versions

---

#### 5. `templates.spec.ts` - Template System

**Purpose**: Verify template tagging, filtering, and remix flow (T020, T021).

**Test Cases**:
```typescript
test.describe('Templates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // ... auth flow ...
  });

  test('should tag animation as template', async ({ page }) => {
    // Create animation with 'template' tag
    const response = await page.request.post('/api/animations', {
      data: {
        title: 'Test Template',
        tags: ['template', 'passing'],
        payload: { /* ... */ }
      }
    });
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.animation.tags).toContain('template');
  });

  test('should filter gallery with "Templates Only"', async ({ page }) => {
    await page.goto('/gallery');

    // Check "Templates Only" checkbox
    const templateFilter = page.locator('input[type="checkbox"]').filter({ hasText: 'Templates Only' });
    await templateFilter.check();

    // Wait for filtered results
    await page.waitForResponse(/\/api\/gallery\?.*tags=template/);

    // Verify all cards have template badge
    const templateBadges = page.locator('[data-testid="template-badge"]');
    const animationCards = page.locator('[data-testid="animation-card"]');
    const badgeCount = await templateBadges.count();
    const cardCount = await animationCards.count();
    expect(badgeCount).toBe(cardCount);
  });

  test('template badge should display on cards', async ({ page }) => {
    await page.goto('/gallery?tags=template');

    const badge = page.locator('[data-testid="template-badge"]').first();
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('Template');
    await expect(badge).toHaveCSS('background-color', /blue/); // Blue badge
  });

  test('"Use Template" button should trigger remix', async ({ page }) => {
    await page.goto('/gallery?tags=template');

    const useTemplateButton = page.locator('button:has-text("Use Template")').first();
    await useTemplateButton.click();

    // Should redirect to /app with remix param
    await page.waitForURL(/\/app\?remix=/);
    const url = page.url();
    expect(url).toMatch(/\/app\?remix=[a-f0-9-]{36}/);
  });

  test('remix flow should load template in editor', async ({ page }) => {
    const templateId = '...'; // Test fixture
    await page.goto(`/app?remix=${templateId}`);

    // Wait for template to load
    await page.waitForTimeout(1000); // Allow async loading

    // Verify template name in title
    const titleInput = page.locator('input[placeholder*="title"]');
    await expect(titleInput).toHaveValue(/Template/);

    // Verify entities loaded on canvas
    const entities = page.locator('[data-testid="entity"]');
    await expect(entities).toHaveCount(5); // Template has 5 entities
  });
});
```

**Coverage**: T020 (Animations API updates), T021 (Template UI)
**Dependencies**: Auth required, pre-created template animations
**Fixtures**: Template with known entity count

---

#### 6. `video-url.spec.ts` - Video URL Feature

**Purpose**: Verify video URL input, validation, and display (T024).

**Test Cases**:
```typescript
test.describe('Video URL', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/app');
    // ... login ...
  });

  test('should add YouTube URL in editor', async ({ page }) => {
    const videoUrlInput = page.locator('input[placeholder*="YouTube"]');
    await videoUrlInput.fill('https://youtube.com/watch?v=dQw4w9WgXcQ');

    // Blur to trigger validation
    await videoUrlInput.blur();

    // No error should display
    const error = page.locator('text=Please enter a valid YouTube URL');
    await expect(error).not.toBeVisible();
  });

  test('should show validation error for invalid URL', async ({ page }) => {
    const videoUrlInput = page.locator('input[placeholder*="YouTube"]');
    await videoUrlInput.fill('https://vimeo.com/123456');
    await videoUrlInput.blur();

    const error = page.locator('text=Please enter a valid YouTube URL');
    await expect(error).toBeVisible();
  });

  test('should accept youtu.be shortened URLs', async ({ page }) => {
    const videoUrlInput = page.locator('input[placeholder*="YouTube"]');
    await videoUrlInput.fill('https://youtu.be/dQw4w9WgXcQ');
    await videoUrlInput.blur();

    const error = page.locator('text=Please enter a valid YouTube URL');
    await expect(error).not.toBeVisible();
  });

  test('should save animation with video URL', async ({ page }) => {
    // Fill video URL
    const videoUrlInput = page.locator('input[placeholder*="YouTube"]');
    await videoUrlInput.fill('https://youtube.com/watch?v=dQw4w9WgXcQ');

    // Save animation
    await page.click('button:has-text("Save to Cloud")');
    const response = await page.waitForResponse('/api/animations');
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.animation.video_url).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ');
  });

  test('should display "Watch Tutorial Video" link in replay', async ({ page }) => {
    // Create animation with video URL via API
    const animationId = '...'; // Test fixture

    await page.goto(`/replay/${animationId}`);

    const videoLink = page.locator('a:has-text("Watch Tutorial Video")');
    await expect(videoLink).toBeVisible();
    await expect(videoLink).toHaveAttribute('href', 'https://youtube.com/watch?v=dQw4w9WgXcQ');
    await expect(videoLink).toHaveAttribute('target', '_blank');
    await expect(videoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('video link should open in new tab', async ({ page, context }) => {
    const animationId = '...'; // Test fixture
    await page.goto(`/replay/${animationId}`);

    const videoLink = page.locator('a:has-text("Watch Tutorial Video")');

    // Listen for new page
    const pagePromise = context.waitForEvent('page');
    await videoLink.click();
    const newPage = await pagePromise;

    expect(newPage.url()).toContain('youtube.com');
  });

  test('should not display link if video URL is empty', async ({ page }) => {
    // Animation without video URL
    const animationId = '...'; // Fixture without video_url
    await page.goto(`/replay/${animationId}`);

    const videoLink = page.locator('a:has-text("Watch Tutorial Video")');
    await expect(videoLink).not.toBeVisible();
  });
});
```

**Coverage**: T024 (Video URL UI)
**Dependencies**: Auth required
**Fixtures**: Animation with video URL, animation without video URL

---

### Test Infrastructure Requirements

**Environment Setup**:
```bash
# Install Playwright browsers (if not already installed)
npx playwright install

# Create test fixtures directory
mkdir -p tests/fixtures

# Add test user credentials to .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=test-password-123
```

**Test Fixtures** (Create in `tests/fixtures/`):
- `template-animation.json` - Animation with 'template' tag
- `video-url-animation.json` - Animation with valid video URL
- `versioned-animation.json` - Animation with multiple versions
- `collection-with-items.json` - Collection with 2 animations

**Test Helpers** (Create in `tests/helpers/`):
```typescript
// tests/helpers/auth.ts
export async function loginAsTestUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL);
  await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD);
  await page.click('button:has-text("Sign In")');
  await page.waitForURL('/app');
}

// tests/helpers/api.ts
export async function createTestAnimation(page: Page, payload: unknown) {
  const response = await page.request.post('/api/animations', {
    data: payload
  });
  const data = await response.json();
  return data.animation.id;
}
```

### CI Integration

**GitHub Actions Workflow** (Add to `.github/workflows/e2e.yml`):
```yaml
name: E2E Tests

on:
  push:
    branches: [main, staging, v2-phase-1]
  pull_request:
    branches: [main, staging]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run e2e
        env:
          BASE_URL: https://staging.example.com
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Success Criteria

**T025 Complete When**:
- ✅ 6 test files created in `tests/e2e/`
- ✅ All test suites pass locally (`npm run e2e`)
- ✅ All tests pass on CI (staging environment)
- ✅ HTML report generated with 100% pass rate
- ✅ Test coverage includes all Phase 0-1 features
- ✅ Tests run in parallel across 3 browsers (Chromium, Firefox, WebKit)

---

## Implementation Plan Next Steps

This design document has been approved. Next actions:

1. **Invoke `writing-plans` skill** to create detailed implementation plan
2. **Execute implementation** following the plan
3. **Run verification** commands before completion:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test -- --run
   npm run e2e
   ```
4. **Update documentation** (README.md, feature docs)
5. **Commit and push** changes with descriptive messages

---

## References

**Related Tasks**:
- T016 - Collections migration (video_url column added)
- T017 - Version history migration
- T018 - Collections API
- T019 - Version history API
- T020 - Animations API updates (video_url support)
- T021 - Template UI in gallery
- T022 - Collection detail page
- T023 - Version history modal

**Related Files**:
- `src/lib/schemas/animations.ts` - Video URL validation schema
- `src/features/animation/components/Sidebar/ProjectActions.tsx` - Sidebar actions
- `src/app/replay/[id]/page.tsx` - Replay viewer page
- `playwright.config.ts` - E2E test configuration

**Documentation**:
- [Phase 1 Handoff](../../archive/specs/v2-phase-1-handoff-batch-4.md)
- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
- [Architecture](../architecture/) - System architecture docs
