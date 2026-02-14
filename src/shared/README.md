# Shared Module

## Overview

The shared module provides reusable UI components and primitives used across all features. It serves as the design system foundation and common UI patterns for the application.

**Location**: `src/shared/`
**Purpose**: Reusable UI components, design system, cross-feature patterns
**Dependencies**: React, Tailwind v4, shadcn/ui patterns

## Architecture

### Module Structure

```
src/shared/
├── components/          # Application-specific shared components
│   ├── DeleteConfirmDialog.tsx      # Confirmation dialog for deletions
│   ├── EditMetadataModal.tsx        # Edit animation metadata
│   ├── ReportModal.tsx              # Report content (moderation)
│   ├── SaveToCloudModal.tsx         # Cloud save dialog
│   ├── Navigation.tsx               # Top navigation bar
│   ├── ErrorBoundary.tsx            # Error boundary wrapper
│   ├── OfflineIndicator.tsx         # PWA offline status
│   └── OnboardingTutorial.tsx       # Welcome tutorial
├── ui/                  # Base UI primitives (shadcn/ui inspired)
│   ├── button.tsx       # Button component
│   ├── dialog.tsx       # Modal dialog primitives
│   ├── input.tsx        # Text input
│   ├── select.tsx       # Dropdown select
│   ├── slider.tsx       # Range slider
│   ├── ColorPicker.tsx  # Color picker with presets
│   ├── ConfirmDialog.tsx           # Confirmation dialog hook
│   └── EntityContextMenu.tsx       # Right-click menu for entities
└── index.ts             # Barrel export (public API)
```

### Dependency Rules

The shared module is **feature-agnostic**:

```
✅ features/animation/ → @/shared
✅ features/gallery/   → @/shared
✅ shared/             → @/core (for types, utilities)
❌ shared/             → features/* (NEVER)
```

**Why?** Shared components are reusable across all features. They should not depend on specific feature logic to remain portable and testable in isolation.

## Application Components

### Modals & Dialogs

#### DeleteConfirmDialog.tsx

Confirmation dialog for deletion actions (animations, entities, etc.).

**Props**:
```typescript
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isDeleting?: boolean;
}
```

**Usage**:
```typescript
import { DeleteConfirmDialog } from '@/shared';

function MyComponent() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await fetch('/api/animations/123', { method: 'DELETE' });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDeleteDialog(true)}>
        Delete Animation
      </button>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Animation?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </>
  );
}
```

#### EditMetadataModal.tsx

Modal for editing animation metadata (name, description, visibility).

**Props**:
```typescript
interface EditMetadataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animation: SavedAnimation;
  onSave: (updates: { name?: string; description?: string; visibility?: string }) => void;
}
```

**Usage**:
```typescript
import { EditMetadataModal } from '@/shared';

function AnimationCard({ animation }: { animation: SavedAnimation }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSave = async (updates: { name?: string; description?: string }) => {
    await fetch(`/api/animations/${animation.id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setShowEditModal(false);
  };

  return (
    <>
      <button onClick={() => setShowEditModal(true)}>Edit</button>

      <EditMetadataModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        animation={animation}
        onSave={handleSave}
      />
    </>
  );
}
```

#### ReportModal.tsx

Modal for reporting content (animations) for moderation.

**Props**:
```typescript
interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animationId: string;
  onReport: (reason: string) => void;
}
```

**Report Reasons**:
- Inappropriate content
- Spam
- Copyright violation
- Other

**Usage**:
```typescript
import { ReportModal } from '@/shared';

function PublicAnimationCard({ animation }: { animation: SavedAnimation }) {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleReport = async (reason: string) => {
    await fetch('/api/report', {
      method: 'POST',
      body: JSON.stringify({ animation_id: animation.id, reason }),
    });
    setShowReportModal(false);
    toast.success('Report submitted');
  };

  return (
    <>
      <button onClick={() => setShowReportModal(true)}>Report</button>

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        animationId={animation.id}
        onReport={handleReport}
      />
    </>
  );
}
```

#### SaveToCloudModal.tsx

Modal for saving animations to cloud (requires authentication).

**Props**:
```typescript
interface SaveToCloudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metadata: {
    name: string;
    description?: string;
    visibility: 'private' | 'link-shared' | 'public';
  }) => void;
  isSaving?: boolean;
}
```

**Usage**:
```typescript
import { SaveToCloudModal } from '@/shared';
import { useShareAnimation } from '@/core';

