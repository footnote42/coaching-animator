# Implementation Plan: Link-Sharing Feature

**Feature ID**: 001-rugby-animation-tool
**Plan ID**: link-sharing-implementation
**Created**: 2026-01-25
**Status**: Approved
**Constitutional Compliance**: Implements Constitution v2.0.0 Principle V.2 (Optional Networked Features)

---

## Overview

This plan implements User Story 10 (Share Animation Link) as a Tier 2 optional networked feature under the Privacy-First Architecture. The feature enables coaches to generate shareable URLs for WhatsApp distribution while maintaining the offline-first core.

**Litmus Test**: A coach can send a WhatsApp message containing only a link, and another coach can tap it and immediately see the drill play.

---

## Phases

### Phase 1: Governance & Documentation ✅ COMPLETE

**Objective**: Amend constitution and update all specification documents to support tiered architecture.

**Status**: COMPLETE (2026-01-25)

**Deliverables**:
- [x] Constitution v2.0.0 ratified (`.specify/memory/constitution.md`)
- [x] PRD.md updated (Section 2, 5.5, 6, 7.8, 8, 13)
- [x] spec.md updated (FR-PRV requirements, User Story 10, SC-011)
- [x] animation-share-spec.md updated (constitutional references, governance notes)
- [x] CLAUDE.md updated (backend technologies, Phase 6 status, Development Learnings)

**Artifacts**:
- Constitution v2.0.0 (MAJOR version bump)
- Updated PRD: SharePayloadV1 schema, F-EXP-05/06 requirements
- Updated spec: FR-PRV-01a (Tier 2 network features), User Story 10
- Sync Impact Report in constitution.md header

---

### Phase 2: Codebase Cleanup & Organization ✅ COMPLETE

**Objective**: Archive obsolete files, extract learnings, and prepare project structure for backend implementation.

**Status**: COMPLETE (2026-01-26)

#### Sub-Phase 2.1: Archive Research Documents
**Estimated Effort**: 15 minutes

**Tasks**:
- [x] **T201**: Move `specs/001-rugby-animation-tool/gif-export-research.md` → `archive/gif-export-research.md`
- [x] **T202**: Move `specs/001-rugby-animation-tool/gif-export-plan.md` → `archive/gif-export-plan.md`
- [x] **T203**: Verify archived files are readable and commit archive

**Rationale**: These are historical research documents superseded by implementation. Archiving preserves history without cluttering active specs directory.

**Acceptance Criteria**:
- Research documents successfully moved to `archive/` directory
- Git commit preserves file history via `git mv` or documented in commit message
- Active specs directory contains only current specifications

#### Sub-Phase 2.2: Extract LEARNINGS to CLAUDE.md
**Estimated Effort**: 10 minutes

**Tasks**:
- [x] **T204**: Verify all LEARNINGS.md content extracted to CLAUDE.md "Development Learnings" section (already complete)
- [x] **T205**: Delete `specs/001-rugby-animation-tool/LEARNINGS.md`
- [x] **T206**: Update any references to LEARNINGS.md in other documents

**Rationale**: LEARNINGS.md content is now integrated into CLAUDE.md for better discoverability. No need for duplicate documentation.

**Acceptance Criteria**:
- LEARNINGS.md content fully preserved in CLAUDE.md
- LEARNINGS.md deleted from specs directory
- No broken references to LEARNINGS.md

#### Sub-Phase 2.3: Archive FFmpeg Legacy
**Estimated Effort**: 10 minutes

**Tasks**:
- [x] **T207**: ~~Move `public/ffmpeg-core` → `archive/ffmpeg-core`~~ (directory never created; documented in archive/README.md instead)
- [x] **T208**: Document in archive/README.md: "FFmpeg.wasm exploration (Phase 2 video export attempt); blocked by CORS requirements; superseded by gif.js approach"

**Rationale**: FFmpeg.wasm was attempted for MP4 export but blocked by technical constraints. Archiving preserves investigation history without cluttering public directory.

**Acceptance Criteria**:
- `public/ffmpeg-core` moved to `archive/ffmpeg-core`
- archive/README.md documents reason for archival
- No references to `public/ffmpeg-core` in active code

