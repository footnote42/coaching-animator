/** Share a link with the native share sheet, else copy it to the clipboard. */
export async function sharePracticeLink(url: string, title: string): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text: `Watch ${title} on Coaching Animator`, url });
      return 'shared';
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return 'shared';
    }
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return 'copied';
    }
  } catch {
    // fall through
  }
  return 'failed';
}
