# Handoff Prompt: Implement Google OAuth Authentication

**Task ID**: HIGH-004-OAUTH-001
**Priority**: 🟠 High (After Password Reset Fix)
**Estimated Effort**: 4-6 hours
**Status**: Ready for Implementation
**Prerequisites**: Constitutional Amendment CA-2026-001 ratified (v3.2.0)

---

## Quick Summary

Implement Google OAuth authentication as an optional alternative to email/password login, following the constitutional amendment CA-2026-001. This addresses HIGH-004 (password reset issues) by providing users an alternative authentication method.

**Constitutional Requirements**:
- Email/password MUST remain primary and always available
- OAuth is optional convenience, not replacement
- Minimal scopes (email + profile only)
- Users can link/unlink anytime
- No tracking or analytics

---

## Context & Background

### What Happened Previously

**Session 2026-02-09**:
1. ✅ HIGH-003 verified as 95% implemented (tackle equipment works)
2. ⚠️ HIGH-004 reopened: Password reset broken (doesn't actually change password)
3. 📜 Constitutional Amendment CA-2026-001 drafted and ratified
4. ✅ Constitution amended to v3.2.0 (permits OAuth with strict governance)

**Current State**:
- Constitution permits Google, Apple, GitHub OAuth (Section V.2.3)
- Email/password authentication is primary (REQUIRED)
- OAuth is optional enhancement (convenience for users)
- Supabase Auth configured for backend (already in use for email/password)

### Why Google OAuth?

**User Problem**:
- Password reset is broken (HIGH-004)
- Users cannot recover locked accounts
- Password management friction (especially on mobile)

**Solution**:
- Google OAuth provides alternative login path
- 70%+ of grassroots coaches use Gmail
- Reduces reliance on password reset flows
- Leverages existing trusted relationship (coaches already trust Google)

**Constitutional Alignment**:
- ✅ Privacy-first: OAuth for auth only, no tracking
- ✅ User control: Link/unlink anytime, set password anytime
- ✅ Minimal data: Email + name only (no calendar, contacts, files)
- ✅ No telemetry: Google receives no usage data from us

---

## Prerequisites & Setup

### Before You Start

**Verify**:
1. ✅ Constitution is at v3.2.0 (check `.specify/memory/constitution.md`)
2. ✅ Supabase project is set up and configured
3. ✅ Current email/password authentication is working
4. ✅ You have access to Supabase Dashboard (admin credentials)
5. ✅ You have access to Google Cloud Console (or can create project)

**Required Accounts**:
- Supabase account with admin access to project
- Google Cloud Console account (free tier is sufficient)

**Environment Variables Needed** (add to `.env.local`):
```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OAuth redirect URLs (Supabase provides these)
# No additional env vars needed - Supabase handles OAuth config
```

---

## Implementation Plan

### Phase 1: Supabase Configuration (30 minutes)

#### Step 1.1: Enable Google Provider in Supabase

1. **Navigate to Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project: `coaching-animator`
   - Go to Authentication → Providers

2. **Enable Google Provider**
   - Find "Google" in the provider list
   - Toggle "Enable" to ON
   - Note the "Callback URL" (you'll need this for Google Cloud Console)
   - Example: `https://[your-project-ref].supabase.co/auth/v1/callback`

3. **Configure OAuth Scopes**
   - Ensure scopes are set to: `email`, `profile` (minimal, as required by constitution)
   - Do NOT enable additional scopes (calendar, contacts, drive, etc.)

#### Step 1.2: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Navigate to https://console.cloud.google.com
   - Create a new project or select existing: "coaching-animator"

2. **Enable Google+ API** (if not already enabled)
   - Go to APIs & Services → Library
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "coaching-animator-production"

4. **Configure Authorized Redirect URIs**
   - Add the Supabase callback URL from Step 1.1
   - Example: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - For local development, also add: `http://localhost:54321/auth/v1/callback`

5. **Save Credentials**
   - Copy the "Client ID"
   - Copy the "Client Secret"
   - Store these securely (you'll add them to Supabase)

#### Step 1.3: Add Google Credentials to Supabase

1. **Return to Supabase Dashboard**
   - Go to Authentication → Providers → Google
   - Paste "Client ID" from Google Cloud Console
   - Paste "Client Secret" from Google Cloud Console
   - Click "Save"

2. **Verify Configuration**
   - Supabase will validate the credentials
   - Ensure "Enabled" toggle is ON
   - Note any errors and resolve them

---

### Phase 2: Frontend Implementation (2-3 hours)

#### Step 2.1: Update Login Page UI

**File**: `app/(auth)/login/page.tsx`

**Current Structure** (approximately):
```tsx
// Email/password form
<input type="email" ... />
<input type="password" ... />
<button>Sign In</button>
<Link href="/forgot-password">Forgot password?</Link>
```

**Add OAuth Section BELOW Email/Password Form**:

```tsx
{/* OAuth Providers - Below email/password form per constitution */}
<div className="mt-6 pt-6 border-t border-border">
  <p className="text-sm text-center text-text-secondary mb-4">
    Or continue with
  </p>

  <button
    onClick={handleGoogleLogin}
    disabled={isLoading}
    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border rounded bg-white hover:bg-surface-darker transition-colors"
    aria-label="Sign in with Google"
  >
    {/* Google Logo SVG */}
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>

    <span className="text-sm font-medium">Sign in with Google</span>
  </button>

  {/* Constitutional disclosure per Section V.2.3 */}
  <p className="mt-3 text-xs text-center text-text-secondary">
    We only access your email and name. No usage tracking.{' '}
    <Link href="/privacy" className="underline hover:text-text-primary">
      Privacy Policy
    </Link>
  </p>
</div>
```

**Handler Function** (add to same file):

```tsx
const handleGoogleLogin = async () => {
  try {
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline', // Request refresh token
          prompt: 'consent', // Force consent screen on first login
        },
        scopes: 'email profile', // Minimal scopes per constitution
      },
    });

    if (error) {
      console.error('[Google OAuth] Error:', error);
      setError('Failed to sign in with Google. Please try again.');
    }
    // User will be redirected to Google, then back to /auth/callback
  } catch (err) {
    console.error('[Google OAuth] Unexpected error:', err);
    setError('An unexpected error occurred. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

**Key Points**:
- OAuth button is BELOW email/password (email/password is primary per constitution)
- Clear disclosure about data access (email + name only)
- Link to privacy policy (transparency requirement)
- Error handling with user-friendly messages

#### Step 2.2: Update Register Page (Same Pattern)

**File**: `app/(auth)/register/page.tsx`

Apply the same OAuth section as login page. Users should be able to sign up via Google as well.

**Important**: First-time OAuth users MUST see consent screen (handled by Supabase + Google).

#### Step 2.3: Create OAuth Callback Handler

**File**: `app/auth/callback/route.ts` (if not exists, create it)

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // If user denied OAuth consent
  if (error) {
    console.error('[OAuth Callback] Error:', error, error_description);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=oauth_denied&message=${encodeURIComponent(
        error_description || 'OAuth authentication was cancelled'
      )}`
    );
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
      // Exchange code for session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('[OAuth Callback] Session exchange error:', exchangeError);
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=oauth_failed&message=${encodeURIComponent(
            'Failed to complete sign in. Please try again.'
          )}`
        );
      }

      // Check if this is a new user (first-time OAuth login)
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.created_at === user?.last_sign_in_at) {
        // New user - redirect to welcome/onboarding
        return NextResponse.redirect(`${requestUrl.origin}/app?welcome=true`);
      }

      // Existing user - redirect to app
      return NextResponse.redirect(`${requestUrl.origin}/app`);

    } catch (err) {
      console.error('[OAuth Callback] Unexpected error:', err);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=oauth_error&message=${encodeURIComponent(
          'An unexpected error occurred. Please try again.'
        )}`
      );
    }
  }

  // No code, no error - invalid callback
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=invalid_callback&message=${encodeURIComponent(
      'Invalid OAuth callback. Please try again.'
    )}`
  );
}
```