**Phase 2 Completion Criteria**:
- All obsolete files archived
- Active project directory contains only current implementations and specifications
- Archive directory has README.md explaining archived content

---

### Phase 3: Backend Setup & Infrastructure

**Objective**: Set up Supabase database and Vercel Functions infrastructure for share endpoints.

**Status**: PENDING (requires Phase 2 completion + user approval)

#### Sub-Phase 3.1: Supabase Project Setup
**Estimated Effort**: 30 minutes

**Prerequisites**:
- Supabase account (user will create during this phase)
- Access to Supabase dashboard

**Tasks**:
- [ ] **T301**: Create new Supabase project (project name: `coaching-animator` or user preference)
- [ ] **T302**: Copy Supabase project URL and anon key to local environment variables (`.env.local`)
- [ ] **T303**: Execute database schema script to create `shares` table with RLS policies

**Database Schema** (`supabase-schema.sql`):
```sql
-- Create shares table
create table shares (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '90 days'),
  last_accessed_at timestamptz default now(),
  size_bytes int
);

-- Create index for expiry cleanup
create index idx_shares_expires_at on shares(expires_at);
create index idx_shares_last_accessed on shares(last_accessed_at);

-- Payload size constraint
alter table shares add constraint payload_size_limit
  check (size_bytes <= 100000);

-- Enable Row Level Security
alter table shares enable row level security;

-- Public read policy (anyone with ID can read)
create policy "Allow public read by ID" on shares
  for select using (true);

-- Public insert policy (anyone can create share)
create policy "Allow public insert" on shares
  for insert with check (true);

-- Future: Add deletion policy when implemented
-- create policy "Allow deletion" on shares
--   for delete using (true);
```

**Acceptance Criteria**:
- Supabase project created and accessible via dashboard
- `shares` table created with correct schema
- RLS policies enabled and tested (can insert and read via SQL editor)
- Environment variables documented in `.env.local.example`

**Instructions for User**:
1. Go to https://supabase.com and create free account
2. Create new project: "coaching-animator" (or preferred name)
3. Copy project URL and anon key from Settings > API
4. Create `.env.local` file with:
   ```
   SUPABASE_URL=https://[your-project].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   ```
5. Run SQL schema script in Supabase SQL Editor

#### Sub-Phase 3.2: Vercel Functions Implementation
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] **T304**: Create `api/share.ts` - POST endpoint for creating shares
- [ ] **T305**: Create `api/share/[id].ts` - GET endpoint for retrieving shares
- [ ] **T306**: Install dependencies: `@supabase/supabase-js`, `@vercel/node`
- [ ] **T307**: Configure CORS headers in both endpoints
- [ ] **T308**: Implement payload validation (size check, version check)
- [ ] **T309**: Test endpoints locally using Vercel CLI (`vercel dev`)

**File: `api/share.ts`** (POST endpoint):
```typescript
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const payloadString = JSON.stringify(payload);
    const sizeBytes = Buffer.byteLength(payloadString, 'utf8');

    // Validation
    if (sizeBytes > 100_000) {
      return res.status(413).json({ error: 'Payload too large (max 100KB)' });
    }
    if (payload.version !== 1) {
      return res.status(400).json({ error: 'Invalid payload version' });
    }

    // Store in Supabase
    const { data, error } = await supabase
      .from('shares')
      .insert({
        payload,
        size_bytes: sizeBytes
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create share' });
    }

    return res.json({ id: data.id });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**File: `api/share/[id].ts`** (GET endpoint):
```typescript
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid share ID' });
  }

  try {
    // Fetch payload
    const { data, error } = await supabase
      .from('shares')
      .select('payload, expires_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Share not found' });
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      return res.status(410).json({ error: 'Share expired' });
    }

    // Update last_accessed_at
    await supabase
      .from('shares')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    return res.json(data.payload);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