function Editor() {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { shareAnimation, isSharing } = useShareAnimation();

  const handleSave = async (metadata: { name: string; description?: string; visibility: string }) => {
    const result = await shareAnimation(metadata);
    if (result.success) {
      setShowSaveModal(false);
      toast.success('Saved to cloud!');
    }
  };

  return (
    <>
      <button onClick={() => setShowSaveModal(true)}>
        Save to Cloud
      </button>

      <SaveToCloudModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={handleSave}
        isSaving={isSharing}
      />
    </>
  );
}
```

### Navigation & Layout

#### Navigation.tsx

Top navigation bar with authentication, user menu, and page links.

**Props**: None (reads from `UserContext`)

**Features**:
- Logo and branding
- Main navigation links (Home, Gallery, My Gallery)
- User menu (Profile, Sign Out)
- Guest state (Sign In, Register)
- Responsive mobile menu

**Usage**:
```typescript
import { Navigation } from '@/shared';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

#### ErrorBoundary.tsx

React error boundary for catching and displaying errors.

**Props**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Usage**:
```typescript
import { ErrorBoundary } from '@/shared';

export default function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### OfflineIndicator.tsx

PWA offline status indicator (toast notification).

**Props**: None

**Features**:
- Shows toast when app goes offline
- Auto-dismisses when back online
- Uses `navigator.onLine` API

**Usage**:
```typescript
import { OfflineIndicator } from '@/shared';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Navigation />
        <OfflineIndicator />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

#### OnboardingTutorial.tsx

Welcome tutorial for first-time users (editor only).

**Props**: None (reads from localStorage)

**Features**:
- Multi-step walkthrough
- Highlights key UI elements
- "Don't show again" checkbox
- Dismissible

**Storage Key**: `coaching-animator-tutorial-seen`

**Usage**:
```typescript
import { OnboardingTutorial } from '@/shared';

export default function EditorPage() {
  return (
    <div>
      <OnboardingTutorial />
      <Editor />
    </div>
  );
}
```

## UI Primitives

### Base Components (shadcn/ui inspired)

#### Button

**File**: `ui/button.tsx`

**Variants**: default, destructive, outline, ghost, link
**Sizes**: sm, md, lg

**Usage**:
```typescript
import { Button } from '@/shared/ui/button';

<Button variant="default" size="md" onClick={() => console.log('Clicked')}>
  Click Me
</Button>

<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost" size="sm">Icon Only</Button>
```

#### Dialog

**File**: `ui/dialog.tsx`

**Components**: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

**Usage**:
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';

function MyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description text.
          </DialogDescription>
        </DialogHeader>

        <div>Dialog body content</div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Input

**File**: `ui/input.tsx`

**Types**: text, email, password, number, search

**Usage**:
```typescript
import { Input } from '@/shared/ui/input';

<Input
  type="text"
  placeholder="Enter name..."
  value={name}
  onChange={(e) => setName(e.target.value)}
/>

<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" min={0} max={100} />
```

#### Select

**File**: `ui/select.tsx`

**Components**: Select, SelectContent, SelectItem, SelectTrigger, SelectValue

**Usage**:
```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

<Select value={sport} onValueChange={setSport}>
  <SelectTrigger>
    <SelectValue placeholder="Select sport" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="rugby-union">Rugby Union</SelectItem>
    <SelectItem value="rugby-league">Rugby League</SelectItem>
    <SelectItem value="soccer">Soccer</SelectItem>
  </SelectContent>
</Select>
```

#### Slider

**File**: `ui/slider.tsx`

**Usage**:
```typescript
import { Slider } from '@/shared/ui/slider';

<Slider
  value={[rotation]}
  onValueChange={([value]) => setRotation(value)}
  min={0}
  max={360}
  step={15}
/>
```

### Custom UI Components

#### ColorPicker

**File**: `ui/ColorPicker.tsx`

Color picker with preset palette and custom color input.

**Props**:
```typescript
interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  presets?: string[];
}
```

