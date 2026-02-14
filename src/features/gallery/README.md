# Gallery Feature Module

## Overview

The gallery feature module provides UI components for displaying animation collections. It supports both personal galleries (My Gallery) with edit/delete controls and public galleries with upvote/share functionality.

**Location**: `src/features/gallery/`
**Primary Routes**: `/my-gallery` (personal), `/gallery` (public)
**Key Dependencies**: Supabase API, `@/shared` UI components

## Architecture

### Component Hierarchy

```
Gallery Pages
├── MyGalleryPage (/my-gallery)
│   └── AnimationCard (with edit/delete)
│       ├── Metadata (title, description)
│       ├── Thumbnail (static preview)
│       ├── Edit/Delete buttons
│       └── Share button
│
└── PublicGalleryPage (/gallery)
    └── PublicAnimationCard (with upvote/share)
        ├── Metadata (title, author, upvotes)
        ├── Thumbnail (static preview)
        ├── Upvote button
        └── Play button (→ /replay/[id])
```

### Data Flow

1. **Page Load** → Fetch animations from `/api/animations` or `/api/gallery`
2. **API Response** → Array of animation metadata + payload
3. **Component Render** → AnimationCard/PublicAnimationCard per animation
4. **User Interaction** → Upvote/Edit/Delete → API call → Re-fetch
5. **Navigation** → Click card → Navigate to `/replay/[id]` (public) or `/app?load=[id]` (personal)

## Key Components

### AnimationCard.tsx

Personal gallery card for authenticated users with edit/delete controls.

**Props**: None (accepts animation data as prop)

**Key Features**:
- Display animation metadata (title, description, created date)
- Static thumbnail preview (first frame)
- Edit metadata button → Opens `EditMetadataModal`
- Delete button → Opens `DeleteConfirmDialog`
- Share button → Opens share dialog
- Click to load → Navigate to `/app?load=[id]`

**API Calls**:
- `PUT /api/animations/[id]` - Update metadata
- `DELETE /api/animations/[id]` - Delete animation

**State Management**:
- Local state for edit/delete dialogs
- Optimistic updates for immediate UI feedback

**Example Animation Data**:
```typescript
interface SavedAnimation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'link-shared' | 'public';
  payload: ReplayPayload;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  upvotes_count: number;
}
```

### PublicAnimationCard.tsx

Public gallery card for browse-only view with upvote functionality.

**Props**: None (accepts animation data as prop)

**Key Features**:
- Display animation metadata (title, author display name, upvotes)
- Static thumbnail preview (first frame)
- Upvote button → Toggle upvote → API call
- Play button → Navigate to `/replay/[id]`
- Share button → Copy link to clipboard

**API Calls**:
- `POST /api/animations/[id]/upvote` - Toggle upvote

**State Management**:
- Local state for upvote status (optimistic updates)
- Toast notifications for errors

**Upvote Behavior**:
- Requires authentication (show login prompt if guest)
- Toggle on/off (can remove upvote)
- Updates count immediately (optimistic)
- Reverts on API error

### SkeletonCard.tsx

Loading skeleton component for gallery cards during data fetch.

**Props**: None

**Features**:
- Animated shimmer effect
- Matches AnimationCard/PublicAnimationCard dimensions
- Used during initial page load and infinite scroll

**Usage**:
```typescript
// Show 6 skeleton cards while loading
{isLoading && Array.from({ length: 6 }).map((_, i) => (
  <SkeletonCard key={i} />
))}
```

## Usage Examples

### Basic Import Pattern

```typescript
import {
  AnimationCard,
  PublicAnimationCard,
  SkeletonCard,
} from '@/features/gallery';
```

### Personal Gallery Page

```typescript
// src/app/my-gallery/page.tsx
'use client';

import { AnimationCard, SkeletonCard } from '@/features/gallery';
import { useEffect, useState } from 'react';

export default function MyGalleryPage() {
  const [animations, setAnimations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/animations')
      .then(res => res.json())
      .then(data => {
        setAnimations(data);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
        {!isLoading && animations.map(animation => (
          <AnimationCard
            key={animation.id}
            animation={animation}
            onDelete={() => {
              // Optimistically remove from UI
              setAnimations(prev => prev.filter(a => a.id !== animation.id));
            }}
            onUpdate={(updated) => {
              // Optimistically update in UI
              setAnimations(prev => prev.map(a =>
                a.id === animation.id ? { ...a, ...updated } : a
              ));
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Public Gallery Page with Search

```typescript
// src/app/gallery/page.tsx
'use client';