**Acceptance Criteria**:
- POST /api/share accepts valid payload and returns UUID
- POST /api/share rejects oversized payloads (>100KB) with 413
- POST /api/share rejects invalid version with 400
- GET /api/share/:id returns payload for valid UUID
- GET /api/share/:id returns 404 for non-existent UUID
- GET /api/share/:id returns 410 for expired shares
- CORS headers allow frontend origin
- Local testing via `vercel dev` successful

#### Sub-Phase 3.3: Vercel Deployment Configuration
**Estimated Effort**: 30 minutes

**Tasks**:
- [ ] **T310**: Add Supabase environment variables to Vercel project settings
- [ ] **T311**: Add `FRONTEND_URL` environment variable (production domain)
- [ ] **T312**: Deploy to Vercel preview environment and test endpoints
- [ ] **T313**: Verify environment variables are correctly injected

**Acceptance Criteria**:
- Environment variables configured in Vercel dashboard
- Preview deployment endpoints accessible and functional
- CORS headers correctly restrict to frontend origin

**Phase 3 Completion Criteria**:
- Supabase database operational with `shares` table
- Vercel Functions endpoints deployed and tested
- Environment variables configured for local and production
- API documentation created (optional but recommended)

---

### Phase 4: Frontend Share Feature Implementation

**Objective**: Implement share button, serialization logic, and clipboard copy UX.

**Status**: PENDING (requires Phase 3 completion)

#### Sub-Phase 4.1: Share Payload Serialization
**Estimated Effort**: 1.5 hours

**Tasks**:
- [ ] **T401**: Create `src/utils/serializeForShare.ts` - Convert Project to SharePayloadV1
- [ ] **T402**: Create `src/types/share.ts` - TypeScript interfaces for SharePayloadV1
- [ ] **T403**: Unit test serialization (extract entities, calculate frame timings)

**File: `src/types/share.ts`**:
```typescript
export interface SharePayloadV1 {
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

**File: `src/utils/serializeForShare.ts`**:
```typescript
import type { Project } from '@/types';
import type { SharePayloadV1 } from '@/types/share';

export function serializeForShare(project: Project): SharePayloadV1 {
  // Calculate absolute time for each frame
  let t = 0;
  const frames = project.frames.map((frame, idx) => {
    const currentT = t;
    t += frame.duration / 1000; // Convert ms to seconds

    // Extract only position updates for player/ball entities
    const updates = Object.values(frame.entities)
      .filter(e => e.type === 'player' || e.type === 'ball')
      .map(e => ({ id: e.id, x: e.x, y: e.y }));

    return {
      t: currentT,
      updates
    };
  });

  // Extract entities from first frame
  const entities = Object.values(project.frames[0].entities)
    .filter(e => e.type === 'player' || e.type === 'ball')
    .map(e => ({
      id: e.id,
      type: e.type as 'player' | 'ball',
      team: e.team as 'attack' | 'defence',
      x: e.x,
      y: e.y
    }));

  return {
    version: 1,
    canvas: {
      width: 2000,
      height: 2000
    },
    entities,
    frames
  };
}
```

**Acceptance Criteria**:
- `serializeForShare()` correctly converts Project to SharePayloadV1
- Only player/ball entities included (cones/markers filtered)
- Frame timings calculated correctly (cumulative durations)
- Serialized payload size < 100KB for typical animations (verified via test)

#### Sub-Phase 4.2: Share Button & API Integration
**Estimated Effort**: 2 hours

**Tasks**:
- [ ] **T404**: Create `src/hooks/useShareAnimation.ts` - Hook for share API call
- [ ] **T405**: Create `src/components/Sidebar/ShareButton.tsx` - Share button component
- [ ] **T406**: Integrate ShareButton into `ProjectActions.tsx`
- [ ] **T407**: Implement clipboard copy with success toast
- [ ] **T408**: Implement offline detection and disabled state
- [ ] **T409**: Add first-use privacy notice (localStorage flag)

**File: `src/hooks/useShareAnimation.ts`**:
```typescript
import { useState } from 'react';
import { serializeForShare } from '@/utils/serializeForShare';
import type { Project } from '@/types';

