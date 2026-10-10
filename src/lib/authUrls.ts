import { DEFAULT_NEXT, safeNext } from '@/lib/safeNext';

/** Email-confirmation link target: `/auth/confirm?next=<safe path>`. */
export function buildConfirmUrl(origin: string, redirect: string | null | undefined): string {
  return `${origin}/auth/confirm?next=${encodeURIComponent(safeNext(redirect))}`;
}

/** OAuth return target: `/auth/callback?next=<safe path>`. */
export function buildCallbackUrl(origin: string, redirect: string | null | undefined): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNext(redirect))}`;
}

/**
 * Link between /login and /register that carries the destination across.
 * The default destination is left off to keep the URL clean.
 */
export function authPageHref(path: '/login' | '/register', redirect: string | null | undefined): string {
  const safe = safeNext(redirect);
  return safe === DEFAULT_NEXT ? path : `${path}?redirect=${encodeURIComponent(safe)}`;
}
