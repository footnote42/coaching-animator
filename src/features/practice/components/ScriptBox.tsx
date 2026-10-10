'use client';

import { Button } from '@/shared/ui/button';
import example from '@/features/practice/examples/passing-square-progressions.json';

/** The Practice Script box: paste a script (JSON) and apply it. Loaded when the section is first opened. */
export function ScriptBox({
  text,
  setText,
  scriptText,
  applyText,
}: {
  text: string;
  setText: (text: string) => void;
  scriptText: string;
  applyText: (text: string) => void;
}) {
  return (
    <details className="flex flex-col gap-2">
      <summary className="cursor-pointer py-2 text-sm font-medium text-text-primary">Practice Script</summary>
      <label htmlFor="practice-script" className="text-sm text-text-primary">
        The script for this Practice. Paste one (JSON) and apply it, or edit on the canvas.
      </label>
      <textarea
        id="practice-script"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="mt-2 h-48 w-full resize-y border border-[var(--color-border)] bg-[var(--color-surface)] p-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button onClick={() => applyText(text)} disabled={!text.trim() || text === scriptText}>
          Apply script
        </Button>
        <Button variant="outline" onClick={() => applyText(JSON.stringify(example))}>
          Use example
        </Button>
      </div>
    </details>
  );
}
