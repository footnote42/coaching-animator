'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  MousePointer2,
  Spline,
  ArrowRightLeft,
  Undo2,
  Redo2,
  Trash2,
  Ghost,
  FilePlus,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { validate, resolveStep, positionsAt, formatError, stepCount } from '@/features/practice/engine';
import {
  applyStepArea,
  applyStepEdit,
  editorReducer,
  emptyScript,
  initialEditorState,
  NO_SELECTION,
  type Edit,
  type EditorSelection,
  type EditorTool,
} from '@/features/practice/editing';
import { PracticeScriptActions, DevicePracticeOffer } from '@/features/practice/components/GuestPracticeControls';
import { useGuestPractice } from '@/features/practice/hooks/useGuestPractice';
import { PracticeLibrary } from '@/features/practice/components/PracticeLibrary';
import { AreaControl } from '@/features/practice/components/AreaControl';
import { AddProgressionButton, LEVER_NAMES, StepDetails } from '@/features/practice/components/StepControls';
import { markerColour } from '@/features/practice/markerColour';
import { PACES, type Area, type MarkerKind, type Pace, type PracticeScript } from '@/features/practice/schema';
import { cn } from '@/lib/utils';
import example from '@/features/practice/examples/passing-square-progressions.json';

const PracticeCanvas = dynamic(() => import('@/features/practice/components/PracticeCanvas'), {
  ssr: false,
});

// Konva layers load on the client only, like the canvas they draw on.
const PracticeEditLayer = dynamic(
  () => import('@/features/practice/components/PracticeEditLayer').then((m) => m.PracticeEditLayer),
  { ssr: false },
);
const PracticeGhostLayer = dynamic(
  () => import('@/features/practice/components/PracticeEditLayer').then((m) => m.PracticeGhostLayer),
  { ssr: false },
);

const PALETTE: Array<{ kind: MarkerKind; name: string }> = [
  { kind: 'attacker', name: 'Attacker' },
  { kind: 'defender', name: 'Defender' },
  { kind: 'ball', name: 'Ball' },
  { kind: 'cone', name: 'Cone' },
  { kind: 'tackle-shield', name: 'Tackle shield' },
  { kind: 'coach', name: 'Coach' },
];

const PACE_NAMES: Record<Pace, string> = { walk: 'Walk', jog: 'Jog', sprint: 'Sprint' };

const TOOL_HINTS: Record<'select' | 'run' | 'pass' | 'place', string> = {
  select: 'Drag a marker to move it. Tap one to select it.',
  run: 'Tap a player, then tap cells to draw their run. Drag a waypoint to move it.',
  pass: 'Tap the player with the ball, then the player receiving.',
  place: 'Tap the Area to place it. The ball goes to the nearest player.',
};

/** Toolbar buttons: at least 44 px square for touch. */
const TOOL_BUTTON = 'h-11 min-w-11 px-2';

/**
 * The Practice editor: build the base Step by hand on the canvas, or paste a Practice
 * Script. Both write the same script, which the script box always reflects.
 * A Step strip picks the base or a Progression; Commentary shows over the canvas.
 */