**Key Points**:
- Handles OAuth redirect from Google
- Exchanges authorization code for session
- Handles errors gracefully
- Distinguishes new vs existing users
- Redirects appropriately

#### Step 2.4: Add "Connected Accounts" to Profile Settings

**File**: `app/profile/page.tsx`

**Add New Section** (after existing profile form):

```tsx
{/* Connected Accounts Section */}
<div className="mt-8 border-t border-border pt-8">
  <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>

  {user?.app_metadata?.provider === 'google' ? (
    <div className="flex items-center justify-between p-4 border border-border rounded">
      <div className="flex items-center gap-3">
        {/* Google Logo */}
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          {/* Same Google logo SVG as login page */}
        </svg>
        <div>
          <p className="font-medium">Google Account</p>
          <p className="text-sm text-text-secondary">{user?.email}</p>
        </div>
      </div>

      <button
        onClick={handleUnlinkGoogle}
        className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-darker"
      >
        Unlink
      </button>
    </div>
  ) : (
    <div className="p-4 border border-border rounded">
      <p className="text-sm text-text-secondary mb-3">
        No OAuth accounts connected. You can link your Google account for easier sign-in.
      </p>
      <button
        onClick={handleLinkGoogle}
        className="px-4 py-2 text-sm border border-border rounded hover:bg-surface-darker"
      >
        Link Google Account
      </button>
    </div>
  )}

  {/* Set Password for OAuth Users */}
  {user?.app_metadata?.provider === 'google' && !hasPassword && (
    <div className="mt-4 p-4 bg-surface-darker border border-border rounded">
      <p className="text-sm mb-3">
        <strong>Account Portability:</strong> Set a password to enable email/password login as a backup.
      </p>
      <button
        onClick={() => setShowPasswordForm(true)}
        className="px-4 py-2 text-sm bg-pitch-green text-white rounded hover:opacity-90"
      >
        Set Password
      </button>
    </div>
  )}
</div>
```

