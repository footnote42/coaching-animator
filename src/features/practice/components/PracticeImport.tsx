'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { stepCount } from '@/features/practice/engine';
import { PracticeScriptActions, DevicePracticeOffer } from '@/features/practice/components/GuestPracticeControls';
import { useEditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { PracticeLibrary } from '@/features/practice/components/PracticeLibrary';
import { AreaControl } from '@/features/practice/components/AreaControl';
import { AddProgressionButton, LEVER_NAMES, StepDetails } from '@/features/practice/components/StepControls';
import { CONE_OUTLINE, markerColour } from '@/features/practice/markerColour';
import { BALL_CARRIER_KINDS, CONE_COLOURS, LYING_KINDS, MAX_BALLS, PACES, type MarkerKind, type Pace } from '@/features/practice/schema';
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
  pass: 'Tap the player with the ball, then the player receiving. If the receiver has a Run, tap it to catch on the run.',
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
  const workspace = useEditorWorkspace();

  const [labelDraft, setLabelDraft] = useState<string | null>(null);
  useEffect(() => {
    setLabelDraft(null);
  }, [workspace.selectedMarker?.id]);

  const {
    editor,
    script,
    scriptText,
    text,
    setText,
    errors,
    practiceId,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    sourceUrl,
    setSourceUrl,
    sourceTitle,
    setSourceTitle,
    tool,
    selection,
    setSelection,
    ghost,
    setGhost,
    showCommentary,
    setShowCommentary,
    time,
    playing,
    setPlaying,
    shownStep,
    step,
    duration,
    problems,
    setDirection,
    stepWarnings,
    selectedMarker,
    selectedMove,
    passes,
    balls,
    activeBall,
    setPassBall,
    carriedBall,
    passKind,
    startPass,
    editing,
    stopPlayback,
    commit,
    edit,
    pickTool,
    catchPass,
    startCatch,
    endCatch,
    deleteSelection,
    undo,
    redo,
    applyText,
    setArea,
    libraryKey,
    setLibraryKey,
    isGuest,
    newPractice,
    saved,
    restart,
    playStep,
  } = workspace;

  const placeKind = PALETTE.find((p) => p.kind === tool);
  const toolHint =
    tool === 'pass' && passKind === 'kick' ? 'Tap the player to kick to.' : TOOL_HINTS[placeKind ? 'place' : (tool as 'select' | 'run' | 'pass')];
  const hint = shownStep > 0 ? `${toolHint} Edits here change Step ${shownStep} and the Steps after it.` : toolHint;
  const heldBall = selectedMarker && balls.find((b) => b.holder === selectedMarker.id);
  const canGiveBall =
    selectedMarker &&
    !heldBall &&
    balls.length > 0 &&
    balls.length < MAX_BALLS &&
    (BALL_CARRIER_KINDS as readonly string[]).includes(selectedMarker.kind);
  const ballName = (id: string) => `Ball ${balls.findIndex((b) => b.id === id) + 1}`;
  const ballSelect = 'h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm';
  const stepArea = step?.area ?? script.area;
  const forwardIds = new Set(stepWarnings.filter((w) => w.kind === 'forward').map((w) => w.pass));

  return (
    <main className="flex min-h-[calc(100dvh-57px)] flex-col gap-4 overflow-x-hidden p-4 md:h-[calc(100dvh-57px)] md:flex-row">
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
          tags={tags}
          onTagsChange={setTags}
          sourceUrl={sourceUrl}
          sourceTitle={sourceTitle}
          onSourceUrlChange={setSourceUrl}
          onSourceTitleChange={setSourceTitle}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSaved={saved}
          onOpen={(id) => router.push(`/practice?id=${id}`)}
          hideListOnMobile
        />
        <div>
          <AreaControl key={`${shownStep}-${stepArea.template}-${stepArea.width}x${stepArea.length}`} area={stepArea} onChange={setArea} direction={script.direction} onDirectionChange={setDirection} />
        </div>

        <StepDetails script={script} step={shownStep} onChange={commit} onSelectStep={playStep} />
        <div className="flex flex-col gap-3">
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
        </div>
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
          <div>
            <AddProgressionButton
              script={script}
              onAdd={(next) => commit(next) && playStep(next.progressions.length)}
            />
          </div>
        </div>

        <div role="toolbar" aria-label="Editing tools" className="flex flex-wrap items-center gap-1">
          <div className="flex flex-wrap items-center gap-1">
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
            <span className="mx-1 hidden h-8 w-px bg-[var(--color-border)] sm:block" aria-hidden />
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
            <span className="mx-1 hidden h-8 w-px bg-[var(--color-border)] sm:block" aria-hidden />
          </div>
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
              <label htmlFor="marker-label" className="sr-only">Label</label>
              <input
                id="marker-label"
                type="text"
                placeholder={selectedMarker.id}
                value={labelDraft ?? selectedMarker.label ?? ''}
                onChange={(e) => setLabelDraft(e.target.value)}
                onBlur={() => {
                  if (labelDraft !== null && labelDraft !== (selectedMarker.label ?? '')) {
                    edit({ type: 'setLabel', marker: selectedMarker.id, label: labelDraft });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                }}
                maxLength={4}
                className="h-11 w-16 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-center text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              {selectedMarker.kind === 'cone' && (
                <div role="group" aria-label="Cone colour" className="flex items-center gap-1">
                  {CONE_COLOURS.map((colour) => {
                    const current = (selectedMarker.colour ?? 'yellow') === colour;
                    const name = `${colour[0].toUpperCase()}${colour.slice(1)} cone`;
                    return (
                      <button
                        key={colour}
                        type="button"
                        aria-label={name}
                        title={name}
                        aria-pressed={current}
                        onClick={() => edit({ type: 'setColour', marker: selectedMarker.id, colour })}
                        className={cn('h-11 w-11 flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring', current && 'bg-[var(--color-surface)]')}
                      >
                        <span
                          className={cn('inline-block h-6 w-6 rounded-full border-2', current && 'ring-2 ring-offset-1 ring-black')}
                          style={{ backgroundColor: markerColour({ kind: 'cone', colour }), borderColor: CONE_OUTLINE }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
              {(LYING_KINDS as readonly string[]).includes(selectedMarker.kind) && (
                <Button
                  type="button"
                  variant={selectedMarker.lying ? 'default' : 'outline'}
                  className="h-11"
                  aria-pressed={!!selectedMarker.lying}
                  title="Lay flat on the ground for this Step"
                  onClick={() => edit({ type: 'setLying', marker: selectedMarker.id, lying: !selectedMarker.lying })}
                >
                  Lying
                </Button>
              )}
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
              {heldBall && (
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => edit({ type: 'removeMarker', marker: heldBall.id })}
                >
                  Remove ball
                </Button>
              )}
              {canGiveBall && (
                <Button variant="outline" className="h-11" onClick={() => edit({ type: 'addBall', holder: selectedMarker.id })}>
                  Give a ball
                </Button>
              )}
              {carriedBall && (
                <div role="group" aria-label="Ball carrier" className="flex items-center gap-1">
                  {(['pass', 'kick'] as const).map((kind) => {
                    const on = tool === 'pass' && passKind === kind;
                    return (
                      <Button
                        key={kind}
                        variant={on ? 'default' : 'outline'}
                        className="h-11"
                        aria-pressed={on}
                        onClick={() => startPass(kind, carriedBall)}
                      >
                        {kind === 'pass' ? 'Pass' : 'Kick'}
                      </Button>
                    );
                  })}
                </div>
              )}
            </>
          )}
  
          {editing && catchPass && (
            <>
              <span>Tap the Run where it is caught.</span>
              <Button type="button" variant="outline" className={TOOL_BUTTON} onClick={endCatch}>
                End of run
              </Button>
            </>
          )}

          {editing && tool === 'pass' && balls.length > 1 && (
            <>
              <label htmlFor="pass-ball">Ball for new passes</label>
              <select id="pass-ball" value={activeBall} onChange={(e) => setPassBall(e.target.value)} className={ballSelect}>
                {balls.map((b) => (
                  <option key={b.id} value={b.id}>{ballName(b.id)}</option>
                ))}
              </select>
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
                    {balls.length > 1 && (
                      <select
                        aria-label={`Ball for pass ${name(pass.from)} to ${name(pass.to)}`}
                        value={pass.ball ?? balls[0].id}
                        onChange={(e) => edit({ type: 'setPassBall', id: pass.id, ball: e.target.value })}
                        className={ballSelect}
                      >
                        {balls.map((b) => (
                          <option key={b.id} value={b.id}>{ballName(b.id)}</option>
                        ))}
                      </select>
                    )}
                    <label className="flex h-11 items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={pass.kick ?? false}
                        onChange={(e) => edit({ type: 'setKick', id: pass.id, kick: e.target.checked })}
                      />
                      Kick
                      <span className="sr-only"> {name(pass.from)} to {name(pass.to)}</span>
                    </label>
                    <select
                      aria-label={`Pass ${name(pass.from)} to ${name(pass.to)} when this player arrives`}
                      value={pass.after?.move ?? ''}
                      onChange={(e) => edit({ type: 'setPassWait', id: pass.id, move: e.target.value === '' ? null : e.target.value })}
                      className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
                    >
                      <option value="">Pass when no one arrives</option>
                      {step?.moves.map((m) => (
                        <option key={m.marker} value={m.marker}>Pass when {name(m.marker)} arrives</option>
                      ))}
                    </select>
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
          {editing && stepWarnings.length > 0 && (
            <ul role="status" className="border-l-4 border-[var(--color-accent-warm)] pl-2 text-sm text-text-primary">
              {stepWarnings.map((w) => (
                <li key={`${w.kind}-${w.pass}`} className="flex flex-wrap items-center gap-2">
                  {w.message}
                  {w.fix && (
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => edit({ type: 'startAfterPass', marker: w.fix!.marker, pass: w.fix!.afterPass })}
                    >
                      Start the run after the pass
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative h-[60dvh] min-h-64 md:h-auto md:min-h-0 md:flex-1">
          {step ? (
            <>
              <PracticeCanvas
                step={step}
                time={time}
                forwardPasses={forwardIds}
                overlay={(geometry) => (
                  <>
                    {ghost && <PracticeGhostLayer step={step} time={time} geometry={geometry} />}
                    {editing && (
                      <PracticeEditLayer
                        step={step}
                        geometry={geometry}
                        tool={tool}
                        selection={selection}
                        ball={balls.length > 1 ? activeBall : undefined}
                        kick={tool === 'pass' && passKind === 'kick'}
                        catchPass={catchPass}
                        onPassAdded={startCatch}
                        onCatchDone={endCatch}
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
    </main>
  );
}
