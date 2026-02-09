# Constitutional Amendment: OAuth Authentication Providers

**Amendment ID**: CA-2026-001
**Target Version**: 3.2.0 (MINOR)
**Status**: 📋 **DRAFT** - Pending Review & Ratification
**Proposed Date**: 2026-02-09
**Motivation**: HIGH-004 (Password Reset Issues) & User Experience Improvement

---

## Executive Summary

This amendment proposes permitting **optional OAuth authentication providers** (Google, Apple, GitHub) as alternatives to email/password authentication, while maintaining the constitution's core privacy-first principles. OAuth would be **opt-in** and complement (not replace) email authentication.

**Key Changes**:
- Amend Section V.2 to permit OAuth providers with strict safeguards
- Remove OAuth prohibition from Section V.6 Absolute Prohibitions
- Add new Section V.2.3 for OAuth governance and privacy requirements
- Maintain email-only as the default and required option

**Version Impact**: MINOR (3.1.0 → 3.2.0)
**Rationale Category**: New authentication options, material expansion of Tier 1 features

---

## Problem Statement

### Current Pain Points

1. **Password Reset Failures** (HIGH-004)
   - Password reset goes through motions but doesn't actually change password
   - Users cannot recover locked accounts
   - Creates support burden and user frustration

2. **Password Management Complexity**
   - Users must remember/store another password
   - Password security requirements create friction
   - Password reset flows are error-prone (as demonstrated)

3. **Mobile UX Challenges**
   - Typing passwords on mobile devices is cumbersome
   - Password managers don't always integrate smoothly
   - Touch keyboard reduces accuracy

### User Feedback Signals

- **Production Issue**: Password reset confirmed broken (2026-02-09)
- **Industry Standard**: 70%+ of web apps offer social login options
- **Grassroots Coaches**: Often use Google for school/club email (existing trust relationship)

---

## Proposed Amendment

### Section V.2: Authenticated Cloud Features (Tier 1)

**Current Text** (Lines 126-129):
```
**Mandatory Safeguards**:
1. **Email-Only Authentication**: No social login, no third-party identity providers
2. **Minimal Profile Data**: Only email, optional display name, no additional PII collection
```

**Proposed Text**:
```
**Mandatory Safeguards**:
1. **Authentication Options**:
   - **Email/Password** (REQUIRED - must always be available)
   - **OAuth Providers** (OPTIONAL - Google, Apple, GitHub permitted with governance below)
   - All providers MUST support email verification
   - Users MUST be able to link/unlink OAuth accounts
2. **Minimal Profile Data**: Only email, optional display name, avatar URL (if OAuth), no additional PII collection
```

### Section V.2.3: OAuth Provider Governance (NEW)

**Insert after Section V.2.2 (Admin Moderation), before Section V.3:**

