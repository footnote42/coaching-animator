# Quickstart: Rugby Animation Tool

**Feature Branch**: `001-rugby-animation-tool`
**Date**: 2026-01-16

This guide provides step-by-step instructions to set up the development environment and run the Rugby Animation Tool locally.

---

## Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18.x or 20.x LTS | `node --version` |
| npm | 9.x+ | `npm --version` |
| Git | 2.x+ | `git --version` |
| Browser | Chrome 90+ or Edge 90+ | N/A |

---

## 1. Project Setup

### Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd coaching-animator

# Switch to feature branch
git checkout 001-rugby-animation-tool

# Install dependencies
npm install
```

### Expected Directory Structure After Setup

```
coaching-animator/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── specs/
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 2. Initialize New Vite + React + TypeScript Project

If starting from scratch (no existing source code):

```bash
# Create new Vite project with React + TypeScript template
npm create vite@latest . -- --template react-ts

# Install core dependencies
npm install react-konva konva zustand lucide-react

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/ui (follow interactive prompts)
npx shadcn@latest init

# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## 3. Configure Tailwind CSS

Update `tailwind.config.js` to enforce Constitution IV (Tactical Clubhouse Aesthetic):

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pitch-green': '#1A3D1A',
        'tactics-white': '#F8F9FA',
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", 'monospace'],
        heading: ["'Inter'", "'Helvetica Neue'", 'sans-serif'],
        body: ["'Inter'", 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0px', // Enforce sharp corners
      },
      borderWidth: {
        DEFAULT: '1px', // Schematic borders
      },
    },
  },
  plugins: [],
}
```

---

## 4. Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020', // Chrome/Edge 90+ compatibility
  },
})
```

---

## 5. Configure TypeScript

Update `tsconfig.json` paths:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 6. Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

---

## 7. Running the Application

### Development Server

```bash
# Start development server with hot reload
npm run dev

# Server runs at http://localhost:5173
```

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test -- --coverage
```

---

## 8. Environment Variables

This application requires **no environment variables** per Constitution V (Offline-First Privacy). All configuration is embedded in source code.

If you need to override defaults during development:

```bash
# Create local overrides (not committed)
touch .env.local
```

Example `.env.local` (optional):

```bash
# Development convenience only - not required
VITE_DEBUG_MODE=true
```

---

## 9. Browser Developer Tools

### Recommended Extensions

| Extension | Purpose |
|-----------|---------|
| React Developer Tools | Component inspection |
| Redux DevTools | Works with Zustand (enable devtools middleware) |

### Zustand DevTools Setup

```typescript
// store/projectStore.ts
import { devtools } from 'zustand/middleware'

const useProjectStore = create<ProjectStore>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'ProjectStore' }
  )
)
```

---

## 10. Verifying Setup

### Smoke Test Checklist

- [ ] `npm run dev` starts without errors
- [ ] Browser opens to `http://localhost:5173`
- [ ] Canvas renders (even if empty)
- [ ] No console errors
- [ ] `npm run build` completes successfully
- [ ] `npm run test` passes (may be empty initially)

### First Component Test

Create `src/utils/interpolation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { lerp } from './interpolation'

describe('lerp', () => {
  it('returns start value when t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0)
  })

  it('returns end value when t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100)
  })

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50)
  })
})
```

Run: `npm run test`

---

## 11. Common Issues

### Issue: Konva SSR Errors

**Symptom**: `window is not defined` during build

**Solution**: Konva requires browser environment. Ensure no server-side rendering:

```typescript
// Lazy load Konva components if needed
const Stage = dynamic(() => import('react-konva').then(m => m.Stage), {
  ssr: false
})
```

### Issue: Tailwind Classes Not Applying

**Symptom**: Styles missing in production

**Solution**: Verify `content` paths in `tailwind.config.js` include all source files.

### Issue: MediaRecorder Not Available

**Symptom**: Export fails on Firefox/Safari

**Solution**: Check browser compatibility. Display user-friendly message:

```typescript
if (!window.MediaRecorder) {
  throw new Error('Video export requires Chrome or Edge browser')
}
```

---

## Next Steps

After verifying the setup:

1. Run `/speckit.tasks` to generate implementation tasks
2. Begin with Phase 1: Foundation (project scaffolding)
3. Follow the implementation plan in `plan.md`