import { PublicAnimationCard, SkeletonCard } from '@/features/gallery';
import { useEffect, useState } from 'react';
import { Input } from '@/shared/ui/input';

export default function PublicGalleryPage() {
  const [animations, setAnimations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    fetch(`/api/gallery?${params}`)
      .then(res => res.json())
      .then(data => {
        setAnimations(data);
        setIsLoading(false);
      });
  }, [search]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Public Gallery</h1>

      {/* Search Input */}
      <Input
        type="text"
        placeholder="Search animations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-md"
      />

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
        {!isLoading && animations.map(animation => (
          <PublicAnimationCard
            key={animation.id}
            animation={animation}
            onUpvote={(newCount) => {
              // Optimistically update upvote count
              setAnimations(prev => prev.map(a =>
                a.id === animation.id
                  ? { ...a, upvotes_count: newCount }
                  : a
              ));
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### Infinite Scroll Gallery

```typescript
// src/app/gallery/page.tsx with infinite scroll
'use client';

import { PublicAnimationCard, SkeletonCard } from '@/features/gallery';
import { useEffect, useState, useRef, useCallback } from 'react';

export default function PublicGalleryPage() {
  const [animations, setAnimations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const res = await fetch(`/api/gallery?page=${page}&limit=12`);
    const data = await res.json();

    setAnimations(prev => [...prev, ...data]);
    setHasMore(data.length === 12);
    setPage(prev => prev + 1);
    setIsLoading(false);
  }, [page, hasMore, isLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Public Gallery</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animations.map(animation => (
          <PublicAnimationCard
            key={animation.id}
            animation={animation}
          />
        ))}
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className="h-10" />
    </div>
  );
}
```

## State Management

### No Zustand Stores

Gallery components are **stateless** - they accept data as props and fire callbacks. State management is handled by page-level components using React `useState`.

**Why?** Gallery features don't require complex global state. Page-level state is sufficient for:
- Animation list
- Loading states
- Search/filter params
- Pagination

### Optimistic Updates Pattern

Gallery components use optimistic updates for better UX:

```typescript
// Upvote example
const handleUpvote = async (animationId: string) => {
  const previousCount = upvotesCount;
  const isUpvoted = userHasUpvoted;

  // 1. Update UI immediately (optimistic)
  setUpvotesCount(prev => isUpvoted ? prev - 1 : prev + 1);
  setUserHasUpvoted(!isUpvoted);

  try {
    // 2. Send API request
    const res = await fetch(`/api/animations/${animationId}/upvote`, {
      method: 'POST',
    });
    const data = await res.json();

    // 3. Update with server response
    setUpvotesCount(data.upvotes_count);
    setUserHasUpvoted(data.user_has_upvoted);
  } catch (error) {
    // 4. Revert on error
    setUpvotesCount(previousCount);
    setUserHasUpvoted(isUpvoted);
    toast.error('Failed to update upvote');
  }
};
```

## Testing Patterns

### Component Tests

Test gallery cards in isolation:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicAnimationCard } from '@/features/gallery';

test('renders animation card with metadata', () => {
  const animation = {
    id: '123',
    name: 'Test Animation',
    description: 'Test description',
    upvotes_count: 5,
    user_profiles: { display_name: 'John Doe' },
    created_at: '2026-02-14T00:00:00Z',
  };

  render(<PublicAnimationCard animation={animation} onUpvote={() => {}} />);

  expect(screen.getByText('Test Animation')).toBeInTheDocument();
  expect(screen.getByText('Test description')).toBeInTheDocument();
  expect(screen.getByText('5')).toBeInTheDocument(); // Upvote count
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

test('upvote button calls onUpvote callback', async () => {
  const onUpvote = jest.fn();
  const animation = { id: '123', upvotes_count: 5 };

  render(<PublicAnimationCard animation={animation} onUpvote={onUpvote} />);

  const upvoteButton = screen.getByRole('button', { name: /upvote/i });
  fireEvent.click(upvoteButton);

  expect(onUpvote).toHaveBeenCalledWith(6); // Optimistic increment
});
```

### E2E Tests (Playwright)

Test full gallery workflow:

```typescript
import { test, expect } from '@playwright/test';

test('can browse public gallery and upvote', async ({ page }) => {
  await page.goto('/gallery');

  // Wait for gallery to load
  await expect(page.locator('[data-testid="animation-card"]')).toHaveCount(12);

  // Click first animation
  await page.locator('[data-testid="animation-card"]').first().click();

  // Should navigate to replay page
  await expect(page).toHaveURL(/\/replay\/[a-z0-9-]+/);

  // Go back to gallery
  await page.goBack();

  // Upvote animation (requires auth)
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('[type="submit"]');

  await page.goto('/gallery');
  const upvoteButton = page.locator('[data-testid="upvote-button"]').first();
  const initialCount = await upvoteButton.locator('[data-testid="upvote-count"]').textContent();

  await upvoteButton.click();

  // Should increment count
  const newCount = await upvoteButton.locator('[data-testid="upvote-count"]').textContent();
  expect(Number(newCount)).toBe(Number(initialCount) + 1);
});
```

## Future Enhancements

### V2.0 Features (Planned)

1. **Collections & Playlists**
   - User-created drill collections
   - Share collections publicly
   - Clone entire collections to personal library

2. **Advanced Filtering**
   - Filter by sport type
   - Filter by difficulty level
   - Filter by drill category (attack, defense, conditioning)
   - Sort by recent, popular, most upvoted

3. **Social Features**
   - Follow users to see their animations
   - Activity feed for followed users
   - Comments on animations
   - Embed animations in external sites

4. **Offline Support**
   - PWA caching for gallery thumbnails
   - Offline viewing of favorited animations
   - Sync on reconnect

5. **Analytics**
   - View counts per animation (privacy-preserving)
   - Popular drills dashboard
   - Trending animations feed

6. **Remixing**
   - Clone animation to personal gallery (currently planned)
   - Track remix lineage (original author attribution)
   - Remix statistics

### Technical Debt

1. **Performance**
   - Virtualize gallery grid for large lists (>100 animations)
   - Lazy load thumbnails with Intersection Observer
   - Add image CDN for faster thumbnail loading

2. **Accessibility**
   - Keyboard navigation for gallery cards
   - Screen reader support for upvote counts
   - Focus management for modals

3. **Testing**
   - Missing tests for `AnimationCard` edit/delete flows
   - Missing tests for infinite scroll behavior
   - E2E tests for search functionality

## API Integration

### GET /api/animations

Fetch user's personal animations (authenticated only).

**Response**:
```typescript
Array<{
  id: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'link-shared' | 'public';
  payload: ReplayPayload;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  upvotes_count: number;
}>
```

### GET /api/gallery

Fetch public animations (guest-accessible).

**Query Params**:
- `search?: string` - Search by title/description
- `page?: number` - Pagination (default: 1)
- `limit?: number` - Results per page (default: 12, max: 50)

**Response**:
```typescript
Array<{
  id: string;
  name: string;
  description: string | null;
  user_profiles: { display_name: string };
  thumbnail_url: string | null;
  created_at: string;
  upvotes_count: number;
  user_has_upvoted: boolean; // If authenticated
}>
```

### POST /api/animations/[id]/upvote

Toggle upvote for animation (authenticated only).

**Response**:
```typescript
{
  upvotes_count: number;
  user_has_upvoted: boolean;
}
```

Full API documentation: [docs/architecture/api-contracts.md](../../../docs/architecture/api-contracts.md)

## Related Documentation

- **Animation Feature**: [src/features/animation/README.md](../animation/README.md) - Editor & ReplayViewer
- **Core Module**: [src/core/README.md](../../core/README.md) - Shared utilities
- **Shared Module**: [src/shared/README.md](../../shared/README.md) - UI components
- **Database Schema**: [docs/architecture/database-schema.md](../../../docs/architecture/database-schema.md)
- **PRD v1.0**: [docs/authority/PRD.md](../../../docs/authority/PRD.md)

## Questions?

For architecture questions or contribution guidelines, see:
- **CLAUDE.md** - Project development guidelines
- **docs/development/getting-started.md** - Setup and onboarding
- **docs/troubleshooting/** - Debugging guides
