# Supabase Authentication Patterns

**Last Updated**: 2026-01-31
**Framework**: Next.js 14 App Router with Supabase SSR
**Auth Library**: `@supabase/ssr`

---

## Overview

This guide consolidates Supabase authentication patterns used in coaching-animator. The application uses cookie-based session management with server and client Supabase clients for secure, server-side auth state handling.

---

## Core Concepts

### Session Flow

```
1. User logs in → Supabase Auth → Returns session + refresh token
2. Middleware intercepts → Refreshes token if needed → Sets cookies
3. Client components → Use browser client from cookies
4. Server components → Use server client from cookies
```

### Cookie-Based Sessions

- **Tokens stored in**: HTTP-only cookies (secure, not accessible to JS)
- **Refresh logic**: Middleware automatically refreshes expired tokens
- **SSR compatibility**: Works with Next.js App Router server components

---

## Client Setup

### Browser Client (`lib/supabase/client.ts`)

For use in **client components** only:

```typescript
'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Singleton pattern prevents multiple clients during React Strict Mode
let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export const createBrowserClientSingleton = () => {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    isSingleton: true, // Critical: Prevents AbortErrors on unmount during Strict Mode
  });

  return browserClient;
};

export const supabase = createBrowserClientSingleton();
```

**Key Settings**:
- `isSingleton: true` - Prevents multiple instances during React Strict Mode double-mounting
- `NEXT_PUBLIC_` prefix - Visible to browser (intentional for public anon key)

---

### Server Client (`lib/supabase/server.ts`)

For use in **server components** and **API routes**:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently fail if setting cookies in read-only context
          }
        },
      },
    }
  );
};
```

**Key Points**:
- No singleton pattern (new instance per request is OK)
- `cookies()` is synchronous in Next.js 14
- Try/catch handles read-only contexts (e.g., in middleware during response)

---

## Middleware Auth Refresh

The middleware automatically refreshes auth tokens before they expire:

```typescript
// middleware.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a response object early so we can modify headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create server client to refresh session
  const supabase = createServerClient();

  // This call will refresh the token if needed and update cookies
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static files and API
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg).*)',
  ],
};
```

**What it Does**:
1. For every request, calls `getUser()` which triggers token refresh if needed
2. Supabase automatically sets new cookies if token was refreshed
3. Prevents "stale session" errors

---

## Client-Side Auth Context

Use a context provider to manage auth state in the app:

```typescript
// lib/contexts/UserContext.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface UserContextType {
  user: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let hasReceivedAuthState = false;

    // Set up auth state listener FIRST
    const { subscription } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          hasReceivedAuthState = true;
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Check initial state in parallel
    const initAuth = async () => {
      if (!mounted) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user && !hasReceivedAuthState) {
        setUser(user);
      }

      // Wait for listener or timeout (15s for mobile latency)
      setTimeout(() => {
        if (!hasReceivedAuthState && mounted) {
          setLoading(false);
        }
      }, 500);
    };

    initAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
```

**Critical Details**:
- Set up listener **first**, then check initial state
- Use 15s timeout to account for mobile/network latency
- `mounted` flag prevents state updates after unmount
- `hasReceivedAuthState` prevents duplicate state sets

---

## Server-Side Auth Check

In server components or API routes, use the server client:

```typescript
// app/profile/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = createServerClient();

  // Check auth on server side
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile with RLS enforcing ownership
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <h1>Welcome, {profile?.display_name}</h1>
    </div>
  );
}
```

**Benefits**:
- No loading spinners (server renders auth check)
- RLS policies automatically respect user context
- No client-side auth race conditions

---

## Client-Side Auth Check

In client components, use the context:

```typescript
// components/ProfileCard.tsx
'use client';