**Handler Functions**:

```typescript
const handleLinkGoogle = async () => {
  // Link OAuth account to existing email/password account
  const { error } = await supabase.auth.linkIdentity({
    provider: 'google',
  });

  if (error) {
    console.error('[Link Google] Error:', error);
    alert('Failed to link Google account. Please try again.');
  }
};

const handleUnlinkGoogle = async () => {
  if (!confirm('Unlink your Google account? You can still sign in with email/password.')) {
    return;
  }

  // Note: Supabase doesn't have unlinkIdentity yet - need to implement custom logic
  // For now, show message to user
  alert('To unlink your Google account, please contact support or set a password first.');

  // TODO: Implement unlink logic when Supabase adds support
};
```

**Key Points**:
- Shows connected OAuth providers
- Allows linking Google to existing email account
- Encourages setting password (account portability per constitution)
- Clear messaging about what linking/unlinking does

---

### Phase 3: Privacy & Consent (30 minutes)

#### Step 3.1: Create OAuth Consent Screen (Optional First-Time Flow)

**File**: `app/(auth)/oauth-consent/page.tsx` (NEW)

**Purpose**: Show consent screen BEFORE redirecting to Google (constitutional requirement)

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OAuthConsentPage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider') || 'Google';
  const returnUrl = searchParams.get('return') || '/login';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full border border-border rounded p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4">Sign in with {provider}</h1>

        <p className="text-sm text-text-secondary mb-4">
          By continuing, coaching-animator.com will receive:
        </p>

        <ul className="space-y-2 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-pitch-green">✓</span>
            <span className="text-sm">Your email address</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pitch-green">✓</span>
            <span className="text-sm">Your name and profile picture</span>
          </li>
        </ul>

        <div className="bg-surface-darker border border-border rounded p-4 mb-6">
          <p className="text-sm font-medium mb-2">We respect your privacy:</p>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>• We do NOT access your calendar, contacts, or files</li>
            <li>• We do NOT store your {provider} password or tokens</li>
            <li>• We do NOT share your activity with {provider}</li>
            <li>• You can unlink your {provider} account anytime</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href={returnUrl}
            className="flex-1 px-4 py-2 border border-border rounded text-center hover:bg-surface-darker"
          >
            Cancel
          </Link>
          <button
            onClick={() => window.location.href = `/api/auth/oauth?provider=${provider.toLowerCase()}`}
            className="flex-1 px-4 py-2 bg-pitch-green text-white rounded hover:opacity-90"
          >
            Continue
          </button>
        </div>

        <p className="mt-4 text-xs text-center text-text-secondary">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
```

**Update Login Page** to redirect to consent first (optional, can skip if Google's consent is enough):

```tsx
const handleGoogleLogin = async () => {
  // Option 1: Show our consent screen first
  router.push('/oauth-consent?provider=Google&return=/login');

  // Option 2: Go directly to Google (Google shows their own consent screen)
  // Use the handler from Step 2.1
};
```

**Constitutional Compliance**: This satisfies Section V.2.3 requirement for "consent screen explaining what data is accessed".

#### Step 3.2: Update Privacy Policy

**File**: `app/(legal)/privacy/page.tsx`

**Add Section** about OAuth authentication:

```markdown
## OAuth Authentication

We offer optional sign-in with Google, Apple, or GitHub as alternatives to email/password authentication.

### What Data We Receive

When you sign in with an OAuth provider, we receive only:
- Your email address
- Your display name
- Your profile picture URL (optional)