export function useShareAnimation() {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareAnimation = async (project: Project): Promise<string | null> => {
    setIsSharing(true);
    setError(null);

    try {
      const payload = serializeForShare(project);

      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create share');
      }

      const { id } = await response.json();
      const shareUrl = `${window.location.origin}/replay/${id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);

      return shareUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  return { shareAnimation, isSharing, error };
}
```

**File: `src/components/Sidebar/ShareButton.tsx`**:
```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/UI/Button';
import { useShareAnimation } from '@/hooks/useShareAnimation';
import { useProjectStore } from '@/store/projectStore';
import { toast } from 'sonner'; // or your toast library

const PRIVACY_NOTICE_KEY = 'share_privacy_notice_shown';

export function ShareButton() {
  const project = useProjectStore(state => state.project);
  const { shareAnimation, isSharing, error } = useShareAnimation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleShare = async () => {
    if (!project) return;

    // Show privacy notice on first use
    const noticeShown = localStorage.getItem(PRIVACY_NOTICE_KEY);
    if (!noticeShown) {
      toast.info(
        'Privacy Notice: Shared animations are stored for 90 days. No user tracking.',
        { duration: 5000 }
      );
      localStorage.setItem(PRIVACY_NOTICE_KEY, 'true');
    }

    const url = await shareAnimation(project);
    if (url) {
      toast.success('Link copied to clipboard! Paste into WhatsApp.');
    } else if (error) {
      toast.error(`Failed to share: ${error}`);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={!project || !isOnline || isSharing}
      variant="secondary"
    >
      {isSharing ? 'Sharing...' : isOnline ? 'Share Link 🌐' : 'Offline - Cannot Share'}
    </Button>
  );
}
```

**Acceptance Criteria**:
- Share button appears in ProjectActions sidebar
- Clicking share button serializes animation and POSTs to /api/share
- Share URL copied to clipboard automatically
- Success toast shows "Link copied - paste into WhatsApp"
- Offline state disables button with "Offline - Cannot Share" label
- Privacy notice shows on first use (persisted in localStorage)
- Error handling shows user-friendly messages

#### Sub-Phase 4.3: Replay Page Implementation
**Estimated Effort**: 2.5 hours

**Tasks**:
- [ ] **T410**: Create `src/hooks/useSharePayload.ts` - Fetch shared payload by ID
- [ ] **T411**: Create `src/components/Replay/ReplayPage.tsx` - Read-only replay view
- [ ] **T412**: Add `/replay/:id` route to `App.tsx`
- [ ] **T413**: Implement auto-play on load
- [ ] **T414**: Disable all editing controls (entities not draggable)
- [ ] **T415**: Add loading spinner and error states
- [ ] **T416**: Test on mobile viewport (responsive design)

**File: `src/hooks/useSharePayload.ts`**:
```typescript
import { useState, useEffect } from 'react';
import type { SharePayloadV1 } from '@/types/share';

export function useSharePayload(shareId: string | undefined) {
  const [payload, setPayload] = useState<SharePayloadV1 | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share ID');
      setIsLoading(false);
      return;
    }

    const fetchPayload = async () => {
      try {
        const response = await fetch(`/api/share/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Share not found');
          } else if (response.status === 410) {
            throw new Error('Share expired (90-day limit)');
          } else {
            throw new Error('Failed to load animation');
          }
        }

        const data = await response.json();
        setPayload(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayload();
  }, [shareId]);

  return { payload, isLoading, error };
}
```

**File: `src/components/Replay/ReplayPage.tsx`**:
```typescript
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useSharePayload } from '@/hooks/useSharePayload';
import { CanvasStage } from '@/components/Canvas/Stage';
import { useProjectStore } from '@/store/projectStore';

