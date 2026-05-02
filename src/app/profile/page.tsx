'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
import { putWithRetry } from '@/lib/api-client';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getInitials } from './profileUtils';

const BADGE_MAX_BYTES = 500 * 1024; // 500 KB
const BADGE_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];



export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [clubName, setClubName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [clubBadgeUrl, setClubBadgeUrl] = useState<string | null>(null);
  const [badgeUploading, setBadgeUploading] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);

  // OAuth / Password Management State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Sync local display name with profile once loaded
  useEffect(() => {
    console.log('[Profile] profile.display_name changed:', profile?.display_name);
    console.log('[Profile] profile.animation_count:', profile?.animation_count);
    if (profile) {
      setDisplayName(profile.display_name || '');
      setClubName(profile.club_name || '');
      setPrimaryColor(profile.primary_strip_color || '');
      setSecondaryColor(profile.secondary_strip_color || '');
      setClubBadgeUrl(profile.club_badge_url ?? null);
    }
  }, [profile]);

  // Redirect if not logged in after auth finishes
  useEffect(() => {
    // Add a grace period to allow auth state to stabilize
    // This prevents premature redirects during AbortError recovery
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        router.push('/login?redirect=/profile');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('[Profile] Saving profile...');
      const { ok, status, error: apiError } = await putWithRetry(
        '/api/user/profile',
        {
          display_name: displayName.trim() || null,
          club_name: clubName.trim() || null,
          primary_strip_color: primaryColor || null,
          secondary_strip_color: secondaryColor || null,
        }
      );

      console.log('[Profile] API response - ok:', ok, 'status:', status);

      if (!ok) {
        throw new Error(apiError || `Failed to update profile (${status})`);
      }

      console.log('[Profile] Calling refreshProfile...');
      await refreshProfile(); // Update global state
      console.log('[Profile] refreshProfile complete');

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[Profile] Save error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleBadgeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setBadgeError(null);

    if (!BADGE_ALLOWED_TYPES.includes(file.type)) {
      setBadgeError('Only PNG, JPG, and SVG files are allowed.');
      return;
    }
    if (file.size > BADGE_MAX_BYTES) {
      setBadgeError('File must be under 500 KB.');
      return;
    }

    setBadgeUploading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `${user.id}/badge.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('club-badges')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('club-badges')
        .getPublicUrl(path);

      const { ok, error: apiError } = await putWithRetry('/api/user/profile', {
        club_badge_url: publicUrl,
      });

      if (!ok) throw new Error(apiError || 'Failed to save badge URL');

      setClubBadgeUrl(publicUrl);
      await refreshProfile();
    } catch (err) {
      setBadgeError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBadgeUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (badgeInputRef.current) badgeInputRef.current.value = '';
    }
  };

  const handleBadgeRemove = async () => {
    if (!user) return;
    setBadgeError(null);
    setBadgeUploading(true);
    try {
      const { ok, error: apiError } = await putWithRetry('/api/user/profile', {
        club_badge_url: null,
      });
      if (!ok) throw new Error(apiError || 'Failed to remove badge');
      setClubBadgeUrl(null);
      await refreshProfile();
    } catch (err) {
      setBadgeError(err instanceof Error ? err.message : 'Remove failed');
    } finally {
      setBadgeUploading(false);
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinking(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        scopes: 'openid email profile',
      },
    });
  };

  const handleUnlink = async (identityId: string) => {
    if (!confirm('Are you sure you want to unlink this account?')) return;
    setSaving(true);

    const identity = user?.identities?.find(id => id.identity_id === identityId);
    if (!identity) {
      setError('Identity not found');
      setSaving(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account unlinked successfully');
      // Refresh session to update identities
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) console.error('Error refreshing session:', refreshError);
      window.location.reload();
    }
    setSaving(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setSaving(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password set successfully');
      setPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  // Helper to check if user has a password set (email provider exists)
  // user.identities is available on the Supabase User object
  const identities = user?.identities || [];
  const hasEmailProvider = identities.some(id => id.provider === 'email');
  const googleIdentity = identities.find(id => id.provider === 'google');
  const canUnlink = identities.length > 1;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface-warm flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-none"></div>
      </div>
    );
  }

  if (!user) return null; // Wait for redirect

  const animationCount = profile?.animation_count || 0;
  const maxAnimations = profile?.max_animations || 50;
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;


  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Circle */}
            <div className="w-24 h-24 rounded-none bg-pitch-green flex items-center justify-center overflow-hidden border-2 border-border flex-shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName || 'Profile'}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <span className="text-3xl font-heading font-bold text-tactics-white">
                  {getInitials(displayName, user.email || null)}
                </span>
              )}
            </div>

            {/* Coach Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-heading font-bold text-text-primary uppercase tracking-tight">
                {displayName ? displayName : <span className="italic opacity-50">Add your name</span>}
              </h1>
              <p className="text-lg text-text-primary/60 mt-1">
                {clubName ? clubName : <span className="italic opacity-50 text-sm">Add your club</span>}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-none">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-none">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-primary mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-border rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-text-primary/60">
                Shown on public animations.
              </p>
            </div>

            <div>
              <label htmlFor="clubName" className="block text-sm font-medium text-text-primary mb-1">
                Club Name
              </label>
              <input
                type="text"
                id="clubName"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                maxLength={100}
                placeholder="e.g. Hampshire RFC"
                className="w-full px-3 py-2 border border-border rounded-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="mt-1 text-xs text-text-primary/60">
                Your primary club or team.
              </p>
            </div>

            {/* Club Branding */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-4">Club Branding</h3>
              
              <div className="space-y-6">
                {/* Club Badge */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Club Badge
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border border-border bg-surface-warm flex items-center justify-center overflow-hidden flex-shrink-0">
                      {clubBadgeUrl ? (
                        <Image
                          src={clubBadgeUrl}
                          alt="Club badge"
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <svg className="w-8 h-8 text-text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={badgeInputRef}
                        type="file"
                        id="clubBadge"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleBadgeUpload}
                        disabled={badgeUploading}
                        className="hidden"
                      />
                      <label
                        htmlFor="clubBadge"
                        className={`px-3 py-1.5 text-sm border border-border rounded-none cursor-pointer hover:bg-surface-warm ${badgeUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {badgeUploading ? 'Uploading...' : clubBadgeUrl ? 'Change Badge' : 'Upload Badge'}
                      </label>
                      {clubBadgeUrl && (
                        <button
                          type="button"
                          onClick={handleBadgeRemove}
                          disabled={badgeUploading}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-none hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-text-primary/60">PNG, JPG or SVG, max 500 KB</p>
                  {badgeError && (
                    <p className="mt-1 text-xs text-red-600">{badgeError}</p>
                  )}
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-text-primary mb-1">
                      Primary Strip Colour
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={primaryColor || '#3b82f6'}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-none border border-border cursor-pointer"
                      />
                      <span className="text-sm text-text-primary/60">{primaryColor || 'Not set'}</span>
                      {primaryColor && (
                        <button type="button" onClick={() => setPrimaryColor('')} className="text-xs text-text-primary/40 hover:text-text-primary/70">Clear</button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-primary/60">Default colour for attack players</p>
                  </div>

                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-text-primary mb-1">
                      Secondary Strip Colour
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={secondaryColor || '#ef4444'}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded-none border border-border cursor-pointer"
                      />
                      <span className="text-sm text-text-primary/60">{secondaryColor || 'Not set'}</span>
                      {secondaryColor && (
                        <button type="button" onClick={() => setSecondaryColor('')} className="text-xs text-text-primary/40 hover:text-text-primary/70">Clear</button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-primary/60">Default colour for defense players</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-text-primary mb-2">Usage</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary/70">Saved Animations</span>
                <span className="font-medium">{animationCount} / {maxAnimations}</span>
              </div>
              <div className="mt-2 w-full bg-surface-warm rounded-none h-2">
                <div
                  className="bg-primary h-2 rounded-none transition-all"
                  style={{ width: `${Math.min((animationCount / maxAnimations) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Account Settings Section */}
        <div className="mt-8 bg-surface border border-border p-6">
          <h2 className="text-sm uppercase tracking-widest text-text-primary/60 mb-6">Account Settings</h2>

          <div className="space-y-8">
            {/* Read-only Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border border-border rounded-none bg-surface-warm text-text-primary/60 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-text-primary/40 italic">Email cannot be changed</p>
            </div>

            {/* Connected Accounts */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-base font-medium text-text-primary mb-4">Login Methods</h3>
              <div className="space-y-4">
                {/* Google Account */}
                <div className="flex items-center justify-between p-4 border border-border rounded-none">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <div>
                      <p className="font-medium text-text-primary">Google</p>
                      {googleIdentity && <p className="text-xs text-text-primary/60">Connected</p>}
                    </div>
                  </div>

                  {googleIdentity ? (
                    <button
                      onClick={() => handleUnlink(googleIdentity.identity_id)}
                      disabled={!canUnlink || saving}
                      className="px-3 py-1 text-sm border border-border rounded-none text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!canUnlink ? "Cannot unlink the only login method" : ""}
                    >
                      Unlink
                    </button>
                  ) : (
                    <button
                      onClick={handleLinkGoogle}
                      disabled={isLinking}
                      className="px-3 py-1 text-sm border border-border rounded-none text-text-primary hover:bg-surface-warm"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Password Management */}
            <div className="pt-6 border-t border-border">
              <h3 className="text-base font-medium text-text-primary mb-2">
                {hasEmailProvider ? 'Change Password' : 'Set Password'}
              </h3>
              <p className="text-sm text-text-primary/60 mb-4">
                {hasEmailProvider
                  ? 'Update your password associated with your email address.'
                  : 'Set a password to log in with your email address as a backup.'}
              </p>

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-none"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary text-text-inverse text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  Set Password
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-surface border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a
              href="/my-gallery"
              className="block text-primary hover:text-primary/80"
            >
              My Playbook →
            </a>
            <a
              href="/gallery"
              className="block text-primary hover:text-primary/80"
            >
              Public Gallery →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