**Usage**:
```typescript
import { ColorPicker } from '@/shared/ui/ColorPicker';
import { DESIGN_TOKENS } from '@/core';

function EntityProperties() {
  const [color, setColor] = useState('#ef4444');

  return (
    <ColorPicker
      color={color}
      onChange={setColor}
      presets={[
        DESIGN_TOKENS.colors.attack[0],
        DESIGN_TOKENS.colors.attack[1],
        DESIGN_TOKENS.colors.defense[0],
        DESIGN_TOKENS.colors.defense[1],
      ]}
    />
  );
}
```

#### ConfirmDialog

**File**: `ui/ConfirmDialog.tsx`

Reusable confirmation dialog hook.

**Usage**:
```typescript
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

function MyComponent() {
  const { confirm, ConfirmDialogComponent } = ConfirmDialog();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Animation?',
      description: 'This action cannot be undone.',
      confirmText: 'Delete',
    });

    if (confirmed) {
      // Perform delete
    }
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>
      {ConfirmDialogComponent}
    </>
  );
}
```

#### EntityContextMenu

**File**: `ui/EntityContextMenu.tsx`

Right-click context menu for canvas entities.

**Props**:
```typescript
interface EntityContextMenuProps {
  entityId: string;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onPropagate: () => void;
}
```

**Usage**:
```typescript
import { EntityContextMenu } from '@/shared/ui/EntityContextMenu';

function Canvas() {
  const [contextMenuEntity, setContextMenuEntity] = useState<string | null>(null);

  return (
    <div onContextMenu={(e) => {
      e.preventDefault();
      setContextMenuEntity('entity-123');
    }}>
      {contextMenuEntity && (
        <EntityContextMenu
          entityId={contextMenuEntity}
          onEdit={() => console.log('Edit')}
          onDelete={() => console.log('Delete')}
          onDuplicate={() => console.log('Duplicate')}
          onPropagate={() => console.log('Propagate')}
        />
      )}
    </div>
  );
}
```

## Design System

### Tailwind v4 Integration

The shared module uses **Tailwind v4** with CSS-based configuration:

**File**: `src/app/globals.css`

```css
@theme {
  --color-primary: #ef4444;
  --color-secondary: #3b82f6;

  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-md: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
}
```

### Component Styling Patterns

#### Using Tailwind Classes
```typescript
<Button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
  Click Me
</Button>
```

#### Using CSS Custom Properties
```typescript
<div style={{ padding: 'var(--spacing-md)' }}>
  Content
</div>
```

#### Responsive Design
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

### Accessibility

All shared components follow accessibility best practices:

- **Semantic HTML**: Use proper HTML elements (`<button>`, `<input>`, etc.)
- **ARIA Labels**: Add `aria-label`, `aria-describedby` where needed
- **Keyboard Navigation**: Support Tab, Enter, Escape keys
- **Focus Management**: Visible focus states, logical tab order
- **Screen Reader Support**: Descriptive labels, live regions for dynamic content

**Example**:
```typescript
<Button
  aria-label="Delete animation"
  aria-describedby="delete-description"
  onClick={handleDelete}
>
  <TrashIcon />
</Button>
<span id="delete-description" className="sr-only">
  This action cannot be undone
</span>
```

## Testing Patterns

### Component Tests

Test shared components in isolation:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/shared/ui/button';