We do NOT receive:
- Your OAuth provider password
- OAuth tokens or refresh tokens (managed by Supabase)
- Access to your calendar, contacts, files, or other data
- Any usage analytics or tracking data

### What We Share

We do NOT share your usage data, animations, or activity with OAuth providers. Google/Apple/GitHub only know that you signed up for our service - they receive no information about your coaching content or usage patterns.

### Your Control

You can:
- Link or unlink OAuth accounts anytime from your Profile settings
- Set a password after OAuth signup (for email/password login as backup)
- Export all your data anytime
- Delete your account and all data within 30 days

### Security

OAuth authentication is handled by Supabase Auth using industry-standard security protocols (PKCE, state validation). We never see or store your OAuth provider passwords or tokens.
```

---

### Phase 4: Testing (1-2 hours)

#### Test Case 1: New User OAuth Signup

**Steps**:
1. Navigate to `/register`
2. Click "Sign in with Google"
3. Complete Google consent screen
4. Verify redirected to `/auth/callback`
5. Verify session created (user logged in)
6. Verify redirected to `/app` or welcome page
7. Check Supabase Dashboard → Authentication → Users
   - New user row exists
   - Provider = "google"
   - Email matches Google email
   - No password hash (OAuth user)

**Expected**:
- ✅ OAuth flow completes successfully
- ✅ User account created in database
- ✅ User logged in with active session
- ✅ Profile shows Google as connected account

#### Test Case 2: Existing User OAuth Login

**Steps**:
1. Create account via email/password first
2. Log out
3. Navigate to `/login`
4. Click "Sign in with Google" using SAME email
5. Complete Google consent
6. Verify logged in

**Expected**:
- ✅ Existing account linked to Google
- ✅ User can now log in with EITHER email/password OR Google
- ✅ Profile shows Google as connected account

#### Test Case 3: Link Google to Existing Account

**Steps**:
1. Log in with email/password
2. Navigate to `/profile`
3. Click "Link Google Account"
4. Complete Google consent
5. Verify Google account linked

**Expected**:
- ✅ OAuth account linked to existing user
- ✅ Profile shows "Google Account Connected"
- ✅ User can now use either authentication method

#### Test Case 4: Set Password After OAuth Signup

**Steps**:
1. Sign up via Google OAuth (no password)
2. Navigate to `/profile`
3. Click "Set Password"
4. Enter new password, confirm
5. Save password
6. Log out
7. Log in with email + new password

**Expected**:
- ✅ Password set successfully for OAuth user
- ✅ User can now log in with email/password OR Google
- ✅ Account portability achieved (constitutional requirement)

#### Test Case 5: OAuth Denied / Error Handling

**Steps**:
1. Click "Sign in with Google"
2. On Google consent screen, click "Cancel" or "Deny"
3. Verify redirected back to login page
4. Verify error message shown

**Expected**:
- ✅ User returned to login page (not stuck)
- ✅ Friendly error message: "OAuth authentication was cancelled"
- ✅ Email/password login still available (no lock-out)

#### Test Case 6: Offline Mode (OAuth Provider Down)

**Steps**:
1. Simulate Google being down (disable internet or block google.com in hosts file)
2. Try to sign in with Google
3. Verify error handling
4. Verify email/password still works

**Expected**:
- ✅ OAuth fails gracefully with error message
- ✅ Email/password authentication unaffected (constitutional requirement)
- ✅ User can still access account via email/password

#### Test Case 7: Security - PKCE and State Validation

**Steps**:
1. Open browser DevTools → Network tab
2. Click "Sign in with Google"
3. Inspect redirect URL to Google
4. Verify `code_challenge` parameter present (PKCE)
5. Verify `state` parameter present
6. Complete OAuth flow
7. Verify state validated on callback

**Expected**:
- ✅ PKCE enabled (code_challenge in URL)
- ✅ State parameter present and validated
- ✅ Redirect URI matches Supabase callback URL
- ✅ No security warnings in console

---

### Phase 5: Documentation (30 minutes)

#### Step 5.1: Update Getting Started Guide

**File**: `docs/development/getting-started.md`

**Add Section**:

```markdown
## Authentication Options

Coaching Animator supports multiple authentication methods:

1. **Email/Password** (Primary)
   - Create account with email and password
   - Always available (required by constitution)

2. **Google OAuth** (Optional)
   - Sign in with your Google account
   - Convenient for coaches who use Gmail
   - Can link to existing email account

3. **Apple Sign In** (Coming Soon)
   - Privacy-focused authentication
   - For iOS users