export function PracticeImport() {
  const router = useRouter();
  const openId = useSearchParams().get('id');
  const [editor, dispatch] = useReducer(editorReducer, undefined, () => initialEditorState());
  const script = editor.script;
  const scriptText = useMemo(() => JSON.stringify(script, null, 2), [script]);
  const [text, setText] = useState(scriptText);
  const [errors, setErrors] = useState<string[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [practiceId, setPracticeId] = useState<string | null>(null);
  const loadedId = useRef<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tool, setTool] = useState<EditorTool>('select');
  const [rawSelection, setSelection] = useState<EditorSelection>(NO_SELECTION);
  const [ghost, setGhost] = useState(false);
  const [showCommentary, setShowCommentary] = useState(true);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const lastFrame = useRef<number | null>(null);

  // The script box always shows the script; typing there is a draft until applied.
  useEffect(() => setText(scriptText), [scriptText]);

  const shownStep = Math.min(stepIndex, stepCount(script) - 1);
  const step = useMemo(() => {
    try {
      return resolveStep(script, shownStep);
    } catch {
      return null;
    }
  }, [script, shownStep]);
  const duration = useMemo(() => (step ? positionsAt(step, 0).duration : 0), [step]);
  const problems = useMemo(() => {
    if (script.markers.length === 0) return [];
    const result = validate(script);
    return result.ok ? [] : result.errors.map(formatError);
  }, [script]);

  const selection: EditorSelection =
    rawSelection.marker && step?.markers.some((m) => m.id === rawSelection.marker) ? rawSelection : NO_SELECTION;
  const selectedMarker = step?.markers.find((m) => m.id === selection.marker);
  const selectedMove = step?.moves.find((m) => m.marker === selection.marker);
  const passes = step?.passes ?? [];
  const editing = step !== null && !playing && time === 0;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      const dt = lastFrame.current === null ? 0 : (now - lastFrame.current) / 1000;
      lastFrame.current = now;
      setTime((t) => Math.min(t + dt, duration));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastFrame.current = null;
    };
  }, [playing, duration]);

  useEffect(() => {
    if (playing && time >= duration) setPlaying(false);
  }, [playing, time, duration]);

  const stopPlayback = () => {
    setPlaying(false);
    setTime(0);
  };

  /** Commit an edit result as one undoable step, or show why it was refused. */
  const commit = (result: PracticeScript | string): boolean => {
    if (typeof result === 'string') {
      toast.error(result);
      return false;
    }
    dispatch({ type: 'commit', script: result });
    stopPlayback();
    return true;
  };

  /** Edit the shown Step: the base directly, a Progression as its changes. */
  const edit = (change: Edit): boolean => commit(applyStepEdit(script, shownStep, change));

  const pickTool = (next: EditorTool) => {
    setTool(next);
    stopPlayback();
    if (next !== 'select' && next !== 'run' && next !== 'pass') setSelection(NO_SELECTION);
  };

  const deleteSelection = () => {
    if (!selection.marker) return;
    if (selection.waypoint !== null) {
      edit({ type: 'removeWaypoint', marker: selection.marker, index: selection.waypoint });
      setSelection({ marker: selection.marker, waypoint: null });
    } else {
      edit({ type: 'removeMarker', marker: selection.marker });
      setSelection(NO_SELECTION);
    }
  };

  const undo = () => {
    dispatch({ type: 'undo' });
    stopPlayback();
  };
  const redo = () => {
    dispatch({ type: 'redo' });
    stopPlayback();
  };

  // Keyboard: undo/redo and delete, but never while typing in a field.
  const onKey = useRef<(e: KeyboardEvent) => void>(() => {});
  onKey.current = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (mod && key === 'y') {
      e.preventDefault();
      redo();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && editing && selection.marker) {
      e.preventDefault();
      deleteSelection();
    } else if (e.key === 'Escape') {
      setSelection(NO_SELECTION);
    }
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  /** Start from a script with fresh history (a new, opened or restored Practice). */
  const openScript = (next: PracticeScript) => {
    dispatch({ type: 'load', script: next });
    setErrors([]);
    setStepIndex(0);
    setSelection(NO_SELECTION);
    stopPlayback();
  };

  /** Apply pasted text as one undoable edit. */
  const applyText = (source: string) => {
    const result = validate(source);
    if (!result.ok) {
      setErrors(result.errors.map(formatError));
      return;
    }
    setErrors([]);
    dispatch({ type: 'commit', script: result.script });
    if (!title && result.script.title) setTitle(result.script.title);
    setStepIndex(0);
    setSelection(NO_SELECTION);
    stopPlayback();
  };

  /** Set the shown Step's Area as one undoable edit (a setArea change in a Progression). */
  const setArea = (area: Area) => commit(applyStepArea(script, shownStep, area));
  const [libraryKey, setLibraryKey] = useState(0);
  // A Guest's device slot holds the script once there is something in it.
  const deviceText = script.markers.length > 0 || text !== scriptText ? text : '';
  const { isGuest } = useGuestPractice(
    deviceText,
    (saved) => {
      const result = validate(saved);
      if (result.ok) openScript(result.script);
      else {
        setText(saved);
        setErrors(result.errors.map(formatError));
      }
    },
    !!openId,
  );

  useEffect(() => {
    if (!openId || openId === loadedId.current) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/practices/${openId}`).catch(() => null);
      if (cancelled) return;
      if (!res?.ok) {
        setErrors(['This Practice could not be found.']);
        return;
      }
      const { practice } = await res.json();
      const result = validate(practice.script);
      if (!result.ok) {
        setText(JSON.stringify(practice.script, null, 2));
        setErrors(result.errors.map(formatError));
        return;
      }
      loadedId.current = openId;
      setPracticeId(openId);
      setTitle(practice.title ?? '');
      setDescription(practice.description ?? '');
      openScript(result.script);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const newPractice = () => {
    loadedId.current = null;
    setPracticeId(null);
    setTitle('');
    setDescription('');
    openScript(emptyScript());
    if (openId) router.replace('/practice');
  };

  const saved = (id: string) => {
    if (id === practiceId) return;
    loadedId.current = id;
    setPracticeId(id);
    router.replace(`/practice?id=${id}`);
  };

  const restart = () => {
    setTime(0);
    setPlaying(true);
  };

  const playStep = (n: number) => {
    setStepIndex(n);
    setSelection(NO_SELECTION);
    setTime(0);
    setPlaying(false);
  };

  const placeKind = PALETTE.find((p) => p.kind === tool);
  const toolHint = TOOL_HINTS[placeKind ? 'place' : (tool as 'select' | 'run' | 'pass')];
  const hint = shownStep > 0 ? `${toolHint} Edits here change Step ${shownStep} and the Steps after it.` : toolHint;
  const ball = step?.markers.find((m) => m.kind === 'ball');
  const holdsBall = selectedMarker && ball?.holder === selectedMarker.id;
  const stepArea = step?.area ?? script.area;

  return (
    <div className="flex flex-col gap-4 overflow-x-hidden p-4 md:h-[calc(100dvh-57px)] md:flex-row">
      <section className="flex min-w-0 flex-col gap-3 md:w-80 md:shrink-0 md:overflow-y-auto lg:w-96">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-heading font-bold text-text-primary">Practice editor</h1>
          <Button variant="outline" className={TOOL_BUTTON} onClick={newPractice}>
            <FilePlus /> New
          </Button>
        </div>
        <PracticeLibrary
          key={libraryKey}
          scriptText={scriptText}
          practiceId={practiceId}
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSaved={saved}
          onOpen={(id) => router.push(`/practice?id=${id}`)}
        />
        <AreaControl key={`${shownStep}-${stepArea.template}-${stepArea.width}x${stepArea.length}`} area={stepArea} onChange={setArea} />
        <StepDetails script={script} step={shownStep} onChange={commit} onSelectStep={playStep} />
        <PracticeScriptActions text={scriptText} isGuest={isGuest} />
        <Link href="/practice-script/v1/guide" className="text-sm text-primary underline">How to write a script, or have an AI write it</Link>
        <DevicePracticeOffer onSaved={() => setLibraryKey((k) => k + 1)} />
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
        {errors.length > 0 && (
          <div role="alert" className="border border-destructive p-2 text-sm">
            <p className="mb-1 font-medium text-destructive">This script can&apos;t be loaded:</p>
            <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {problems.length > 0 && (
          <div role="status" className="border border-[var(--color-border)] p-2 text-sm">
            <p className="mb-1 font-medium text-text-primary">Not ready to save yet:</p>
            <ul className="list-disc space-y-1 pl-5 font-mono text-xs">
              {problems.slice(0, 5).map((problem, i) => (
                <li key={i}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="order-first flex min-w-0 flex-col gap-2 md:order-none md:min-h-0 md:flex-1">
        <div role="group" aria-label="Steps" className="flex flex-wrap gap-2">
          {Array.from({ length: stepCount(script) }, (_, n) => {
            const lever = n > 0 ? script.progressions[n - 1].lever : undefined;
            return (
              <Button
                key={n}
                className="h-11"
                variant={n === shownStep ? 'default' : 'outline'}
                aria-pressed={n === shownStep}
                onClick={() => playStep(n)}
              >
                {lever ? `${n}. ${LEVER_NAMES[lever]}` : 'Base'}
              </Button>
            );
          })}
          <AddProgressionButton
            script={script}
            onAdd={(next) => commit(next) && playStep(next.progressions.length)}
          />
        </div>

        <div role="toolbar" aria-label="Editing tools" className="flex flex-wrap items-center gap-1">
          {(
            [
              { id: 'select', name: 'Select and drag', icon: <MousePointer2 /> },
              { id: 'run', name: 'Draw a run', icon: <Spline /> },
              { id: 'pass', name: 'Add a pass', icon: <ArrowRightLeft /> },
            ] as const
          ).map(({ id, name, icon }) => (
            <Button
              key={id}
              variant={tool === id ? 'default' : 'outline'}
              className={TOOL_BUTTON}
              aria-label={name}
              aria-pressed={tool === id}
              title={name}
              onClick={() => pickTool(id)}
            >
              {icon}
            </Button>
          ))}
          <span className="mx-1 h-8 w-px bg-[var(--color-border)]" aria-hidden />
          {PALETTE.map(({ kind, name }) => (
            <Button
              key={kind}
              variant={tool === kind ? 'default' : 'outline'}
              className={TOOL_BUTTON}
              aria-label={`Place ${name.toLowerCase()}`}
              aria-pressed={tool === kind}
              title={`Place ${name.toLowerCase()}`}
              onClick={() => pickTool(kind)}
            >
              <span
                aria-hidden
                className={cn('inline-block h-4 w-4 border border-black/40', kind === 'tackle-shield' ? 'w-2.5' : kind !== 'cone' && 'rounded-full')}
                style={{ backgroundColor: markerColour({ kind }) }}
              />
              <span className="hidden lg:inline">{name}</span>
            </Button>
          ))}
          <span className="mx-1 h-8 w-px bg-[var(--color-border)]" aria-hidden />
          <Button variant="outline" className={TOOL_BUTTON} aria-label="Undo" title="Undo (Ctrl+Z)" onClick={undo} disabled={editor.past.length === 0}>
            <Undo2 />
          </Button>
          <Button variant="outline" className={TOOL_BUTTON} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={editor.future.length === 0}>
            <Redo2 />
          </Button>
          <Button
            variant="outline"
            className={TOOL_BUTTON}
            aria-label={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
            title={selection.waypoint !== null ? 'Delete waypoint' : 'Delete marker'}
            onClick={deleteSelection}
            disabled={!editing || !selection.marker}
          >
            <Trash2 />
          </Button>
          <Button
            variant={ghost ? 'default' : 'outline'}
            className={TOOL_BUTTON}
            aria-label="Ghost mode"
            aria-pressed={ghost}
            title="Ghost mode: show where markers started and were a moment ago"
            onClick={() => setGhost((g) => !g)}
          >
            <Ghost />
          </Button>
        </div>

        <p aria-live="polite" className="min-h-8 text-xs leading-4 text-text-primary">{hint}</p>

        {/* One fixed-height row for the selection and passes, so the canvas does not jump. */}
        <div className="flex min-h-11 flex-wrap items-center gap-2 text-sm text-text-primary">
          {editing && selectedMarker && (
            <>
              <span className="font-medium">{selectedMarker.label ?? selectedMarker.id}</span>
              {selectedMove ? (
                <>
                  <label htmlFor="run-pace">Pace</label>
                  <select
                    id="run-pace"
                    value={selectedMove.pace ?? 'jog'}
                    onChange={(e) => edit({ type: 'setPace', marker: selectedMove.marker, pace: e.target.value as Pace })}
                    className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
                  >
                    {PACES.map((pace) => (
                      <option key={pace} value={pace}>{PACE_NAMES[pace]}</option>
                    ))}
                  </select>
                  <Button variant="outline" className="h-11" onClick={() => edit({ type: 'removeMove', marker: selectedMove.marker })}>
                    Delete run
                  </Button>
                </>
              ) : (
                <span className="text-xs">No run yet: use Draw a run.</span>
              )}
              {holdsBall && (
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => ball && edit({ type: 'removeMarker', marker: ball.id })}
                >
                  Remove ball
                </Button>
              )}
            </>
          )}
  
          {editing && passes.length > 0 && (
            <div role="group" aria-label="Passes" className="flex flex-wrap items-center gap-2">
              <span>Passes:</span>
              {passes.map((pass) => {
                const name = (id: string) => script.markers.find((m) => m.id === id)?.label ?? id;
                const run = step?.moves.find((m) => m.marker === pass.to);
                return (
                  <span key={pass.id} className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      className="h-11"
                      aria-label={`Delete pass ${name(pass.from)} to ${name(pass.to)}`}
                      onClick={() => edit({ type: 'removePass', id: pass.id })}
                    >
                      {name(pass.from)} &rarr; {name(pass.to)} <Trash2 />
                    </Button>
                    {run && run.waypoints.length > 1 && (
                      <select
                        aria-label={`Where ${name(pass.to)} catches`}
                        value={pass.at ?? ''}
                        onChange={(e) =>
                          edit({ type: 'setCatch', id: pass.id, at: e.target.value === '' ? null : Number(e.target.value) })
                        }
                        className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
                      >
                        <option value="">Catch at end of run</option>
                        {run.waypoints.slice(0, -1).map((_, i) => (
                          <option key={i} value={i}>Catch at point {i + 1}, run on</option>
                        ))}
                      </select>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative h-[60dvh] min-h-64 md:h-auto md:min-h-0 md:flex-1">
          {step ? (
            <>
              <PracticeCanvas
                step={step}
                time={time}
                overlay={(geometry) => (
                  <>
                    {ghost && <PracticeGhostLayer step={step} time={time} geometry={geometry} />}
                    {editing && (
                      <PracticeEditLayer
                        step={step}
                        geometry={geometry}
                        tool={tool}
                        selection={selection}
                        onSelect={setSelection}
                        onEdit={edit}
                      />
                    )}
                  </>
                )}
              />
              {showCommentary && (step.lever || step.commentary.points.length > 0) && (
                <div
                  aria-live="polite"
                  className="pointer-events-none absolute left-2 top-2 max-w-xs bg-black/70 p-2 text-sm text-white"
                >
                  <p className="font-medium">
                    {step.lever ? `Step ${step.index}: ${LEVER_NAMES[step.lever]} lever` : 'Base Step'}
                  </p>
                  {step.commentary.points.length > 0 && (
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {step.commentary.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-[var(--color-border)] p-4 text-sm text-text-primary">
              This Step can&apos;t be shown until the script is fixed. Undo, or go back to the Base Step.
            </div>
          )}
        </div>
        {step && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label={playing ? 'Pause' : 'Play'}
              onClick={() => (time >= duration ? restart() : setPlaying((p) => !p))}
              disabled={duration === 0}
            >
              {playing ? <Pause /> : <Play />}
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Back to start" onClick={stopPlayback}>
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              aria-label={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
              aria-pressed={showCommentary}
              onClick={() => setShowCommentary((v) => !v)}
            >
              <MessageSquare />
            </Button>
            <span className="font-mono text-xs text-text-primary">
              {time.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
