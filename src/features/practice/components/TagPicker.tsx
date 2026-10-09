'use client';

import { PRACTICE_TAG_GROUPS, MAX_PRACTICE_TAGS } from '@/lib/practice-tags';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

/** Pick up to five Tags from the fixed list, shown in four headed groups. */
export function TagPicker({ value, onChange }: Props) {
  const full = value.length >= MAX_PRACTICE_TAGS;
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-text-primary">
        Tags ({value.length}/{MAX_PRACTICE_TAGS})
      </legend>
      {PRACTICE_TAG_GROUPS.map((group) => (
        <div key={group.name} role="group" aria-label={group.name} className="flex flex-col gap-1">
          <span aria-hidden className="text-xs text-text-muted">{group.name}</span>
          <div className="flex flex-wrap gap-1">
            {group.tags.map((tag) => {
              const on = value.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(tag)}
                  className={`min-h-11 border border-[var(--color-border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-40 ${
                    on ? 'bg-text-primary text-[var(--color-surface)]' : 'bg-[var(--color-surface)] text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
