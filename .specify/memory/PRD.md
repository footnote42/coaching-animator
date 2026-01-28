# Product Requirements Document: AnimatorApp

## A Personal Sports Coaching Animation Tool

**Version:** 1.0  
**Date:** 16 January 2026  
**Author:** Wayne Ellis  
**Status:** Draft

---

## 1. Executive Summary

AnimatorApp is a browser-based keyframe animation tool designed for sports coaches to create tactical visualizations and animated play diagrams. The application enables users to position player tokens on a sports field, define multiple "frames" representing tactical states, and generate smooth animations showing player movements between those states. The tool exports animations as video files for sharing via messaging apps or cloud storage.

This is a personal-use application intended for the creator and a small circle of friends/colleagues. It operates entirely client-side with no backend infrastructure, prioritizing simplicity, privacy, and zero ongoing costs.

---

## 2. Problem Statement

Commercial coaching animation tools like AnimationSlate require subscriptions, cloud accounts, and often lock features behind paywalls. Coaches who need simple tactical animations for training sessions or team communication lack a free, private, offline-capable alternative.

While the tool operates offline-first, coaches need a frictionless way to share animated plays. File-based sharing (JSON/video downloads) requires manual file management. Optional link-sharing solves this by generating shareable URLs for WhatsApp/messaging apps while maintaining offline-first for core features.

Current UI implementation feels too clinical and lacks the warmth expected in coaching tools, potentially reducing user trust and engagement.

**User Needs:**

- Create drag-and-drop tactical diagrams quickly
- Animate player movements between positions without complex timeline editing
- Export shareable video files (.webm/.mp4) OR shareable links
- Save and reload projects without cloud dependencies
- Support multiple sports (rugby, soccer, gridiron)
- Share animations via WhatsApp without manual file handling

---

## 3. Goals & Success Metrics

### 3.1 Goals

|Priority|Goal|
|---|---|
|P0|Render an interactive canvas with draggable player tokens|
|P0|Implement keyframe-based animation with smooth interpolation|
|P0|Export animations as downloadable video files|
|P1|Support multiple field backgrounds (rugby, soccer, gridiron)|
|P1|Save/load projects as JSON files|
|P2|Ghost/onion-skin previous frame positions|
|P2|Draw annotation arrows and lines|
|P3|Ball possession and pass animations|

### 3.2 Success Metrics

- Animation playback runs at consistent 60fps on modern hardware
- Video export completes successfully in Chrome/Edge browsers
- Project files load without data corruption
- Total development effort: 55-75 hours

---

## 4. User Personas

### Primary Persona: Amateur Rugby Coach

- **Context:** Coaches a local club team, prepares training sessions weekly
- **Tech Comfort:** Uses smartphone apps daily, comfortable with basic desktop software
- **Need:** Quick way to show players movement patterns before training
- **Sharing Method:** WhatsApp group, Google Drive links

### Secondary Persona: Friend/Colleague

- **Context:** Receives shared videos, may want to create their own
- **Tech Comfort:** Varies widely
- **Need:** View exported videos; potentially run the tool locally
- **Sharing Method:** Direct file transfer or messaging apps

---

## 5. Functional Requirements

### 5.1 Canvas & Field System

|ID|Requirement|Priority|
|---|---|---|
|F-CAN-01|Render a responsive canvas that fills the main content area|P0|
|F-CAN-02|Display field background image/SVG based on selected sport|P0|
|F-CAN-03|Support field types: Rugby Union, Rugby League, Soccer, American Football|P1|
|F-CAN-04|Render grid overlay for positioning reference (toggleable)|P2|
|F-CAN-05|Support high-DPI/Retina displays with proper pixel ratio scaling|P1|

### 5.2 Entity System (Players, Ball, Annotations)

|ID|Requirement|Priority|
|---|---|---|
|F-ENT-01|Render player tokens as colored circles with labels|P0|
|F-ENT-02|Support drag-and-drop repositioning of all entities|P0|
|F-ENT-03|Color-code entities (Attack: blue/green, Defense: red/orange)|P0|
|F-ENT-04|Support custom text labels (jersey numbers, position codes)|P1|
|F-ENT-05|Render ball entity with distinct visual treatment|P1|
|F-ENT-06|Ball "possession" logic: attach ball to a player entity|P2|
|F-ENT-07|Draw arrow/line annotations with start/end frame visibility|P2|

