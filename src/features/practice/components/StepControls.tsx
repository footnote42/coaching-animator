'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  addProgression,
  MAX_POINT_LENGTH,
  moveProgression,
  removeProgression,
  setCommentary,
  setLever,
} from '@/features/practice/editing';
import { LEVERS, MAX_COACHING_POINTS, type Lever, type PracticeScript } from '@/features/practice/schema';

export const LEVER_NAMES: Record<Lever, string> = { space: 'Space', time: 'Time', equipment: 'Equipment', people: 'People' };

const FIELD =
  'h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

interface AddProgressionProps {
  script: PracticeScript;
  /** Commit the new script and select its last Step. */
  onAdd: (script: PracticeScript) => void;
}

/** "Add Progression": asks for the Lever, then adds an empty Step after the last one. */
export function AddProgressionButton({ script, onAdd }: AddProgressionProps) {
  const [open, setOpen] = useState(false);
  const [lever, setLeverChoice] = useState<Lever | ''>('');
  return (
    <>
      <Button variant="outline" className="h-11" onClick={() => setOpen(true)}>
        <Plus /> Add Progression
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add a Progression</DialogTitle>
            <DialogDescription>What does it change? Space, Time, Equipment, People, or leave blank.</DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1 text-sm text-text-primary">
            <span>Lever (optional)</span>
            <select value={lever} onChange={(e) => setLeverChoice(e.target.value as Lever | '')} className={FIELD}>
              <option value="">Leave blank</option>
              {LEVERS.map((l) => (
                <option key={l} value={l}>{LEVER_NAMES[l]}</option>
              ))}
            </select>
          </label>
          <DialogFooter>
            <Button variant="outline" className="h-11" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              className="h-11"
              onClick={() => {
                onAdd(addProgression(script, lever || undefined));
                setOpen(false);
              }}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface StepDetailsProps {
  script: PracticeScript;
  /** Step shown: 0 is the base, n is Progression n. */
  step: number;
  /** Commit an edit result (a refusal message is shown as a toast); returns whether it was made. */
  onChange: (result: PracticeScript | string) => boolean;
  /** Select another Step (after a reorder or delete). */
  onSelectStep: (step: number) => void;
  /** Keep the legend for screen readers only, when a heading above already names the Step. */
  hideLegend?: boolean;
}

/** Lever, order and Commentary of the selected Step. */
export function StepDetails({ script, step, onChange, onSelectStep, hideLegend }: StepDetailsProps) {
  const progression = step > 0 ? script.progressions[step - 1] : undefined;
  const points = progression ? progression.commentary.points : script.base.commentary.points;
  const [draft, setDraft] = useState('');
  const setPoints = (next: string[]) => onChange(setCommentary(script, step, next));

  return (
    <fieldset className="flex flex-col gap-2 text-sm text-text-primary">
      <legend className={hideLegend ? 'sr-only' : 'mb-1 font-medium'}>{progression ? `Step ${step}` : 'Base Step'}</legend>
      {progression && (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span>Lever (optional)</span>
            <select
              value={progression.lever ?? ''}
              onChange={(e) => onChange(setLever(script, step, (e.target.value || undefined) as Lever | undefined))}
              className={FIELD}
            >
              <option value="">None</option>
              {LEVERS.map((l) => (
                <option key={l} value={l}>{LEVER_NAMES[l]}</option>
              ))}
            </select>
          </label>
          <Button
            variant="outline"
            className="h-11 w-11"
            aria-label="Move Step earlier"
            title="Move Step earlier"
            disabled={step === 1}
            onClick={() => onChange(moveProgression(script, step, -1)) && onSelectStep(step - 1)}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="outline"
            className="h-11 w-11"
            aria-label="Move Step later"
            title="Move Step later"
            disabled={step === script.progressions.length}
            onClick={() => onChange(moveProgression(script, step, 1)) && onSelectStep(step + 1)}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => onChange(removeProgression(script, step)) && onSelectStep(step - 1)}
          >
            <Trash2 /> Delete Step
          </Button>
        </div>
      )}
      <span>Coaching points{progression && ' (the first says why this Step is harder)'}</span>
      <ul className="flex flex-col gap-1">
        {points.map((point, i) => (
          <li key={`${step}-${i}-${point}`} className="flex gap-1">
            <input
              aria-label={`Coaching point ${i + 1}`}
              defaultValue={point}
              maxLength={MAX_POINT_LENGTH}
              onBlur={(e) => setPoints(points.map((p, j) => (j === i ? e.target.value : p)))}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className={`${FIELD} min-w-0 flex-1`}
            />
            <Button
              variant="outline"
              className="h-11 w-11"
              aria-label={`Delete coaching point ${i + 1}`}
              onClick={() => setPoints(points.filter((_, j) => j !== i))}
            >
              <Trash2 />
            </Button>
          </li>
        ))}
      </ul>
      {points.length < MAX_COACHING_POINTS && (
        <form
          className="flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim() && setPoints([...points, draft])) setDraft('');
          }}
        >
          <input
            aria-label="New coaching point"
            placeholder="Add a coaching point"
            value={draft}
            maxLength={MAX_POINT_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            className={`${FIELD} min-w-0 flex-1`}
          />
          <Button type="submit" variant="outline" className="h-11" disabled={!draft.trim()}>
            Add
          </Button>
        </form>
      )}
    </fieldset>
  );
}
