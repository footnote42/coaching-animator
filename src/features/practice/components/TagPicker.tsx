'use client';

import { PRACTICE_TAGS, MAX_PRACTICE_TAGS } from '@/lib/practice-tags';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

/** Pick up to five Tags from the fixed list. */
export function TagPicker({ value, onChange }: Props) {
  const full = value.length >= MAX_PRACTICE_TAGS;
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-xs text-text-primary">
        Tags ({value.length}/{MAX_PRACTICE_TAGS})
      </legend>
      <div className="flex flex-wrap gap-1">
        {PRACTICE_TAGS.map((tag) => {
          const on = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              disabled={!on && full}
              onClick={() => toggle(tag)}
              className={`border border-[var(--color-border)] px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40 ${
                on ? 'bg-text-primary text-[var(--color-surface)]' : 'bg-[var(--color-surface)] text-text-primary'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
