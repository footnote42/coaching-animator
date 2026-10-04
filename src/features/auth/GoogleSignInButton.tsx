'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Script from 'next/script';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { createGoogleNonce, type GoogleNonce } from './nonce';

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce: string;
    use_fedcm_for_prompt: boolean;
    use_fedcm_for_button?: boolean;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: Record<string, string | number | boolean>,
  ) => void;
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } };
  }
}

interface GoogleSignInButtonProps {
  /** Called after Supabase accepts the Google ID token. */
  onSuccess: () => void;
  onError: (message: string) => void;
  /** Rendered instead when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset (the redirect flow). */
  fallback: ReactNode;
  /** 'signin' signs in or creates the account; 'link' attaches Google to the signed-in user. */
  mode?: 'signin' | 'link';
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Google Identity Services button. Google's script runs on our own page and the
 * ID token goes to Supabase through signInWithIdToken, so the user never sees
 * the Supabase address. The script is loaded here only, not site-wide.
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  fallback,
  mode = 'signin',
  text = 'continue_with',
}: GoogleSignInButtonProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return <>{fallback}</>;
  return (
    <GisButton clientId={clientId} onSuccess={onSuccess} onError={onError} mode={mode} text={text} />
  );
}

function GisButton({
  clientId,
  onSuccess,
  onError,
  mode,
  text,
}: {
  clientId: string;
  onSuccess: () => void;
  onError: (message: string) => void;
  mode: 'signin' | 'link';
  text: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nonceRef = useRef<GoogleNonce | null>(null);
  const handlersRef = useRef({ onSuccess, onError });
  handlersRef.current = { onSuccess, onError };
  const [scriptReady, setScriptReady] = useState(
    () => typeof window !== 'undefined' && !!window.google?.accounts?.id,
  );

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      const nonce = nonceRef.current;
      if (!nonce) return;
      const supabase = createSupabaseBrowserClient();
      const credentials = {
        provider: 'google' as const,
        token: response.credential,
        nonce: nonce.raw,
      };
      const { error } =
        mode === 'link'
          ? await supabase.auth.linkIdentity(credentials)
          : await supabase.auth.signInWithIdToken(credentials);
      if (error) {
        console.error('[Google Sign-In] Error:', error.message);
        handlersRef.current.onError('Google sign-in failed. Please try again.');
        return;
      }
      handlersRef.current.onSuccess();
    },
    [mode],
  );

  useEffect(() => {
    if (!scriptReady) return;
    const gsi = window.google?.accounts?.id;
    const container = containerRef.current;
    if (!gsi || !container) return;
    let cancelled = false;
    createGoogleNonce().then((nonce) => {
      if (cancelled) return;
      nonceRef.current = nonce;
      gsi.initialize({
        client_id: clientId,
        callback: handleCredential,
        nonce: nonce.hashed,
        use_fedcm_for_prompt: true,
        use_fedcm_for_button: true,
      });
      container.innerHTML = '';
      gsi.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'center',
        width: Math.min(400, Math.max(200, container.clientWidth || 320)),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [scriptReady, clientId, handleCredential, text]);

  return (
    <>
      <Script
        src={GSI_SRC}
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => handlersRef.current.onError('Could not load Google sign-in. Please try again.')}
      />
      <div ref={containerRef} className="w-full flex justify-center min-h-[44px]" />
    </>
  );
}