test('renders button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);

  fireEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('supports variant styles', () => {
  const { container } = render(<Button variant="destructive">Delete</Button>);
  expect(container.firstChild).toHaveClass('bg-destructive');
});
```

### Dialog Tests

Test modal dialogs with user interactions:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteConfirmDialog } from '@/shared';

test('shows confirmation dialog', () => {
  render(
    <DeleteConfirmDialog
      open={true}
      onOpenChange={() => {}}
      title="Delete Animation?"
      description="This action cannot be undone."
      onConfirm={() => {}}
    />
  );

  expect(screen.getByText('Delete Animation?')).toBeInTheDocument();
  expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
});

test('calls onConfirm when confirm button clicked', async () => {
  const onConfirm = jest.fn();
  render(
    <DeleteConfirmDialog
      open={true}
      onOpenChange={() => {}}
      title="Delete Animation?"
      description="This action cannot be undone."
      onConfirm={onConfirm}
      confirmText="Delete"
    />
  );

  fireEvent.click(screen.getByText('Delete'));
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
});
```

### Accessibility Tests

Test accessibility with `jest-axe`:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/shared/ui/button';

expect.extend(toHaveNoViolations);

test('button has no accessibility violations', async () => {
  const { container } = render(<Button>Click Me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Usage Examples

### Basic Import Pattern

```typescript
// Application components
import {
  DeleteConfirmDialog,
  EditMetadataModal,
  ReportModal,
  SaveToCloudModal,
  Navigation,
  ErrorBoundary,
  OfflineIndicator,
  OnboardingTutorial,
} from '@/shared';

// UI primitives
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  ColorPicker,
  ConfirmDialog,
  EntityContextMenu,
} from '@/shared';
```

### Creating a Form with Shared Components

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared';

function CreateAnimationForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<string>('rugby-union');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Save animation
    console.log({ name, sport, description });
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create Animation</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Animation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Animation name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rugby-union">Rugby Union</SelectItem>
                <SelectItem value="rugby-league">Rugby League</SelectItem>
                <SelectItem value="soccer">Soccer</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Using Multiple Modals

```typescript
import { useState } from 'react';
import {
  DeleteConfirmDialog,
  EditMetadataModal,
  SaveToCloudModal,
} from '@/shared';

function AnimationCard({ animation }: { animation: SavedAnimation }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditModal(true)}>Edit</button>
      <button onClick={() => setShowDeleteDialog(true)}>Delete</button>
      <button onClick={() => setShowSaveModal(true)}>Save</button>

      <EditMetadataModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        animation={animation}
        onSave={(updates) => console.log('Save', updates)}
      />

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Animation?"
        description="This action cannot be undone."
        onConfirm={() => console.log('Delete')}
      />

      <SaveToCloudModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        onSave={(metadata) => console.log('Save to cloud', metadata)}
      />
    </div>
  );
}
```

## Future Enhancements

### V2.0 Features (Planned)

1. **Enhanced Components**
   - Toast notification system (replacing `sonner`)
   - Dropdown menu component
   - Popover component
   - Tooltip component
   - Badge component
   - Card component

2. **Advanced Modals**
   - Multi-step wizard modal
   - Fullscreen modal variant
   - Drawer/Sheet component (mobile-friendly)

3. **Data Display**
   - Table component with sorting/filtering
   - Pagination component
   - Infinite scroll component
   - Empty state component

4. **Forms**
   - Form validation (React Hook Form integration)
   - Field error messages
   - Field descriptions
   - Character count for text inputs

5. **Feedback**
   - Loading spinners
   - Skeleton loaders
   - Progress bars
   - Alert banners

6. **Navigation**
   - Breadcrumb component
   - Tabs component
   - Stepper component

### Technical Debt

1. **Accessibility**
   - Add keyboard navigation for all interactive components
   - Add screen reader support for complex components
   - Add focus management for modals
   - Add ARIA live regions for dynamic content

2. **Testing**
   - Missing tests for `Navigation`
   - Missing tests for `OfflineIndicator`
   - Missing tests for `OnboardingTutorial`
   - Add visual regression tests (Chromatic)

3. **Documentation**
   - Add Storybook for component documentation
   - Add JSDoc comments for all props
   - Add usage examples for all components

4. **Performance**
   - Lazy load modals (reduce initial bundle size)
   - Optimize re-renders for form inputs
   - Add memoization for expensive computations

## Related Documentation

- **Animation Feature**: [src/features/animation/README.md](../features/animation/README.md) - Editor & ReplayViewer
- **Gallery Feature**: [src/features/gallery/README.md](../features/gallery/README.md) - Gallery components
- **Core Module**: [src/core/README.md](../core/README.md) - Shared utilities
- **Tailwind v4 Docs**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui**: [https://ui.shadcn.com/](https://ui.shadcn.com/)

## Questions?

For architecture questions or contribution guidelines, see:
- **CLAUDE.md** - Project development guidelines
- **docs/development/getting-started.md** - Setup and onboarding
- **docs/troubleshooting/** - Debugging guides