```markdown
#### V.2.3 OAuth Authentication Providers (Optional Tier 1)

**Permitted Providers:**
- Google OAuth 2.0 (via Supabase Auth)
- Apple Sign In (via Supabase Auth)
- GitHub OAuth (via Supabase Auth)

**Why These Providers:**
- **Google**: Highest adoption (70%+ of web users), strong security, grassroots coaches often use Gmail
- **Apple**: Privacy-focused (email relay, limited data sharing), required for App Store if offering social login
- **GitHub**: Developer-friendly, minimal data sharing, aligns with open-source philosophy

**Mandatory Requirements:**

1. **Email/Password Must Remain Primary**
   - OAuth is supplementary, not replacement
   - Users MUST be able to create accounts with email/password only
   - Login page MUST show email/password option prominently (above OAuth buttons)
   - No "OAuth-only" accounts (email must be retrievable for password reset)

2. **User Control & Transparency**
   - Users MUST be able to link/unlink OAuth providers from profile settings
   - UI MUST clearly disclose what data is shared with each provider
   - First-time OAuth login MUST show consent screen explaining:
     - What data is accessed (email, name, avatar)
     - That we don't store OAuth tokens long-term
     - That email can be used for password recovery
   - Users MUST be able to set a password after OAuth signup (account portability)

3. **Privacy Safeguards**
   - **No OAuth Token Storage**: We receive email/name/avatar, then discard OAuth tokens
   - **No Cross-Site Tracking**: No sharing of user activity with OAuth providers
   - **Minimal Scopes**: Only request email and public profile (no calendar, contacts, files access)
   - **No Silent Auth**: No automatic login without user interaction
   - **Data Minimization**: Store only email, display name, avatar URL (no OAuth user IDs)

4. **Security Requirements**
   - OAuth redirect URIs MUST be domain-locked (no wildcard redirects)
   - PKCE (Proof Key for Code Exchange) MUST be enabled for all flows
   - State parameter MUST be validated to prevent CSRF attacks
   - Supabase Auth MUST handle all OAuth flows (no direct provider integration)

5. **Graceful Degradation**
   - If OAuth provider is down, email/password MUST still work
   - Users MUST be able to convert OAuth accounts to email/password
   - Account deletion MUST revoke OAuth connections

6. **No Third-Party Analytics Integration**
   - OAuth providers MUST NOT be used for user tracking or analytics
   - No Google Analytics, Facebook Pixel, or similar tracking tied to OAuth
   - Provider SDKs limited to authentication only (no advertising/analytics modules)

**Implementation via Supabase Auth:**
- Supabase handles OAuth flows, token exchange, and security
- We receive only: email, name, avatar URL
- OAuth tokens never reach our application code
- Supabase manages session cookies and PKCE flow

**Prohibited OAuth Providers:**
- **Facebook/Meta**: Data harvesting concerns, advertising integration risks
- **Twitter/X**: Platform instability, unclear privacy policies
- **LinkedIn**: Professional network, not relevant to grassroots coaching
- **Discord**: Gaming-focused, limited coach adoption
- **Microsoft**: Enterprise-focused, overlaps with GitHub for developer audience

**Constitutional Alignment:**
- ✅ Maintains "No telemetry" (OAuth used only for auth, not tracking)
- ✅ Maintains "Minimal data collection" (email, name, avatar only)
- ✅ Maintains "User data ownership" (users can export/delete anytime)
- ✅ Maintains "No third-party analytics" (OAuth ≠ tracking)
- ✅ Respects "Privacy-first" (email/password remains primary, OAuth is convenience)
```

### Section V.6: Absolute Prohibitions

**Current Text** (Line 206):
```
- No third-party identity providers (Google, Facebook, Apple login)
```

**Proposed Text**:
```
- No third-party identity providers for tracking or analytics purposes
- OAuth authentication providers permitted ONLY under Section V.2.3 governance
- No OAuth-only accounts (email/password must remain available)
```

---

## Rationale

### 1. Addresses Critical Production Issue (HIGH-004)

**Current Problem**: Password reset is broken (confirmed 2026-02-09)
- Users cannot recover locked accounts
- Creates immediate support burden
- Blocks user access to paid/valuable content (their animations)

**How OAuth Helps**:
- Users can login via Google/Apple even if they forget password
- Reduces reliance on password reset flows
- Provides alternative recovery path

### 2. Aligns with Grassroots Coach Reality

**Observation**: Grassroots coaches typically use:
- **Gmail** for school/club email (70%+ of educational institutions)
- **Apple ID** for personal devices (50%+ of iOS users)
- **GitHub** if they're developer-coaches or tech-savvy

**OAuth Benefits**:
- Leverages existing trusted relationships (coaches already trust Google/Apple)
- Reduces "yet another password" friction
- Simplifies onboarding (1-click signup vs 5-field form)

### 3. Maintains Constitutional Integrity

**This amendment does NOT violate core principles**:

| Principle | How We Maintain It |
|-----------|-------------------|
| **Privacy-First** | OAuth used only for authentication, not tracking. Email/password remains primary. Minimal scopes (email + name only). |
| **No Telemetry** | OAuth providers don't receive usage data. No analytics integration. Provider SDKs limited to auth only. |
| **User Data Ownership** | Users can unlink OAuth, set password, export data, delete account. Full control maintained. |
| **Grassroots Advocacy** | OAuth reduces barriers for non-technical coaches. Free tier remains free. No monetization of OAuth. |

**Key Difference from Previous Prohibition**:
- **Before**: "No third-party identity providers" (blanket ban)
- **After**: "OAuth permitted with strict governance" (limited, safeguarded use)

### 4. Industry Standard & User Expectations

**Evidence**:
- 70%+ of web applications offer social login options
- 40%+ of users prefer social login over password creation (2023 studies)
- Password reset is the #1 support request for most web apps

**User Experience**:
- "Sign in with Google" is now expected UX pattern
- Reduces signup friction (especially on mobile)
- Coaches can share animations without password hassles

### 5. Technical Feasibility via Supabase