import { useUser } from '@/lib/contexts/UserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ProfileCard() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // User is definitely not logged in
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect above
  }

  return <div>Profile for {user.email}</div>;
}
```

**Key Pattern**:
- Check `loading` first - prevents false redirects during auth check
- Only redirect when `loading` is false AND `user` is null
- Add small delay (300ms) before redirect to avoid flashing

---

## Authentication Examples

### Sign Up

```typescript
// app/(auth)/register/page.tsx
'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();

  const handleRegister = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Registration error:', error);
      return;
    }

    // Email sent, show confirmation screen
    router.push('/register/confirm-email');
  };

  return (
    // Form UI...
  );
}
```

### Sign In

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  console.error('Login error:', error);
  return;
}

// Session is set automatically, navigate to app
router.push('/app');
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut();

if (error) {
  console.error('Logout error:', error);
  return;
}

// Cookies are cleared, redirect to home
router.push('/');
```

### Auth Callback (OAuth)

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/app';

  if (code) {
    const supabase = createServerClient();

    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
```

---

## Protected Routes

### Pattern 1: Server-Side Redirect

```typescript
// app/profile/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Rest of component...
}
```

**Pros**: No loading state, clean URL
**Cons**: Slightly slower due to server auth check

### Pattern 2: Client-Side Redirect

```typescript
// components/ProtectedContent.tsx
'use client';

import { useUser } from '@/lib/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedContent() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content</div>;
}
```

**Pros**: Faster (no server round-trip), client-side control
**Cons**: Brief loading state visible

### Middleware Pattern (Recommended)

Add to `middleware.ts` to handle protected routes:

```typescript
export const config = {
  matcher: [
    '/profile/:path*',
    '/my-gallery/:path*',
    '/admin/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## Session Persistence

### How Sessions Persist

1. **Login** → Supabase sets `sb-*` cookies
2. **Refresh** → Middleware refreshes token if needed
3. **Navigate** → Cookies sent with every request
4. **Logout** → Cookies cleared automatically

### Troubleshooting Session Loss

**Problem**: User logs in, but redirects back to login on first navigation

**Solutions**:
1. Check middleware is running: Ensure cookie refresh in `middleware.ts`
2. Check Supabase settings: Verify Site URL in Supabase dashboard
3. Check auth timeout: Increase UserContext timeout if on slow network
4. Check cookie domain: Ensure cookies set for correct domain

**Debug Code**:
```typescript
// Check if cookies are being set
console.log('Cookies:', document.cookie);

// Check if auth state is valid
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

---

## Rate Limiting & Session Management

### Auth Rate Limits
- **Sign up**: 5 per hour per IP
- **Sign in**: 10 per hour per email
- **Password reset**: 5 per hour per email

### Session Timeout
- Default: 1 hour
- Refresh token: Valid for 7 days
- Auto-refresh: Middleware refreshes before expiry

### Multiple Tabs/Windows
- Sessions automatically sync via `onAuthStateChange`
- Logout in one tab automatically logs out all tabs
- Cookies shared across all tabs

---

## Best Practices

✅ **DO:**
- Use middleware for automatic token refresh
- Use UserContext for client-side auth state
- Use server clients in API routes and server components
- Check `loading` state before checking `user`
- Use RLS policies to enforce data access
- Handle auth errors gracefully

❌ **DON'T:**
- Store tokens in localStorage (use cookies instead)
- Create multiple browser client instances
- Skip middleware auth refresh
- Assume auth state without checking `loading`
- Expose private auth keys in client code
- Skip server-side auth checks on API routes

---

## Common Errors

### "Session not found"
- **Cause**: Middleware not running or token refresh failing
- **Fix**: Check middleware.ts exists and is configured correctly

### "AbortError: signal is aborted"
- **Cause**: Multiple Supabase clients during React Strict Mode
- **Fix**: Use `isSingleton: true` in browser client

### "User logs in but redirects back"
- **Cause**: Auth state not persisting across navigations
- **Fix**: Check middleware is refreshing tokens, increase UserContext timeout

### "CORS error on auth request"
- **Cause**: Supabase Site URL not matching request origin
- **Fix**: Add correct URL to Supabase dashboard auth settings

---

## Related Documentation

- **Constitution**: `.specify/memory/constitution.md` - Auth tier definitions
- **API Contracts**: `docs/architecture/api-contracts.md` - Auth endpoints
- **CLAUDE.md**: `CLAUDE.md` - Comprehensive dev guidelines
- **Supabase Docs**: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
