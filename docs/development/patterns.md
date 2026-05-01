# Development Patterns

**Last Updated**: 2026-02-14

This document captures framework-specific patterns, learnings, and best practices used in the coaching-animator project.

---

## React-Konva Rendering Patterns

### Stage → Layer Hierarchy

**CRITICAL**: The Stage → Layer hierarchy must be correct for React-Konva to render properly.

```typescript
// ✅ Correct - Stage contains Layers
<Stage width={800} height={600} ref={stageRef}>
  <Layer>
    {/* Field background */}
    <Field sport="rugby-union" />
  </Layer>
  <Layer>
    {/* Entities */}
    <EntityLayer entities={entities} />
  </Layer>
  <Layer>
    {/* Annotations */}
    <AnnotationLayer annotations={annotations} />
  </Layer>
</Stage>

// ❌ Incorrect - Missing Layer wrapper
<Stage width={800} height={600}>
  <Field sport="rugby-union" />
  <EntityLayer entities={entities} />
</Stage>
```

### Next.js Integration

React-Konva requires client-side rendering only (no SSR).

```typescript
// ✅ Correct - Use 'use client' directive
'use client';

import dynamic from 'next/dynamic';
import { Stage } from '@/features/animation';

// For components with Konva, disable SSR
const Editor = dynamic(() => import('@/features/animation').then(mod => mod.Editor), {
  ssr: false,
});

export default function AnimationPage() {
  return <Editor />;
}

// ❌ Incorrect - Will crash on SSR
import { Editor } from '@/features/animation';

export default function AnimationPage() {
  return <Editor />; // ERROR: window is not defined
}
```

### Canvas Snapshot Capture

```typescript
import { useRef } from 'react';
import Konva from 'konva';

function MyComponent() {
  const stageRef = useRef<Konva.Stage>(null);

  const captureSnapshot = () => {
    if (!stageRef.current) return;

    // Capture as base64 PNG
    const dataURL = stageRef.current.toDataURL({
      pixelRatio: 2, // Higher quality
    });

    return dataURL;
  };

  return (
    <Stage ref={stageRef} width={800} height={600}>
      {/* Layers */}
    </Stage>
  );
}
```

### Performance Optimization

**Layer Caching** for static elements:

```typescript
<Layer listening={false}> {/* Disable event listeners for performance */}
  <Field sport="rugby-union" />
</Layer>

<Layer listening={true}> {/* Enable for interactive elements */}
  <EntityLayer entities={entities} />
</Layer>
```

**Avoid unnecessary re-renders**:

```typescript
// ✅ Memoize expensive components
const MemoizedField = React.memo(Field);

// ✅ Use ref for non-render state
const isDragging = useRef(false);

// ❌ Avoid state for drag tracking (causes re-renders)
const [isDragging, setIsDragging] = useState(false);
```

---

## Tailwind v4 Patterns

### CSS-Based Configuration

Tailwind v4 uses CSS-based configuration instead of `tailwind.config.js`.

**File**: `src/app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-primary: #ef4444;
  --color-secondary: #3b82f6;
  --color-neutral-0: #ffffff;
  --color-neutral-1: #f5f5f5;
  --color-neutral-2: #fde047; /* High-vis yellow */

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Typography */
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

### Using Custom Properties in Components

```typescript
// ✅ Use Tailwind classes
<div className="bg-primary text-white px-4 py-2 rounded-md">
  Button
</div>

// ✅ Use CSS custom properties directly
<div style={{ padding: 'var(--spacing-md)' }}>
  Content
</div>

// ❌ Avoid hardcoded values
<div style={{ padding: '16px' }}>
  Content
</div>
```

### Design Tokens

Access design tokens via `DESIGN_TOKENS` constant:

```typescript
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';

// ✅ Use for programmatic color access
const attackColor = DESIGN_TOKENS.colors.attack[0]; // '#ef4444'
const spacing = DESIGN_TOKENS.spacing.md; // 16

// ❌ Don't use in JSX (use Tailwind classes instead)
<div style={{ color: DESIGN_TOKENS.colors.primary }}>Text</div>

// ✅ Use Tailwind classes in JSX
<div className="text-primary">Text</div>
```

### Responsive Design

```typescript
// ✅ Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>

// ✅ Conditional rendering for mobile
<div className="hidden md:block">Desktop Only</div>
<div className="block md:hidden">Mobile Only</div>
```

---

## Supabase Auth with Next.js

### Server vs Client Contexts

Supabase clients must be created differently for server and client contexts.

#### Server Components / API Routes

```typescript
// ✅ Server Components (app/page.tsx)
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  return <div>User: {user?.email}</div>;
}

// ✅ API Routes (app/api/route.ts)
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data } = await supabase.from('saved_animations').select('*');

  return Response.json(data);
}
```

#### Client Components

```typescript
// ✅ Client Components
'use client';

import { createBrowserClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [user, setUser] = useState(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [supabase]);

  return <div>User: {user?.email}</div>;
}
```

### Cookie-Based Session Management

**File**: `src/lib/supabase/middleware.ts`

Auth token refresh middleware runs on every request:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refresh session if expired
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### Row Level Security (RLS) Patterns

**Owned Resources** (e.g., saved_animations):

```sql
-- User can only read their own animations
CREATE POLICY "Users can read own animations"
ON saved_animations FOR SELECT
USING (auth.uid() = user_id);

-- User can only insert animations for themselves
CREATE POLICY "Users can insert own animations"
ON saved_animations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User can only update their own animations
CREATE POLICY "Users can update own animations"
ON saved_animations FOR UPDATE
USING (auth.uid() = user_id);
```

**Public Read** (e.g., public gallery):

```sql
-- Anyone can read public animations
CREATE POLICY "Anyone can read public animations"
ON saved_animations FOR SELECT
USING (visibility = 'public');