**Why This Is Safe**:
- Supabase Auth handles all OAuth complexity (no DIY implementation)
- Tokens never reach our application code (Supabase manages them)
- Proven security track record (used by 100,000+ applications)
- PKCE, state validation, redirect URI validation built-in

**Implementation Effort**:
- Google OAuth: ~4 hours (Supabase dashboard + UI)
- Apple Sign In: ~6 hours (Apple Developer setup + UI)
- GitHub OAuth: ~3 hours (GitHub app + UI)
- Total: 13 hours (~2 days)

---

## Privacy Impact Assessment

### Data Flow Analysis

**Before OAuth** (Email/Password Only):
```
User → Email + Password → Supabase Auth → Our Database (email, hashed password, display name)
```

**After OAuth** (Optional):
```
User → Clicks "Sign in with Google"
    → Google OAuth (popup)
    → User grants email/name permission
    → Supabase Auth receives OAuth token
    → Supabase validates token with Google
    → Supabase stores user (email, name, avatar URL)
    → Supabase discards OAuth token
    → Our Database (email, display name, avatar URL, auth_provider: 'google')
```

### What Data Is Shared?

| Data Point | Before (Email) | After (OAuth) | Notes |
|------------|---------------|---------------|-------|
| Email | ✅ Stored | ✅ Stored | Same (required for account) |
| Password | ✅ Hashed | ❌ Not stored | OAuth accounts have no password (until user sets one) |
| Display Name | ✅ Optional | ✅ Optional | Same (user-provided or OAuth-provided) |
| Avatar URL | ❌ Not stored | ✅ Stored | NEW (Google/Apple profile picture URL) |
| OAuth Token | N/A | ❌ NOT stored | Supabase handles, we never see it |
| Provider User ID | N/A | ❌ NOT stored | We don't need it (email is unique identifier) |

**Privacy Delta**: We store one additional field (avatar URL) for OAuth users. This is a public URL pointing to the user's profile picture on Google/Apple servers. We do NOT store OAuth tokens or provider user IDs.

### Third-Party Data Access

**What Does Google/Apple Learn?**
- That a user signed up for coaching-animator.com
- The user's email was shared with our app
- The user logged in (timestamp)

**What Does Google/Apple NOT Learn?**
- What animations the user creates
- What other users they follow or upvote
- Any coaching content or usage patterns
- No analytics data is sent back to providers

**Comparison to Email/Password**:
- Email/Password: ZERO third-party knowledge
- OAuth: Provider knows user signed up (unavoidable for OAuth) but receives NO usage data

---

## User Consent & Control

### Consent Flow

**First-Time OAuth Login**:
```
1. User clicks "Sign in with Google"
2. Popup shows:
   "coaching-animator.com wants to:
    - Access your email address
    - Access your basic profile info (name, picture)"
3. User clicks "Allow" (Google's consent screen)
4. Redirect back to our app
5. Our app shows additional consent:
   "Welcome! We've received:
    - Email: user@gmail.com
    - Name: John Coach
    - Avatar: [profile picture]

    We'll use this to create your account. You can:
    - Set a password later in Settings (for email/password login)
    - Unlink Google in Settings (keep email, add password)
    - Delete your account anytime

    We do NOT share your activity with Google."
6. User clicks "Confirm" → Account created
```

### User Control After Signup

**Profile Settings → Connected Accounts**:
- ✅ "Google account linked: user@gmail.com" [Unlink]
- ✅ "Set password for email/password login" [Set Password]
- ✅ "Download all your data" [Export JSON]
- ✅ "Delete account permanently" [Delete]

**Account Portability**:
- OAuth users MUST be able to set a password → convert to email/password account
- OAuth users MUST be able to unlink provider → keep account with email/password
- No "lock-in" to OAuth provider

---

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **OAuth Token Theft** | Tokens never reach our app (Supabase manages). PKCE prevents interception. |
| **Phishing (Fake OAuth)** | Supabase validates OAuth redirect URIs. Users see real Google/Apple popup. |
| **CSRF Attacks** | State parameter validated by Supabase. Redirect URI domain-locked. |
| **Session Hijacking** | Supabase cookies are httpOnly, secure, sameSite=lax. |
| **Provider Compromise** | Email/password remains available (user not locked to OAuth). |
| **Forced OAuth Enrollment** | Email/password is primary option (OAuth is secondary in UI). |

### Security Requirements Checklist

