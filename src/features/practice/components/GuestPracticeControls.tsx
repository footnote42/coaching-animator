'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import { useUser } from '@/lib/contexts/UserContext';
import { validate, formatError } from '@/features/practice/engine';
import { buildAskAiPrompt } from '@/features/practice/askAi';
import {
  clearDevicePractice,
  readDevicePractice,
  titleFor,
} from '@/features/practice/hooks/useGuestPractice';

function isEmptyPractice(text: string): boolean {
  try {
    return (JSON.parse(text)?.markers ?? []).length === 0;
  } catch {
    return false;
  }
}

/** Copy script (everyone) plus disabled Share/Publish with a reason (Guests). */
export function PracticeScriptActions({ text, isGuest }: { text: string; isGuest: boolean }) {
  const copy = async () => {
    const result = validate(text);
    if (!result.ok) {
      toast.error(`Fix the script first: ${formatError(result.errors[0])}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.script, null, 2));
      toast.success('Script copied.');
    } catch {
      toast.error("Couldn't copy the script. Select the text and copy it by hand.");
    }
  };

  const askAi = async () => {
    const result = validate(text);
    if (!result.ok && isEmptyPractice(text)) {
      toast.error('Add some players first, or ask your AI to write a new Practice (see How to write a script).');
      return;
    }
    if (!result.ok) {
      toast.error(`Fix the script first: ${formatError(result.errors[0])}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(buildAskAiPrompt(JSON.stringify(result.script, null, 2)));
      toast.success('Prompt and script copied. Paste them into your AI, say what to change, then paste its script back here.');
    } catch {
      toast.error("Couldn't copy the prompt. Use Copy script and paste it into your AI by hand.");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copy} disabled={!text.trim()}>Copy script</Button>
        <Button variant="outline" onClick={askAi} disabled={!text.trim()}>Ask your AI to change this</Button>
        {isGuest && (
          <>
            <Button variant="outline" disabled>Share</Button>
            <Button variant="outline" disabled>Publish</Button>
          </>
        )}
      </div>
      {isGuest && (
        <p className="text-xs text-text-primary">
          Share and Publish need an account. Until then this Practice stays on this device; use Copy script to pass it on.
        </p>
      )}
    </div>
  );
}

/** After sign-in, offers to move the device Practice into the account. */
export function DevicePracticeOffer({ onSaved }: { onSaved: () => void }) {
  const { user } = useUser();
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSaved(user ? readDevicePractice() : null);
  }, [user]);

  if (!saved) return null;

  const accept = async () => {
    let script: unknown;
    try {
      script = JSON.parse(saved);
    } catch {
      toast.error("The Practice on this device isn't valid JSON, so it can't be saved.");
      return;
    }
    setBusy(true);
    const res = await fetch('/api/practices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: titleFor(saved), visibility: 'private', script }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      clearDevicePractice();
      setSaved(null);
      toast.success('Saved to your account as a private Practice.');
      onSaved();
    } else {
      toast.error("Couldn't save it to your account. It is still on this device.");
    }
  };

  return (
    <div role="dialog" aria-label="Save device Practice" className="border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm">
      <p className="mb-2 text-text-primary">
        There is a Practice on this device. Save it to your account as a private Practice?
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={accept} disabled={busy}>Save to account</Button>
        <Button size="sm" variant="outline" onClick={() => setSaved(null)}>Not now</Button>
      </div>
    </div>
  );
}