-- Anyone can read link-shared animations
CREATE POLICY "Anyone can read link-shared animations"
ON saved_animations FOR SELECT
USING (visibility = 'link-shared');
```

---

## State Management (Zustand)

### Store Pattern

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MyStoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyStoreState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    { name: 'MyStore' }
  )
);
```

### Selective Subscriptions

```typescript
// ✅ Subscribe to specific state slice (prevents unnecessary re-renders)
const count = useMyStore((state) => state.count);
const increment = useMyStore((state) => state.increment);

// ❌ Subscribe to entire store (causes re-renders on any state change)
const { count, increment } = useMyStore();
```

### Store Persistence (LocalStorage)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set) => ({
      // State and actions
    }),
    {
      name: 'coaching-animator-project', // LocalStorage key
      partialize: (state) => ({
        // Only persist specific fields
        project: state.project,
      }),
    }
  )
);
```

---

## Development Sync & Persistence

### State Lock-in Pattern

**Issue**: Entities saved in `localStorage` or databases keep their original properties. Updating code defaults does NOT automatically update existing entities.

**Solution**: "Start Fresh" or manual property migration.

```typescript
// ❌ This won't update existing entities
const DEFAULT_CONE_COLOR = '#fde047'; // Changed from '#ffff00'

// ✅ Need migration or manual update
function migrateOldConeColors(entities: Entity[]) {
  return entities.map(entity => {
    if (entity.type === 'cone' && entity.color === '#ffff00') {
      return { ...entity, color: '#fde047' };
    }
    return entity;
  });
}
```

### Hot Module Replacement (HMR) Failures

**Issue**: Root-level initialization logic (like store defaults) may not hot-reload.

**Solution**: Force server restart by trivial edits to `next.config.js` or `package.json`.

```bash
# Force HMR restart
echo "" >> next.config.js
# Or restart dev server
npm run dev
```

### Token Naming Consistency

**Issue**: Naming splits like `colors` vs `colours` cause confusion.

**Solution**: Maintain single source of truth for palette keys.

```typescript
// ✅ Consistent naming
DESIGN_TOKENS.colors.attack
DESIGN_TOKENS.colors.defense

// ❌ Inconsistent naming (avoid)
DESIGN_TOKENS.colours.attack
DESIGN_TOKENS.colors.defense
```

---

## Entity Color Service Pattern

**CRITICAL**: The `EntityColors` service is the mandatory single source of truth for all entity colors.

### Dependency Rule

```
Entities → EntityColors → DESIGN_TOKENS
```

**NEVER** reverse this dependency:
- ❌ Entities should NOT import `DESIGN_TOKENS` directly
- ❌ UI components should NOT hardcode hex values
- ✅ ALL entity color logic goes through `EntityColors` service

### Service API

```typescript
import { EntityColors } from '@/features/animation';

// Get default color for entity type
const coneColor = EntityColors.getDefault('cone'); // '#fde047'
const ballColor = EntityColors.getDefault('ball'); // '#ffffff'
const playerColor = EntityColors.getDefault('player', 'attack'); // '#ef4444'

// Resolve color with fallback
const resolvedColor = EntityColors.resolve(
  entity.color, // May be undefined or empty
  entity.type,
  entity.team
); // Falls back to default if empty
```

### Domain Assumptions

- **Ball: White oval token** (`neutral[0]` = '#ffffff')
- **Cones are High-Vis Yellow** (`neutral[2]` = '#fde047')
- **Players use team colors** (attack: red gradient, defense: blue gradient)

### Empty String Handling

Empty strings are treated as "no color set" for backward compatibility:

```typescript
EntityColors.resolve('', 'cone'); // → '#fde047' (default)
EntityColors.resolve(undefined, 'cone'); // → '#fde047' (default)
EntityColors.resolve('#ff0000', 'cone'); // → '#ff0000' (custom)
```

### Anti-Patterns

```typescript
// ❌ NEVER do this - Hardcoded hex values
const handleAddCone = () => {
  addEntity({ type: 'cone', color: '#fde047' });
};

// ❌ NEVER do this - Direct DESIGN_TOKENS access
const handleAddCone = () => {
  addEntity({ type: 'cone', color: DESIGN_TOKENS.colors.neutral[2] });
};

// ✅ Always use EntityColors service
const handleAddCone = () => {
  addEntity({ type: 'cone', color: EntityColors.getDefault('cone') });
};
```

---

## Testing Patterns

### E2E Testing (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('can create and save animation', async ({ page }) => {
  // Navigate to editor
  await page.goto('/app');

  // Add entity
  await page.click('[data-testid="add-cone-button"]');

  // Verify entity added
  await expect(page.locator('[data-testid="entity-cone"]')).toBeVisible();

  // Save to cloud
  await page.click('[data-testid="save-to-cloud-button"]');

  // Fill metadata
  await page.fill('[name="name"]', 'Test Animation');
  await page.click('[data-testid="save-button"]');

  // Verify success
  await expect(page.locator('text=Saved to cloud')).toBeVisible();
});
```

### Unit Testing (Vitest)

```typescript
import { describe, test, expect } from 'vitest';
import { lerp } from '@/core/utils/interpolation';

describe('interpolation', () => {
  test('lerp interpolates between numbers', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 1)).toBe(100);
  });
});
```

---

## Related Documentation

- **[Tech Stack](tech-stack.md)** - Active technologies
- **[Migration History](../architecture/migration-history.md)** - Migration timeline
- **[Getting Started](getting-started.md)** - Setup and installation
- **[Feature READMEs](../../src/features/)** - Module-specific patterns
- **[Testing Strategy](../testing/strategy.md)** - E2E testing approach
