'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/contexts/UserContext';
import { putWithRetry, deleteWithRetry } from '@/lib/api-client';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { getInitials } from './profileUtils';
import { PersonalTokensList } from './PersonalTokensList';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';


export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile, signOut } = useUser();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  // OAuth / Password Management State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Sync local display name with profile once loaded
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
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
      const { ok, status, error: apiError } = await putWithRetry(
        '/api/user/profile',
        {
          display_name: displayName.trim() || null,
        }
      );


      if (!ok) {
        throw new Error(apiError || `Failed to update profile (${status})`);
      }

      await refreshProfile(); // Update global state

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[Profile] Save error:', err);
      setError('We could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Redirect flow: linkIdentity sends the signed-in user through Google and
  // back to /auth/callback (needs manual identity linking enabled in Supabase).
  const handleLinkGoogle = async () => {
    setIsLinking(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
    if (linkError) {
      console.error('[Profile] Link Google error:', linkError.message);
      setError('We could not connect Google. Please try again.');
      setIsLinking(false);
    }
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
      console.error('[Profile] Auth update error:', error);
      setError('That change could not be saved. Please try again.');
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
      console.error('[Profile] Auth update error:', error);
      setError('That change could not be saved. Please try again.');
    } else {
      setSuccess('Password set successfully');
      setPassword('');
      setConfirmPassword('');
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError(null);
    const { ok } = await deleteWithRetry('/api/user/account');
    if (!ok) {
      setError('We could not delete your account. Please try again.');
      setDeleting(false);
      return;
    }
    await signOut(); // clears local session and returns to the home page
  };

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch('/api/user/export');
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coaching-animator-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Profile] Export error:', err);
      setError('We could not prepare your data. Please try again. You can download it up to 5 times an hour.');
    } finally {
      setExporting(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-none bg-pitch-green flex items-center justify-center overflow-hidden border-2 border-border flex-shrink-0">
                <span className="text-3xl font-heading font-bold text-tactics-white">
                  {getInitials(displayName, user.email || null)}
                </span>
            </div>

            {/* Coach Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-heading font-bold text-text-primary uppercase tracking-tight">
                {displayName ? displayName : <span className="italic opacity-50">Add your name</span>}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border p-6">
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="p-3 bg-danger-surface border border-danger/40 rounded-none">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-success-surface border border-success/40 rounded-none">
                <p className="text-sm text-success">{success}</p>
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
              <p className="mt-1 text-xs text-text-primary/70">
                Your name as Coach.
              </p>
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
          <h2 className="text-sm uppercase tracking-widest text-text-primary/70 mb-6">Account Settings</h2>

          <div className="space-y-8">
            {/* Read-only Email */}
            <div>
              <label htmlFor="emailAddress" className="block text-sm font-medium text-text-primary mb-1">
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                value={user.email || ''}
                disabled
                placeholder="Email address"
                className="w-full px-3 py-2 border border-border rounded-none bg-surface-warm text-text-primary/70 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-text-primary/70 italic">Email cannot be changed</p>
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
                      {googleIdentity && <p className="text-xs text-text-primary/70">Connected</p>}
                    </div>
                  </div>

                  {googleIdentity ? (
                    <button
                      onClick={() => handleUnlink(googleIdentity.identity_id)}
                      disabled={!canUnlink || saving}
                      className="px-3 py-1 text-sm border border-border rounded-none text-danger hover:bg-danger-surface disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-sm text-text-primary/70 mb-4">
                {hasEmailProvider
                  ? 'Update your password associated with your email address.'
                  : 'Set a password to log in with your email address as a backup.'}
              </p>

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-1">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-none"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-1">Confirm Password</label>
                  <input
                    id="confirmPassword"
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

        <PersonalTokensList />

        <div className="mt-6 bg-surface border border-border p-6">
          <h2 className="text-sm uppercase tracking-widest text-text-primary/70 mb-4">Your Data</h2>
          <p className="text-sm text-text-primary/70 mb-4">
            Download a copy of your profile, your Practices and your access tokens (names and dates only) as a JSON file.
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 text-sm border border-border rounded-none text-text-primary hover:bg-surface-warm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Preparing...' : 'Download my data'}
          </button>
        </div>

        <div className="mt-6 bg-surface border border-border p-6">
          <h2 className="text-sm uppercase tracking-widest text-text-primary/70 mb-4">Delete Account</h2>
          <p className="text-sm text-text-primary/70 mb-4">
            Permanently delete your account, your Practices and your personal data. This cannot be undone.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                disabled={deleting}
                className="px-4 py-2 text-sm border border-danger/60 rounded-none text-danger hover:bg-danger-surface disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete my account'}
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete your account?</DialogTitle>
                <DialogDescription>
                  This permanently deletes your account, your Practices and your personal data. It cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleting}>
                  Delete my account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-6 bg-surface border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a
              href="/my-practices"
              className="block text-primary hover:text-primary/80"
            >
              My Practices →
            </a>
            <a
              href="/gallery"
              className="block text-primary hover:text-primary/80"
            >
              Gallery →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