### 5.3 Frame & Timeline System

|ID|Requirement|Priority|
|---|---|---|
|F-FRM-01|Maintain ordered list of keyframes (minimum 2 for animation)|P0|
|F-FRM-02|Add/remove/duplicate frames via UI controls|P0|
|F-FRM-03|Navigate between frames via thumbnail strip or prev/next buttons|P0|
|F-FRM-04|Set per-frame transition duration (default: 2 seconds)|P1|
|F-FRM-05|Display "ghost" entities from previous frame at reduced opacity|P2|
|F-FRM-06|Maximum 50 frames per project|P1|

### 5.4 Animation Engine

|ID|Requirement|Priority|
|---|---|---|
|F-ANI-01|Play animation from current frame to end|P0|
|F-ANI-02|Linear interpolation (lerp) between entity positions|P0|
|F-ANI-03|Pause/resume playback|P0|
|F-ANI-04|Reset playback to frame 0|P0|
|F-ANI-05|Fade out entities that don't exist in the target frame|P1|
|F-ANI-06|Playback speed control (0.5x, 1x, 2x)|P2|
|F-ANI-07|Loop playback option|P2|

### 5.5 Export System

|ID|Requirement|Priority|
|---|---|---|
|F-EXP-01|Export animation as .webm video file (Chrome/Edge)|P0|
|F-EXP-02|Display export progress indicator|P1|
|F-EXP-03|Configure export resolution (720p default, optional 1080p)|P2|
|F-EXP-04|Optional: Transcode to .mp4 via ffmpeg.wasm|P3|
|F-EXP-05|Generate shareable replay link via POST to backend (Tier 2 feature)|P1|
|F-EXP-06|Copy share URL to clipboard with privacy notice on first use|P1|
|F-EXP-07|UI must convey warmth and professionalism to build coach confidence|P1|

### 5.6 Persistence System

|ID|Requirement|Priority|
|---|---|---|
|F-PER-01|Save project state to JSON file (download)|P0|
|F-PER-02|Load project from JSON file (upload)|P0|
|F-PER-03|Auto-save to browser LocalStorage (crash recovery)|P1|
|F-PER-04|"New Project" action with confirmation if unsaved changes|P1|

---

## 6. Data Model & Schema

### 6.1 Core Interfaces

```typescript
interface Project {
  version: string;           // Schema version for migrations
  id: string;                // UUID
  name: string;              // User-provided project name
  sport: SportType;          // Field type selection
  createdAt: string;         // ISO 8601 timestamp
  updatedAt: string;         // ISO 8601 timestamp
  frames: Frame[];           // Ordered keyframe array
  settings: ProjectSettings;
}

interface Frame {
  id: string;                // UUID
  index: number;             // Position in sequence
  duration: number;          // Transition time in ms (to next frame)
  entities: Record<string, Entity>;  // Keyed by entity ID
  annotations: Annotation[];
}

interface Entity {
  id: string;                // Stable UUID across frames
  type: EntityType;          // 'player' | 'ball' | 'cone' | 'marker'
  x: number;                 // Canvas X coordinate
  y: number;                 // Canvas Y coordinate
  color: string;             // Hex color code
  label: string;             // Display text (jersey number, etc.)
  team: TeamType;            // 'attack' | 'defense' | 'neutral'
  parentId?: string;         // For ball possession
}

interface Annotation {
  id: string;
  type: AnnotationType;      // 'arrow' | 'line' | 'curve'
  points: number[];          // [x1, y1, x2, y2, ...]
  color: string;
  startFrameId: string;
  endFrameId: string;
}

interface ProjectSettings {
  showGrid: boolean;
  gridSpacing: number;
  defaultTransitionDuration: number;
  exportResolution: '720p' | '1080p';
}

type SportType = 'rugby-union' | 'rugby-league' | 'soccer' | 'american-football';
type EntityType = 'player' | 'ball' | 'cone' | 'marker';
type TeamType = 'attack' | 'defense' | 'neutral';
type AnnotationType = 'arrow' | 'line' | 'curve';

// Minimal Share Payload for Link Sharing (Tier 2 Feature)
interface SharePayloadV1 {
  version: 1;
  canvas: {
    width: number;
    height: number;
  };
  entities: Array<{
    id: string;
    type: 'player' | 'ball';
    team: 'attack' | 'defence';
    x: number;
    y: number;
  }>;
  frames: Array<{
    t: number; // seconds from start
    updates: Array<{
      id: string;
      x: number;
      y: number;
    }>;
  }>;
}
```