### Setting Up OAuth (Developers)

See `specs/005-incremental-improvements/GOOGLE_OAUTH_IMPLEMENTATION_HANDOFF.md` for implementation details.

OAuth configuration is managed in Supabase Dashboard → Authentication → Providers.
```

#### Step 5.2: Update README.md

**File**: `README.md`

**Add to Features Section**:

```markdown
- 🔐 **Flexible Authentication**
  - Email/password (always available)
  - Google OAuth (optional convenience)
  - Account linking and portability
```

#### Step 5.3: Update PROGRESS.md

**File**: `specs/005-incremental-improvements/PROGRESS.md`

**Add Session Entry**:

```markdown
### Session 2026-02-XX (Google OAuth Implementation)

**Date**: 2026-02-XX
**Issue**: HIGH-004 Enhancement (OAuth Alternative)
**Status**: ✅ Complete

**Work Done**:

- **Google OAuth Implementation** ✅
  - Configured Google Cloud Console OAuth credentials
  - Enabled Google provider in Supabase Auth
  - Updated login/register pages with "Sign in with Google" button
  - Created OAuth callback handler (app/auth/callback/route.ts)
  - Added "Connected Accounts" section to profile settings
  - Implemented account linking (OAuth → email/password)
  - Added privacy disclosures and consent screens
  - Updated Privacy Policy with OAuth section

- **Constitutional Compliance** ✅
  - Email/password remains primary (shown above OAuth button)
  - Minimal scopes: email + profile only (no calendar/contacts/files)
  - User control: Link/unlink anytime, set password anytime
  - No tracking: OAuth used only for authentication
  - Privacy disclosures: Clear messaging about data access

- **Testing** ✅
  - New user OAuth signup: Works correctly
  - Existing user OAuth login: Works correctly
  - Account linking: OAuth → email/password: Works correctly
  - Password setting for OAuth users: Works correctly
  - Error handling: OAuth denied/failed: Graceful fallback
  - Security: PKCE and state validation: Verified

**Files Modified**:
- `app/(auth)/login/page.tsx` - Added Google OAuth button
- `app/(auth)/register/page.tsx` - Added Google OAuth button
- `app/auth/callback/route.ts` - OAuth callback handler (NEW)
- `app/profile/page.tsx` - Added Connected Accounts section
- `app/(legal)/privacy/page.tsx` - Added OAuth privacy section

**Impact**:
- ✅ Provides alternative to broken password reset (HIGH-004)
- ✅ Reduces password management friction
- ✅ Leverages Gmail trust (70%+ coaches use Gmail)
- ✅ Maintains constitutional integrity (privacy-first, user control)
- ✅ No tracking or analytics (OAuth for auth only)

**Next Steps**:
- Monitor OAuth adoption rate (% using Google vs email/password)
- Measure impact on password reset support requests
- Consider Apple Sign In if users request it
- Fix underlying password reset bug (HIGH-004 root cause)
```

---

## Constitutional Compliance Checklist

Before marking task complete, verify:

- [ ] **Email/Password Remains Primary**
  - [ ] Login page shows email/password form ABOVE OAuth button
  - [ ] Users can create accounts with email/password only
  - [ ] OAuth is clearly optional (not required)

- [ ] **User Control**
  - [ ] Users can link OAuth to existing email accounts
  - [ ] Users can set password after OAuth signup
  - [ ] Profile settings show connected accounts
  - [ ] (Future) Users can unlink OAuth accounts

- [ ] **Privacy Safeguards**
  - [ ] Minimal scopes: email + profile only (no calendar/contacts/files)
  - [ ] Clear disclosure about what data is accessed
  - [ ] Privacy Policy updated with OAuth section
  - [ ] No tracking or analytics via OAuth

- [ ] **Security Requirements**
  - [ ] PKCE enabled (verify in DevTools)
  - [ ] State parameter validated
  - [ ] Redirect URI domain-locked (Supabase config)
  - [ ] Supabase handles OAuth tokens (never in our code)

- [ ] **Graceful Degradation**
  - [ ] OAuth errors show friendly messages
  - [ ] Email/password works even if OAuth provider down
  - [ ] No user lock-out if OAuth fails

- [ ] **Documentation**
  - [ ] Privacy Policy updated
  - [ ] Getting Started guide updated
  - [ ] PROGRESS.md updated with session entry
  - [ ] Code comments explain OAuth flow

---

## Troubleshooting

### Issue: "Invalid OAuth callback" error

**Cause**: Redirect URI mismatch between Google Cloud Console and Supabase

**Fix**:
1. Check Supabase Dashboard → Authentication → Providers → Google
2. Copy the exact "Callback URL"
3. Go to Google Cloud Console → Credentials → OAuth 2.0 Client
4. Ensure "Authorized redirect URIs" EXACTLY matches Supabase callback URL
5. Save and wait 5 minutes for Google to propagate changes

### Issue: OAuth works in development but not production

**Cause**: Production domain not added to authorized redirect URIs

**Fix**:
1. Go to Google Cloud Console → Credentials
2. Add production redirect URI: `https://coaching-animator.com/auth/callback`
3. Ensure production Supabase callback URL is added
4. Wait 5 minutes for changes to propagate

