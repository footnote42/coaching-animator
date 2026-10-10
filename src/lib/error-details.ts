export interface ErrorDetailsInput {
  message: string;
  digest?: string;
  stack?: string;
  /** window.location.href at the time of the error. */
  href: string;
  /** ISO 8601 time the details were captured. */
  time: string;
}

/**
 * Plain-text block a Coach can paste into the feedback form. Nothing is sent
 * anywhere: this only builds the string for the clipboard.
 */
export function buildErrorDetails({ message, digest, stack, href, time }: ErrorDetailsInput): string {
  const lines = [
    'Coaching Animator error details',
    `Message: ${message || '(no message)'}`,
  ];
  if (digest) lines.push(`Digest: ${digest}`);
  if (stack) lines.push('Stack:', stack);
  lines.push(`Page: ${href}`, `Time: ${time}`);
  return lines.join('\n');
}
