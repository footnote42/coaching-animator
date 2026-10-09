'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
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
  Ghost,
  FilePlus,
  Save,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { stepCount } from '@/features/practice/engine';
import { PracticeScriptActions, DevicePracticeOffer } from '@/features/practice/components/GuestPracticeControls';
import { useEditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { EditorSection } from '@/features/practice/components/EditorSection';
import { MyPractices, PracticeDetails, SignInToSave, usePracticeSave } from '@/features/practice/components/PracticeLibrary';
import { useUser } from '@/lib/contexts/UserContext';
import { AreaControl } from '@/features/practice/components/AreaControl';
import { ConeSplitButton } from '@/features/practice/components/ConeSplitButton';
import { AddProgressionButton, LEVER_NAMES, StepDetails } from '@/features/practice/components/StepControls';
import { markerColour } from '@/features/practice/markerColour';
import { TACKLE_BAG_SHADE } from '@/features/practice/tackleBag';
import { type MarkerKind } from '@/features/practice/schema';
import { SelectionControls } from '@/features/practice/components/SelectionControls';
import { PassList } from '@/features/practice/components/PassList';
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
  { kind: 'tackle-bag', name: 'Tackle bag' },
  { kind: 'coach', name: 'Coach' },
];

const TOOL_HINTS: Record<'select' | 'run' | 'pass' | 'place', string> = {
  select: 'Drag a marker to move it. Tap one to select it.',
  run: 'Tap a player, then tap cells to draw their run. Drag a waypoint to move it, or tap it to set the Pace into it.',
  pass: 'Tap the player with the ball, then the player receiving. If the receiver has a Run, tap it to catch on the run.',
  place: 'Tap the Area to place it. Tap on a player to give them the ball, or on the ground to leave it loose.',
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
    balls,
    activeBall,
    passKind,
    editing,
    stopPlayback,
    commit,
    edit,
    pickTool,
    coneColour,
    pickConeColour,
    catchPass,
    startCatch,
    endCatch,
    releasePass,
    endRelease,
    looseBalls,
    collectBall,
    endCollect,
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

  const { user, loading } = useUser();
  const signedIn = !loading && !!user;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saver = usePracticeSave({ scriptText, practiceId, title, description, tags, sourceUrl, sourceTitle, onSaved: saved });
  /** Save, or open the details first when the Practice has no title yet. */
  const onSave = () => {
    if (!title.trim()) {
      setDetailsOpen(true);
      toast.info('Give the Practice a title, then save.');
      requestAnimationFrame(() => {
        titleRef.current?.scrollIntoView({ block: 'center' });
        titleRef.current?.focus();
      });
      return;
    }
    void saver.save();
  };
  const saveButton = (
    <Button className={TOOL_BUTTON} onClick={onSave} disabled={saver.saving || !scriptText.trim()}>
      <Save /> {practiceId ? 'Save changes' : 'Save'}
    </Button>
  );

  const placeKind = PALETTE.find((p) => p.kind === tool);
  const toolHint =
    tool === 'pass' && passKind === 'kick' ? 'Tap the player to kick to, or the ground to kick to space.' : TOOL_HINTS[placeKind ? 'place' : (tool as 'select' | 'run' | 'pass')];
  const hint = shownStep > 0 ? `${toolHint} Edits here change Step ${shownStep} and the Steps after it.` : toolHint;
  const stepArea = step?.area ?? script.area;
  const stepLever = shownStep > 0 ? script.progressions[shownStep - 1]?.lever : undefined;
  const stepTitle = stepLever ? `Step ${shownStep}: ${LEVER_NAMES[stepLever]}` : 'Base Step';
  const forwardIds = new Set(stepWarnings.filter((w) => w.kind === 'forward').map((w) => w.pass));

  return (
    <main className="flex min-h-[calc(100dvh-57px)] flex-col gap-4 overflow-x-hidden p-4 md:h-[calc(100dvh-57px)] md:flex-row">
      <section className="flex min-w-0 flex-col gap-2 md:w-80 md:shrink-0 md:overflow-y-auto lg:w-96">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-heading font-bold text-text-primary">Practice editor</h1>
          <div className="flex gap-2">
            <Button variant="outline" className={TOOL_BUTTON} onClick={newPractice}>
              <FilePlus /> New
            </Button>
            {signedIn && saveButton}
          </div>
        </div>
        {!loading && !user && <SignInToSave />}
        
        <DevicePracticeOffer onSaved={() => setLibraryKey((k) => k + 1)} />

        <EditorSection title="Area" meta={`${stepArea.width} × ${stepArea.length} m`} showTitle={false}>
          <AreaControl key={`${shownStep}-${stepArea.template}-${stepArea.width}x${stepArea.length}`} area={stepArea} onChange={setArea} direction={script.direction} onDirectionChange={setDirection} />
        </EditorSection>

        <EditorSection title={stepTitle} meta="coaching points" showTitle={false}>
          <StepDetails script={script} step={shownStep} onChange={commit} onSelectStep={playStep} />
        </EditorSection>

        <EditorSection
          title="Script and AI"
          meta={errors.length > 0 ? '(can’t load)' : problems.length > 0 ? `(${problems.length} to fix)` : undefined}
        >
          <PracticeScriptActions text={scriptText} isGuest={isGuest} />
          <Link href="/practice-script/v1/guide" className="text-sm text-primary underline">How to write a script, or have an AI write it</Link>
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
        </EditorSection>

        {signedIn && (
          <EditorSection
            title="Details and save"
            meta={title.trim() ? `· ${title.trim()}` : '· untitled'}
            collapse="always"
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
          >
            <PracticeDetails
              practiceId={practiceId}
              title={title}
              description={description}
              tags={tags}
              sourceUrl={sourceUrl}
              sourceTitle={sourceTitle}
              visibility={saver.visibility}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onTagsChange={setTags}
              onSourceUrlChange={setSourceUrl}
              onSourceTitleChange={setSourceTitle}
              onVisibilityChange={saver.setVisibility}
              titleRef={titleRef}
            />
            {saveButton}
          </EditorSection>
        )}
        {signedIn && <MyPractices refreshKey={saver.refreshKey + libraryKey} onOpen={(id) => router.push(`/practice?id=${id}`)} />}
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

        <div role="toolbar" aria-label="Editing tools" className="flex flex-wrap items-center gap-2 md:gap-x-3">
          <div role="group" aria-label="Mode" className="flex shrink-0 items-center gap-1">
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
          </div>
          <span className="hidden h-8 w-px bg-[var(--color-border)] md:block" aria-hidden />
          {/* On a phone the kit takes its own row under the mode and history tools. */}
          <div role="group" aria-label="Place" className="order-2 flex basis-full items-center gap-0.5 sm:gap-1 md:order-none md:basis-auto">
            {PALETTE.map(({ kind, name }) => kind === 'cone' ? (
              <ConeSplitButton
                key={kind}
                active={tool === kind}
                colour={coneColour}
                onPlace={() => pickTool(kind)}
                onPickColour={pickConeColour}
                className={TOOL_BUTTON}
              />
            ) : (
              <Button
                key={kind}
                variant={tool === kind ? 'default' : 'outline'}
                className={cn(TOOL_BUTTON, 'shrink-0')}
                aria-label={`Place ${name.toLowerCase()}`}
                aria-pressed={tool === kind}
                title={`Place ${name.toLowerCase()}`}
                onClick={() => pickTool(kind)}
              >
                <span
                  aria-hidden
                  className={cn(
                    'inline-block h-4 w-4 border border-black/40',
                    kind === 'tackle-shield' ? 'w-2.5' : kind === 'tackle-bag' ? 'h-5 w-2.5 rounded-full' : 'rounded-full',
                  )}
                  style={{
                    backgroundColor: markerColour({ kind }),
                    // A shaded side suggests the bag's cylinder, as on the Area.
                    backgroundImage: kind === 'tackle-bag' ? `linear-gradient(to right, transparent 65%, ${TACKLE_BAG_SHADE} 65%)` : undefined,
                  }}
                />
                <span className="hidden 2xl:inline">{name}</span>
              </Button>
            ))}
          </div>
          <span className="hidden h-8 w-px bg-[var(--color-border)] md:block" aria-hidden />
          <div role="group" aria-label="History" className="order-1 ml-auto flex items-center gap-1 md:order-none md:ml-0">
            <Button variant="outline" className={TOOL_BUTTON} aria-label="Undo" title="Undo (Ctrl+Z)" onClick={undo} disabled={editor.past.length === 0}>
              <Undo2 />
            </Button>
            <Button variant="outline" className={TOOL_BUTTON} aria-label="Redo" title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={editor.future.length === 0}>
              <Redo2 />
            </Button>
          </div>
        </div>

        <p aria-live="polite" className="min-h-8 text-xs leading-4 text-text-primary">{hint}</p>

        {/* One fixed-height row for the selection and passes, so the canvas does not jump. */}
        <div className="flex min-h-11 flex-wrap items-center gap-2 text-sm text-text-primary">
          <SelectionControls workspace={workspace} />
          <PassList workspace={workspace} />
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
                        releasePass={releasePass}
                        onReleaseDone={endRelease}
                        collectBall={collectBall}
                        looseCells={looseBalls.filter((l) => l.ball === collectBall).map((l) => l.cell)}
                        onCollectDone={endCollect}
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
        <div className="flex items-center gap-2">
          {step && (
          <>
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
            <span className="font-mono text-xs text-text-primary">
              {time.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </>
          )}
        </div>
      </section>
    </main>
  );
}