### Issue: User sees "access_denied" error

**Cause**: User denied OAuth consent OR app not verified

**Fix**:
- If user denied: This is expected, show friendly message ("You cancelled sign-in")
- If app not verified: Complete Google OAuth verification process (requires domain verification)

### Issue: OAuth user has no password, can't reset password

**Cause**: OAuth users don't have passwords initially

**Fix**:
- This is expected behavior (constitutional requirement)
- Prompt user to "Set Password" in profile settings
- This enables account portability (can use email/password OR OAuth)

---

## Success Criteria

**Must Have** (Required for completion):
- ✅ Google OAuth button appears on login/register pages (below email/password)
- ✅ OAuth flow completes successfully (new user signup)
- ✅ OAuth flow completes successfully (existing user login)
- ✅ Users can set password after OAuth signup (account portability)
- ✅ Profile shows connected OAuth accounts
- ✅ Privacy Policy updated with OAuth section
- ✅ Constitutional compliance verified (email/password primary, minimal scopes, user control)
- ✅ Error handling works (OAuth denied, provider down)
- ✅ PKCE and state validation enabled (security)

**Nice to Have** (Optional enhancements):
- ⭐ First-time consent screen (our own, before Google's)
- ⭐ Account unlinking (if Supabase adds support)
- ⭐ OAuth provider icons in profile settings
- ⭐ Welcome email for OAuth signups

---

## Files to Modify

**Required**:
1. `app/(auth)/login/page.tsx` - Add OAuth button and handler (~40 lines)
2. `app/(auth)/register/page.tsx` - Add OAuth button and handler (~40 lines)
3. `app/auth/callback/route.ts` - OAuth callback handler (NEW, ~60 lines)
4. `app/profile/page.tsx` - Add Connected Accounts section (~80 lines)
5. `app/(legal)/privacy/page.tsx` - Add OAuth privacy section (~30 lines)

**Optional**:
6. `app/(auth)/oauth-consent/page.tsx` - Custom consent screen (NEW, ~60 lines)
7. `docs/development/getting-started.md` - Update authentication docs (~20 lines)
8. `README.md` - Add OAuth to features list (~5 lines)

**Total Estimated Changes**: ~300-350 lines across 5-8 files

---

## Next Steps After Completion

1. **Monitor Adoption**
   - Check Supabase Dashboard → Analytics → Sign-ups by provider
   - Track % of users using Google vs email/password
   - Measure impact on support requests (password reset)

2. **Gather Feedback**
   - Ask users about OAuth experience
   - Identify pain points or confusion
   - Iterate on consent messaging if needed

3. **Consider Additional Providers**
   - **Apple Sign In** if iOS users request it (6-8 hours)
   - **GitHub OAuth** if developer-coaches request it (3-4 hours)
   - Always maintain email/password as primary

4. **Fix Root Cause (HIGH-004)**
   - Implement Google OAuth as alternative (this task)
   - STILL NEED TO: Fix password reset mechanism
   - Debug why password change doesn't actually work
   - Test end-to-end password reset flow

---

## References

- **Constitutional Amendment**: `specs/005-incremental-improvements/CONSTITUTIONAL_AMENDMENT_OAUTH.md`
- **Constitution**: `.specify/memory/constitution.md` (v3.2.0, Section V.2.3)
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-google
- **Google OAuth Setup**: https://console.cloud.google.com/apis/credentials
- **PKCE Specification**: https://datatracker.ietf.org/doc/html/rfc7636

---

**Handoff Generated By**: Claude Sonnet 4.5
**Date**: 2026-02-09
**Estimated Implementation Time**: 4-6 hours
**Prerequisites**: Constitution v3.2.0 ratified, Supabase configured
**Next Task After This**: Fix HIGH-004 password reset root cause