---

## 7. Security & Validation Requirements

Although this is a personal-use, client-side application, implementing proper validation and security practices prevents data corruption, unexpected behavior, and establishes good patterns if the tool is ever shared more broadly.

### 7.1 Data Field Validation

|Field|Validation Rules|Rationale|
|---|---|---|
|`Project.version`|Semver format, must match known versions|Prevents loading incompatible files|
|`Project.name`|Max 100 chars, sanitize HTML entities|Prevents XSS if ever rendered in DOM|
|`Entity.id`|Valid UUID v4 format|Ensures unique entity tracking across frames|
|`Entity.x`, `Entity.y`|Number, finite, within canvas bounds (0-2000)|Prevents rendering errors|
|`Entity.color`|Valid hex color (#RRGGBB or #RGB)|Prevents canvas rendering failures|
|`Entity.label`|Max 10 chars, alphanumeric + common symbols only|Prevents text overflow, injection|
|`Frame.duration`|Number, min 100ms, max 10000ms|Prevents zero-duration or infinite animations|
|`Frame[] length`|Max 50 frames|Memory/performance protection|
|`Annotation.points`|Array of finite numbers, max 100 points|Prevents memory exhaustion|

### 7.2 File Loading Validation

```typescript
// Validation schema for loaded JSON files
interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateProjectFile(data: unknown): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Type checking - must be object
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Invalid file format'], warnings: [] };
  }
  
  // 2. Version check - reject unknown versions
  const project = data as Record<string, unknown>;
  if (!isValidVersion(project.version)) {
    errors.push(`Unsupported file version: ${project.version}`);
  }
  
  // 3. Required fields presence
  const requiredFields = ['id', 'name', 'sport', 'frames'];
  for (const field of requiredFields) {
    if (!(field in project)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // 4. Frame validation
  if (Array.isArray(project.frames)) {
    if (project.frames.length > MAX_FRAMES) {
      errors.push(`Too many frames: ${project.frames.length} (max: ${MAX_FRAMES})`);
    }
    // Validate each frame and entity...
  }
  
  return { valid: errors.length === 0, errors, warnings };
}
```

### 7.3 Input Sanitization

|Input Type|Sanitization Method|
|---|---|
|Text labels|Strip HTML tags, limit length, whitelist characters|
|Color values|Validate against hex pattern, fallback to default|
|Numeric inputs|`Number.isFinite()` check, clamp to valid range|
|File names|Remove path separators, special characters|

```typescript
// Example sanitization utilities
const sanitizeLabel = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML
    .replace(/[^\w\s\-\.]/g, '')       // Whitelist chars
    .slice(0, 10);                      // Length limit
};

const sanitizeColor = (input: string): string => {
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexPattern.test(input) ? input : '#808080';  // Default gray
};

const sanitizeCoordinate = (input: number, max: number): number => {
  if (!Number.isFinite(input)) return 0;
  return Math.max(0, Math.min(input, max));
};
```

### 7.4 LocalStorage Security

|Concern|Mitigation|
|---|---|
|Storage quota exceeded|Implement try-catch, show user warning, clear oldest auto-save|
|Data corruption|Validate before reading, maintain backup slot|
|Cross-site access|LocalStorage is origin-bound by default (browser security)|

```typescript
const STORAGE_KEY = 'playcanvas_autosave';
const STORAGE_BACKUP_KEY = 'playcanvas_autosave_backup';
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

function safeAutoSave(project: Project): boolean {
  try {
    const serialized = JSON.stringify(project);
    
    // Size check
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn('Project too large for auto-save');
      return false;
    }
    
    // Backup current before overwriting
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(STORAGE_BACKUP_KEY, current);
    }
    
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      // Clear backup to free space
      localStorage.removeItem(STORAGE_BACKUP_KEY);
      console.warn('Storage quota exceeded, backup cleared');
    }
    return false;
  }
}
```

### 7.5 Export Safety

|Concern|Mitigation|
|---|---|
|Memory exhaustion during export|Limit export resolution, show memory warning|
|Infinite animation loop|Timeout after total calculated duration + buffer|
|Large file downloads|Show estimated file size before export|

```typescript
const EXPORT_TIMEOUT_BUFFER_MS = 5000;
const MAX_EXPORT_DURATION_MS = 300000; // 5 minutes max

function calculateExportDuration(frames: Frame[]): number {
  return frames.reduce((total, frame) => total + frame.duration, 0);
}

async function exportAnimation(project: Project): Promise<Blob> {
  const duration = calculateExportDuration(project.frames);
  
  if (duration > MAX_EXPORT_DURATION_MS) {
    throw new Error(`Animation too long for export (max 5 minutes)`);
  }
  
  const timeoutMs = duration + EXPORT_TIMEOUT_BUFFER_MS;
  
  return Promise.race([
    performExport(project),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Export timeout')), timeoutMs)
    )
  ]);
}
```

### 7.6 Rate Limiting (Future Sharing Consideration)

If the tool is ever extended to include online sharing or a backend component, implement these safeguards:

|Action|Rate Limit|Implementation|
|---|---|---|
|File save/export|1 per 5 seconds|Debounce, disable button with cooldown|
|Project creation|10 per hour|Counter in LocalStorage with timestamp|
|(Future) API calls|Per endpoint limits|Token bucket algorithm|

```typescript
// Simple client-side rate limiter for export
class RateLimiter {
  private lastAction: number = 0;
  private cooldownMs: number;
  
  constructor(cooldownMs: number) {
    this.cooldownMs = cooldownMs;
  }
  
  canProceed(): boolean {
    const now = Date.now();
    if (now - this.lastAction < this.cooldownMs) {
      return false;
    }
    this.lastAction = now;
    return true;
  }
  
  getRemainingCooldown(): number {
    return Math.max(0, this.cooldownMs - (Date.now() - this.lastAction));
  }
}

const exportLimiter = new RateLimiter(5000); // 5 second cooldown
```

### 7.7 Secrets Management

**Current State:** No secrets required (fully client-side, no API keys).

**Future Considerations:** If integrating external services:

|Secret Type|Handling|
|---|---|
|API keys|NEVER embed in client code; use serverless function proxy|
|User tokens|Store in memory only, never LocalStorage|
|Service credentials|Environment variables in build process, not in repo|

```typescript
// Pattern for future API integration (if needed)
// DON'T DO THIS:
// const API_KEY = 'sk-abc123'; // NEVER embed secrets

// DO THIS:
// Proxy through serverless function that holds the key
async function callExternalService(data: unknown) {
  const response = await fetch('/api/proxy-service', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}
```

### 7.8 Share Feature Security

**Applicable to**: Link sharing (Tier 2 feature, Constitution Principle V.2)

|Security Control|Implementation|Rationale|
|---|---|---|
|**Payload Size Limit**|Reject payloads >100KB|Prevent storage abuse and network overhead|
|**Schema Validation**|Validate SharePayloadV1 structure|Prevent malformed data from corrupting storage|
|**UUID Generation**|Use cryptographically random UUIDs|Security by obscurity; prevents enumeration|
|**CORS Headers**|Restrict origin to production domain|Prevent unauthorized API access from other sites|
|**Rate Limiting**|POST: 10/hour, GET: 100/hour (Phase 2)|Prevent abuse and storage exhaustion|
|**Generic Errors**|Return non-specific error messages|Prevent information leakage about system internals|
|**90-Day Expiration**|Automatic deletion from storage|Aligns with privacy-first, minimizes data retention|

**MVP Scope (Phase 1)**:
- Payload size validation (implemented immediately)
- Schema validation (basic version check)
- UUID generation (Supabase default)
- CORS headers (Vercel Functions configuration)

**Deferred to Phase 2**:
- Advanced rate limiting (requires Upstash Redis)
- Detailed schema validation (ajv library)
- IP-based abuse prevention

**Security Model Acknowledgment**:
- MVP relies on UUID obscurity (no authentication)
- Shared links are public to anyone with the URL
- No access control or ownership tracking
- Suitable for non-sensitive tactical diagrams; not for confidential information

---

## 8. Technical Architecture

### 8.1 Technology Stack

|Layer|Technology|Rationale|
|---|---|---|
|Build Tool|Vite|Zero-config, fast HMR, excellent TypeScript support|
|Framework|React 18+ (TypeScript)|Declarative UI, AI-friendly patterns|
|Canvas|React-Konva|Declarative canvas API, React integration|
|State|Zustand|Minimal boilerplate, transient updates for animation|
|Styling|Tailwind CSS|Utility-first, compact class names|
|UI Components|shadcn/ui|Pre-built accessible components|
|Icons|Lucide React|Consistent icon set|
|Video Export|MediaRecorder API|Native browser capability|
|(Optional) Video|ffmpeg.wasm|Client-side MP4 transcoding|
|**Backend (Tier 2)**|Vercel Functions|Serverless API endpoints for share feature|
|**Database (Tier 2)**|Supabase PostgreSQL|Shared animation payload storage|

### 8.2 Component Architecture

src/
├── components/
│   ├── Canvas/
│   │   ├── Stage.tsx           # Main Konva stage wrapper
│   │   ├── Field.tsx           # Background field rendering
│   │   ├── EntityLayer.tsx     # Player/ball rendering
│   │   ├── AnnotationLayer.tsx # Arrows and lines
│   │   ├── GhostLayer.tsx      # Previous frame ghosts
│   │   └── PlayerToken.tsx     # Individual player component
│   ├── Timeline/
│   │   ├── FrameStrip.tsx      # Thumbnail navigation
│   │   ├── PlaybackControls.tsx
│   │   └── FrameSettings.tsx
│   ├── Sidebar/
│   │   ├── EntityPalette.tsx   # Add players/ball
│   │   ├── SportSelector.tsx
│   │   └── ProjectActions.tsx  # Save/Load/Export
│   └── UI/
│       ├── Button.tsx
│       ├── Slider.tsx
│       └── Dialog.tsx
├── hooks/
│   ├── useAnimationLoop.ts     # Core animation logic
│   ├── useExport.ts            # Video recording
│   └── useAutoSave.ts
├── store/
│   ├── projectStore.ts         # Main Zustand store
│   └── uiStore.ts              # UI state (modals, etc.)
├── utils/
│   ├── interpolation.ts        # Lerp and easing functions
│   ├── validation.ts           # Schema validation
│   ├── sanitization.ts         # Input cleaning
│   └── fileIO.ts               # Save/load helpers
├── types/
│   └── index.ts                # TypeScript interfaces
└── constants/
    └── fields.ts               # Sport field dimensions/SVGs

### 8.3 State Management Design

```typescript
// store/projectStore.ts
interface ProjectStore {
  // State
  project: Project | null;
  currentFrameIndex: number;
  isPlaying: boolean;
  isDirty: boolean;
  
  // Actions
  loadProject: (data: unknown) => ValidationResult;
  saveProject: () => string;  // Returns JSON string
  
  addFrame: () => void;
  removeFrame: (frameId: string) => void;
  duplicateFrame: (frameId: string) => void;
  setCurrentFrame: (index: number) => void;
  
  addEntity: (frameId: string, entity: Partial<Entity>) => void;
  updateEntity: (frameId: string, entityId: string, updates: Partial<Entity>) => void;
  removeEntity: (frameId: string, entityId: string) => void;
  
  play: () => void;
  pause: () => void;
  reset: () => void;
  
  // Transient (no re-render)
  setPlaybackPosition: (time: number) => void;
}
```

---

## 9. User Interface Design

### 9.1 Warm Tactical Professionalism

The UI embodies a **Warm Tactical Professionalism** aesthetic that inspires confidence and builds trust. The design balances tactical precision with approachable warmth, making coaches feel supported and empowered.

**Core Design Principles**:
- **High Contrast**: Enhanced readability with deep charcoal text (#111827) on warm surfaces
- **Warm Accents**: Amber (#D97706) for interactive elements and CTAs
- **Surface Warmth**: Off-white backgrounds (#F9FAFB) instead of clinical pure white
- **Visual Hierarchy**: Clear distinction between primary actions, secondary controls, and content areas

### 9.2 Layout Structure

┌─────────────────────────────────────────────────────────────┐
│  [Logo]  PlayCanvas          [New] [Save] [Load] [Export]   │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  SIDEBAR   │              CANVAS AREA                       │
│  --------  │              (React-Konva Stage)               │
│            │                                                │
│  Sport:    │    ┌──────────────────────────────────┐        │
│  [Rugby ▼] │    │                                  │        │
│            │    │     ○ ○ ○     ●     ○ ○ ○        │        │
│  Players:  │    │       ○ ○           ○ ○          │        │
│  [+Attack] │    │                                  │        │
│  [+Defense]│    │                                  │        │
│            │    │                                  │        │
│  Tools:    │    │                                  │        │
│  [Select]  │    └──────────────────────────────────┘        │
│  [Draw]    │                                                │
│  [Erase]   │                                                │
│            │                                                │
├────────────┴────────────────────────────────────────────────┤
│ [◀] [▶] [▶ Play] [Frame 1/5]  [1] [2] [3] [4] [5] [+Frame] │
│ Duration: [===●===] 2.0s                                    │
└─────────────────────────────────────────────────────────────┘

### 9.3 Key Interactions

|Interaction|Behavior|
|---|---|
|Click empty canvas|Deselect all entities|
|Click entity|Select entity, show properties|
|Drag entity|Move entity position (commit on dragEnd)|
|Double-click entity|Edit label inline|
|Right-click entity|Context menu (delete, duplicate, change color)|
|Click frame thumbnail|Navigate to that frame|
|Spacebar|Toggle play/pause|
|Ctrl/Cmd + S|Save project|
|Delete key|Remove selected entity|

---

## 10. Implementation Phases

### Phase 1: Foundation (8-10 hours)

- [ ] Project scaffolding (Vite + React + TypeScript + Tailwind)
- [ ] Basic layout shell (sidebar, canvas area, timeline bar)
- [ ] Zustand store with Project/Frame/Entity structure
- [ ] Input validation utilities
- [ ] React-Konva stage with placeholder field

### Phase 2: Entity System (10-12 hours)

- [ ] Player token component with drag-and-drop
- [ ] Entity palette in sidebar (add attack/defense players)
- [ ] Entity selection and property editing
- [ ] Color picker and label editing
- [ ] Ball entity with possession logic
- [ ] Delete entity functionality

### Phase 3: Frame Management (6-8 hours)

- [ ] Frame strip with thumbnails
- [ ] Add/remove/duplicate frame
- [ ] Frame navigation
- [ ] Per-frame duration setting
- [ ] Ghost layer for previous frame

### Phase 4: Animation Engine (15-18 hours)

- [ ] `useAnimationLoop` hook with requestAnimationFrame
- [ ] Linear interpolation between frame states
- [ ] Entity fade in/out for appearing/disappearing entities
- [ ] Playback controls (play, pause, reset)
- [ ] Speed control
- [ ] Loop option

### Phase 5: Persistence (6-8 hours)

- [ ] Save to JSON file download
- [ ] Load from JSON file upload
- [ ] File validation on load
- [ ] Auto-save to LocalStorage
- [ ] Unsaved changes warning

### Phase 6: Export (10-12 hours)

- [ ] MediaRecorder integration
- [ ] Export progress UI
- [ ] Resolution selection
- [ ] Download .webm file
- [ ] (Optional) ffmpeg.wasm MP4 conversion

### Phase 7: Polish (8-10 hours)

- [ ] Multiple sport field backgrounds
- [ ] Grid overlay toggle
- [ ] Keyboard shortcuts
- [ ] Error handling and user feedback
- [ ] Responsive layout adjustments
- [ ] Performance optimization

Total Estimated Effort: 63-78 hours

---

## 11. Testing Strategy

### 11.1 Critical Test Cases

|Category|Test Case|Priority|
|---|---|---|
|Validation|Reject malformed JSON on load|P0|
|Validation|Sanitize entity labels with HTML|P0|
|Validation|Clamp coordinates to canvas bounds|P0|
|Animation|Interpolate between 2 frames correctly|P0|
|Animation|Handle entity appearing in later frame|P1|
|Animation|Handle entity disappearing in later frame|P1|
|Export|Produce valid .webm file|P0|
|Export|Timeout on stuck export|P1|
|Persistence|Round-trip save/load preserves data|P0|
|Persistence|Recover from corrupted LocalStorage|P1|

### 11.2 Browser Compatibility

|Browser|Support Level|
|---|---|
|Chrome 90+|Full support (primary target)|
|Edge 90+|Full support|
|Firefox 90+|Partial (MediaRecorder canvas quirks)|
|Safari|Not supported (MediaRecorder issues)|

---

## 12. Risks & Mitigations

|Risk|Impact|Likelihood|Mitigation|
|---|---|---|---|
|MediaRecorder browser inconsistencies|High|Medium|Target Chrome/Edge only, document limitation|
|Large projects cause performance issues|Medium|Low|Enforce frame limits, optimize render loop|
|AI-generated code has bugs|Medium|High|Budget 20% time for debugging, use TypeScript|
|User loses work due to crash|High|Low|Auto-save every 30 seconds|
|Exported video too large to share|Medium|Medium|Offer resolution options, show estimated size|

---

## 13. Future Considerations

### Now In-Scope (Tier 2 Features)

- **Link Sharing** - Optional backend for read-only animation replay via shareable URLs. Does not require accounts or authentication. Implemented via Vercel Functions + Supabase PostgreSQL with 90-day automatic expiration.

### Explicitly Out of Scope

These features remain out of scope but noted for potential future development:

- **Full Cloud Sync** - Persistent cloud storage beyond 90-day share links; would require authentication, ongoing storage costs
- **Collaborative Editing** - Real-time sync, conflict resolution
- **Template Library** - Pre-built plays and formations
- **Mobile App** - React Native port
- **Advanced Animations** - Bezier curves, easing functions
- **Team/Club Branding** - Custom colors, logos on export
- **Share Link Management** - Dashboard to view/delete/extend shared animations (Tier 2 Phase 2)

---

## 14. Glossary

|Term|Definition|
|---|---|
|Frame|A static snapshot of entity positions; the keyframe in animation|
|Entity|Any object on the canvas (player, ball, cone, marker)|
|Lerp|Linear interpolation; calculating intermediate values between two points|
|Ghost|Semi-transparent rendering of previous frame's entities for reference|
|Tweening|Generating intermediate frames between keyframes|
|Vibe Coding|AI-assisted development using LLMs to generate code from natural language|

---

## 15. Appendix: Validation Constants

```typescript
// constants/validation.ts
export const VALIDATION = {
  PROJECT: {
    NAME_MAX_LENGTH: 100,
    MAX_FRAMES: 50,
    SUPPORTED_VERSIONS: ['1.0', '1.1'],
  },
  ENTITY: {
    LABEL_MAX_LENGTH: 10,
    LABEL_PATTERN: /^[\w\s\-\.]*$/,
    COLOR_PATTERN: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    COORD_MIN: 0,
    COORD_MAX: 2000,
  },
  FRAME: {
    DURATION_MIN_MS: 100,
    DURATION_MAX_MS: 10000,
    DURATION_DEFAULT_MS: 2000,
  },
  ANNOTATION: {
    MAX_POINTS: 100,
  },
  EXPORT: {
    TIMEOUT_BUFFER_MS: 5000,
    MAX_DURATION_MS: 300000,
    RESOLUTIONS: {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
    },
  },
  STORAGE: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    AUTOSAVE_INTERVAL_MS: 30000,
  },
  RATE_LIMITS: {
    EXPORT_COOLDOWN_MS: 5000,
    SAVE_COOLDOWN_MS: 2000,
  },
} as const;
```

---

Document End