export function ReplayPage() {
  const { id } = useParams<{ id: string }>();
  const { payload, isLoading, error } = useSharePayload(id);
  const { loadFromSharePayload, play } = useProjectStore();

  useEffect(() => {
    if (payload) {
      // Convert SharePayloadV1 to Project format
      loadFromSharePayload(payload);

      // Auto-play with loop enabled
      play({ loop: true });
    }
  }, [payload, loadFromSharePayload, play]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner" /> {/* Your spinner component */}
          <p>Loading animation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Unable to Load Animation</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-primary text-white p-4">
        <h1>Shared Rugby Animation</h1>
      </header>
      <main className="flex-1">
        <CanvasStage readOnly={true} />
      </main>
      {/* Optional: Minimal controls (play/pause only) */}
    </div>
  );
}
```

**Acceptance Criteria**:
- `/replay/:id` route loads shared animation from backend
- Animation auto-plays on load with looping enabled
- Loading spinner shows while fetching payload
- Error messages display for 404 (not found) and 410 (expired)
- No editing controls visible (entities not draggable, no sidebar)
- Mobile-responsive layout (tested at 375px width)
- Works on iOS Safari and Android Chrome

**Phase 4 Completion Criteria**:
- Share button functional in ProjectActions
- Clipboard copy works reliably
- Replay page loads and displays animations correctly
- End-to-end flow tested: Create → Share → WhatsApp → View
- All acceptance scenarios from User Story 10 pass

---

### Phase 5: Testing & Verification

**Objective**: Comprehensive end-to-end testing, security validation, and user acceptance.

**Status**: PENDING (requires Phase 4 completion)

#### Sub-Phase 5.1: Functional Testing
**Estimated Effort**: 1.5 hours

**Test Cases**:
- [ ] **T501**: Create 2-frame animation, share link, verify clipboard copy
- [ ] **T502**: Open shared link in new browser tab, verify auto-play
- [ ] **T503**: Open shared link on mobile device (iOS Safari, Android Chrome)
- [ ] **T504**: Test offline mode: disconnect network, verify button disabled
- [ ] **T505**: Test privacy notice: clear localStorage, verify notice on first share
- [ ] **T506**: Test with 10-frame complex animation (multiple players, ball)
- [ ] **T507**: Verify animation loops continuously on replay page

**Acceptance Criteria**:
- All User Story 10 acceptance scenarios pass
- Success Criteria SC-011 met (link generation <2s, mobile playback immediate)
- No console errors in browser dev tools

#### Sub-Phase 5.2: Security & Edge Case Testing
**Estimated Effort**: 1 hour

**Test Cases**:
- [ ] **T508**: Attempt to share oversized animation (>100KB payload) - expect 413 error
- [ ] **T509**: Attempt to fetch non-existent share ID - expect 404
- [ ] **T510**: Verify CORS headers prevent unauthorized domain access
- [ ] **T511**: Inspect generated share URL - verify UUID format
- [ ] **T512**: Test share expiry (optional: manually update `expires_at` in DB, verify 410 response)

**Acceptance Criteria**:
- Payload size validation prevents abuse
- Share IDs are cryptographically random UUIDs
- CORS headers correctly configured
- Error messages are generic (no internal details leaked)

#### Sub-Phase 5.3: WhatsApp Integration Testing
**Estimated Effort**: 30 minutes

**Test Cases**:
- [ ] **T513**: Copy share link, paste into WhatsApp Web, send to self
- [ ] **T514**: Tap link in WhatsApp on mobile device, verify opens in browser
- [ ] **T515**: Verify link preview (if available) shows generic title
- [ ] **T516**: Test with WhatsApp Desktop app

**Acceptance Criteria**:
- **Litmus Test PASSES**: A coach can send a WhatsApp message containing only a link, and another coach can tap it and immediately see the drill play
- Link opens in default browser (not in-app WebView issues)
- Animation plays correctly on first load

**Phase 5 Completion Criteria**:
- All functional tests pass
- Security baseline verified
- WhatsApp litmus test successful
- No critical bugs identified

---

### Phase 6: Deployment & Monitoring (Optional)

**Objective**: Production deployment, optional monitoring setup, and documentation.

**Status**: PENDING (requires Phase 5 completion)

#### Sub-Phase 6.1: Production Deployment
**Estimated Effort**: 30 minutes

**Tasks**:
- [ ] **T601**: Deploy frontend to Vercel production
- [ ] **T602**: Verify Vercel Functions environment variables in production
- [ ] **T603**: Test production share URL generation and replay
- [ ] **T604**: Update FRONTEND_URL in Vercel environment variables to production domain

**Acceptance Criteria**:
- Production deployment accessible at production domain
- Share links use production domain (not localhost or preview URLs)
- All functionality works in production environment

#### Sub-Phase 6.2: Documentation & Handoff
**Estimated Effort**: 1 hour

**Tasks**:
- [ ] **T605**: Document Supabase setup instructions in `docs/BACKEND_SETUP.md`
- [ ] **T606**: Document environment variables in `.env.local.example`
- [ ] **T607**: Update README.md with share feature description
- [ ] **T608**: Add troubleshooting guide for common issues (CORS, offline mode, expiry)

**Acceptance Criteria**:
- Backend setup instructions clear and reproducible
- Environment variables documented
- README.md reflects new share capability
- Troubleshooting guide addresses common user questions

**Phase 6 Completion Criteria**:
- Production deployment stable
- Documentation complete and accurate
- Feature ready for user distribution

---

## Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Supabase free tier limits exceeded | Medium | Low | 90-day expiry prevents unbounded growth; monitor usage |
| CORS misconfiguration blocks share | High | Medium | Thorough testing in Phase 5; document CORS headers |
| Mobile browser compatibility issues | Medium | Medium | Test on iOS Safari and Android Chrome in Phase 5.3 |
| Users share sensitive tactical data | Low | Medium | Privacy notice warns users; no access control in MVP |
| Share links enumerated/abused | Low | Low | UUIDs provide security by obscurity; rate limiting in Phase 2 |
| Backend costs exceed free tier | Low | Low | Vercel Functions free tier generous; Supabase free tier sufficient |

---

## Success Metrics

### MVP Success (Phase 5 Complete)
- [ ] Litmus Test passes: WhatsApp link → immediate playback
- [ ] SC-011 met: Share link generation <2s, mobile playback immediate
- [ ] Zero critical bugs in production
- [ ] All acceptance scenarios from User Story 10 pass

### Post-Launch Success (Optional Monitoring)
- Share link click-through rate (if analytics added later)
- Average payload size (ensure <100KB compliance)
- Share expiry rate (90-day threshold)

---

## Constitutional Compliance Checklist

- [x] **Necessity Test**: Cannot implement share via offline-first (requires backend storage)
- [x] **Privacy Impact Assessment**: Transmits animation payload only, no user identity, 90-day retention
- [x] **Amendment Approval**: Constitution v2.0.0 ratified with Principle V.2 (Tier 2 features)
- [x] **Mandatory Safeguards Met**:
  - [x] Explicit user consent (button click)
  - [x] Clear visual indication ("Share Link 🌐")
  - [x] Graceful degradation (offline mode disables button)
  - [x] Privacy disclosure (first-use notice)
- [x] **Data Retention Policy**: 90-day automatic expiration (Constitution V.3)
- [x] **Security Baseline**: Payload validation, CORS headers, UUID generation (Constitution V.4)
- [x] **Absolute Prohibitions Respected**: No telemetry, no persistent accounts, no third-party services (Constitution V.6)

---

## Estimated Total Effort

| Phase | Effort |
|-------|--------|
| Phase 1: Governance & Documentation | ✅ Complete |
| Phase 2: Codebase Cleanup | 35 minutes |
| Phase 3: Backend Setup | 3 hours |
| Phase 4: Frontend Implementation | 6 hours |
| Phase 5: Testing & Verification | 3 hours |
| Phase 6: Deployment & Docs | 1.5 hours |
| **Total** | **13.5-14 hours** |

**Note**: This is developer time; user time for Supabase account creation and configuration is additional (~30 minutes).

---

## Approval & Next Steps

**Plan Status**: Awaiting user approval for Phase 2 execution.

**Upon Approval**:
1. Execute Phase 2 (codebase cleanup)
2. Proceed to Phase 3 (backend setup) with user guidance for Supabase account creation
3. Implement Phase 4 (frontend) in discrete sub-phases
4. Comprehensive testing in Phase 5
5. Production deployment in Phase 6

**User Decision Required**:
- Approve Phase 2 cleanup tasks?
- Ready to create Supabase account for Phase 3?
- Preferred Supabase project name?

---

**Plan End**