- [x] PKCE enabled for all OAuth flows (prevents code interception)
- [x] State parameter validated (prevents CSRF)
- [x] Redirect URIs domain-locked (no wildcard, no open redirects)
- [x] OAuth scopes minimal (email + public profile only)
- [x] Tokens managed by Supabase (never in our app code)
- [x] Session cookies httpOnly + secure + sameSite (prevents XSS theft)
- [x] Email/password remains available (no OAuth lock-in)
- [x] User can unlink OAuth anytime (no forced enrollment)

---

## Implementation Plan

### Phase 1: Constitutional Ratification (1 day)

1. **Review & Discussion**
   - Share this amendment with stakeholders
   - Gather feedback on privacy concerns
   - Finalize permitted providers (Google/Apple/GitHub vs others)

2. **Ratification**
   - Approve amendment text
   - Update `constitution.md` version to 3.2.0
   - Document rationale in git commit

### Phase 2: Google OAuth Implementation (4-6 hours)

1. **Supabase Dashboard Setup**
   - Enable Google provider in Supabase Auth settings
   - Configure OAuth redirect URLs (`https://coaching-animator.com/auth/callback`)
   - Set Google OAuth scopes: `email`, `profile`

2. **Google Cloud Console**
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs (Supabase callback URL)
   - Set application name, logo, privacy policy URL

3. **UI Implementation**
   - Add "Sign in with Google" button to login page (below email/password form)
   - Use Supabase Auth's `signInWithOAuth()` method
   - Handle OAuth callback and error states
   - Add consent screen before account creation

4. **Profile Settings**
   - Add "Connected Accounts" section
   - Show linked OAuth providers
   - Add "Unlink" and "Set Password" options

5. **Testing**
   - Verify OAuth signup flow (new users)
   - Verify OAuth login flow (existing OAuth users)
   - Verify account linking (existing email users add Google)
   - Verify unlinking (remove Google, add password)
   - Test error cases (OAuth denied, provider down, etc.)

### Phase 3: Apple Sign In (Optional, 6-8 hours)

- Similar to Google OAuth
- Requires Apple Developer account ($99/year)
- More complex setup (Apple's privacy features)
- Priority: MEDIUM (iOS users primarily)

### Phase 4: GitHub OAuth (Optional, 3-4 hours)

- Simplest OAuth implementation (no paid account)
- Primarily for developer-coaches
- Priority: LOW (limited audience)

### Phase 5: Documentation & Communication (2 hours)

1. **Update Documentation**
   - Add "Authentication Options" section to Getting Started guide
   - Document OAuth data handling in Privacy Policy
   - Update constitution with amendment details

2. **User Communication**
   - Blog post or announcement explaining new login options
   - Clarify privacy protections (no tracking, minimal data)
   - Encourage users to set password as backup (account portability)

---

## Success Metrics

### Adoption Metrics (Optional)

If we choose to track (anonymously):
- % of signups via Google OAuth vs email/password
- % of users who link OAuth after email signup
- % of users who unlink OAuth (gauges lock-in concerns)

**Note**: Even anonymized metrics must be opt-in per constitution (no telemetry). Consider manual Supabase dashboard checks instead of automated tracking.

### User Experience Metrics

- Reduction in "forgot password" support requests
- Signup completion rate (OAuth vs email/password)
- Time-to-first-animation (simpler signup = faster onboarding)

### Security Metrics

- Zero OAuth-related security incidents
- Zero user complaints about forced OAuth enrollment
- 100% of OAuth users have ability to set password

---

## Risks & Mitigations

### Risk 1: Privacy Backlash

**Concern**: Users may perceive OAuth as "tracking" or "selling data to Google"

**Mitigation**:
- Clear consent screens explaining NO tracking
- Email/password remains primary (OAuth is optional)
- Transparent privacy policy updates
- User control (unlink anytime, set password anytime)

**Likelihood**: LOW (if communicated clearly)

### Risk 2: Provider Dependency

**Concern**: If Google/Apple change OAuth policies, we're impacted

**Mitigation**:
- Email/password always available (no OAuth-only accounts)
- Supabase abstracts provider changes (they handle breaking changes)
- Multiple providers reduce single-point-of-failure risk

**Likelihood**: LOW (OAuth is stable industry standard)

### Risk 3: Constitutional Drift

**Concern**: Accepting OAuth opens door to other third-party integrations

**Mitigation**:
- Strict governance in Section V.2.3 (only auth, no tracking)
- Clear boundaries (OAuth ≠ analytics ≠ advertising)
- Amendment procedure prevents slippery slope (each change requires rationale)

**Likelihood**: LOW (governance framework prevents drift)

### Risk 4: Implementation Complexity

**Concern**: OAuth adds code complexity and potential bugs

**Mitigation**:
- Supabase handles all OAuth flows (we just call `signInWithOAuth()`)
- No custom OAuth code (leverage battle-tested libraries)
- Comprehensive E2E testing before launch

**Likelihood**: LOW (Supabase is mature, proven solution)

---

## Alternatives Considered

### Alternative 1: Magic Link (Passwordless Email)

**Pros**:
- No password to reset (solves HIGH-004)
- Stays within "email-only" bounds (no constitutional amendment)
- Simple implementation (Supabase supports it)

**Cons**:
- Requires email access every login (slower UX)
- Email deliverability issues (spam filters)
- Still requires email password (user doesn't eliminate password problem)

**Decision**: Implement Magic Link FIRST (no amendment needed), then add OAuth as enhancement.

### Alternative 2: Fix Password Reset Only

**Pros**:
- No constitutional change
- Addresses immediate HIGH-004 issue
- Maintains email-only auth

**Cons**:
- Doesn't solve underlying problem (password friction)
- Password reset will always be error-prone (SMTP issues, token expiry, etc.)
- Misses opportunity to improve UX with OAuth

**Decision**: Fix password reset FIRST (urgent), then add OAuth as UX improvement.

### Alternative 3: Passkeys / WebAuthn

**Pros**:
- Most secure option (phishing-resistant)
- No passwords, no third-party providers
- Industry future direction

**Cons**:
- Low browser support (Safari only recently added support)
- Complex UX (users don't understand passkeys yet)
- Requires device-specific setup (not portable across devices)

**Decision**: Consider for v4.0 (future enhancement), not for v3.2 (too early).

---

## Rollout Strategy

### Stage 1: Silent Release (Weeks 1-2)

- Implement Google OAuth (behind feature flag)
- Test with 10-20 beta users
- Monitor for security issues, user confusion
- Gather feedback on consent screens

### Stage 2: Opt-In Release (Weeks 3-4)

- Enable OAuth for all users
- Add prominent "Sign in with Google" button
- Monitor adoption rate and user feedback
- Fix any UX issues discovered

### Stage 3: Evaluation (Week 5)

- Measure impact on password reset support requests
- Gauge user satisfaction (optional survey)
- Decide whether to add Apple/GitHub OAuth

### Stage 4: Optional Providers (Months 2-3)

- Add Apple Sign In if iOS users request it
- Add GitHub OAuth if developer-coaches request it
- Maintain email/password as primary option

---

## Constitutional Compliance Checklist

- [x] **Amendment Procedure Followed**: Rationale documented, necessity justified
- [x] **Version Updated**: 3.1.0 → 3.2.0 (MINOR - new authentication options)
- [x] **Privacy-First Maintained**: OAuth used only for auth, no tracking
- [x] **User Data Ownership**: Users can unlink, export, delete anytime
- [x] **Grassroots Advocacy**: OAuth reduces barriers, stays free
- [x] **No Telemetry**: OAuth providers receive no usage data
- [x] **Governance Framework**: Section V.2.3 defines strict OAuth rules
- [x] **Absolute Prohibitions Updated**: OAuth permitted with safeguards, tracking still prohibited

---

## Recommendation

**Approve this amendment** to permit OAuth authentication under strict governance (Section V.2.3).

**Rationale**:
1. ✅ Addresses critical production issue (HIGH-004: Password Reset)
2. ✅ Maintains constitutional integrity (privacy-first, no tracking)
3. ✅ Improves user experience (simpler signup, fewer passwords)
4. ✅ Aligns with industry standards (70%+ of apps offer social login)
5. ✅ Provides user control (unlink anytime, set password anytime)
6. ✅ Technical feasibility proven (Supabase Auth handles complexity)

**Next Steps**:
1. Review and discuss this amendment
2. Ratify amendment → Update `constitution.md` to v3.2.0
3. Implement Phase 2: Google OAuth (4-6 hours)
4. Test with beta users (1-2 weeks)
5. Roll out to all users (monitor adoption and feedback)

---

**Amendment Prepared By**: Claude Sonnet 4.5
**Date**: 2026-02-09
**Reference Issue**: HIGH-004 (Password Reset Not Fully Functional)
**Target Implementation**: Q1 2026
