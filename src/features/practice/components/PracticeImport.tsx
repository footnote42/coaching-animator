'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
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
  Ghost,
  FilePlus,
  Save,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { stepCount } from '@/features/practice/engine';
import { PracticeScriptActions, DevicePracticeOffer } from '@/features/practice/components/GuestPracticeControls';
import { useEditorWorkspace } from '@/features/practice/hooks/useEditorWorkspace';
import { useMediaQuery } from '@/features/practice/hooks/useMediaQuery';
import { EditorSection } from '@/features/practice/components/EditorSection';
import { PracticeDetails, SignInToSave, usePracticeSave } from '@/features/practice/components/PracticeLibrary';
import { useUser } from '@/lib/contexts/UserContext';
import { AreaControl } from '@/features/practice/components/AreaControl';
import { ConeSplitButton } from '@/features/practice/components/ConeSplitButton';
import { AddProgressionButton, LEVER_NAMES, StepDetails } from '@/features/practice/components/StepControls';
import { markerColour } from '@/features/practice/markerColour';
import { TACKLE_BAG_SHADE } from '@/features/practice/tackleBag';
import { type MarkerKind } from '@/features/practice/schema';
import { SelectionPanel } from '@/features/practice/components/SelectionPanel';
import { PassList } from '@/features/practice/components/PassList';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

/** Holds the canvas's place, in its colour, while the Konva code loads: the box is already sized, so nothing shifts. */
const CanvasPlaceholder = () => (
  <div aria-hidden className="absolute inset-0" style={{ backgroundColor: DESIGN_TOKENS.colours.primary }} />
);

const PracticeCanvas = dynamic(() => import('@/features/practice/components/PracticeCanvas'), {
  ssr: false,
  loading: CanvasPlaceholder,
});

// The script box's textarea, buttons and example load when the box is first opened.
const ScriptBox = dynamic(() => import('@/features/practice/components/ScriptBox').then((m) => m.ScriptBox), {
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

/** Toolbar buttons: at least 44 px square for touch. */
const TOOL_BUTTON = 'h-11 min-w-11 px-2';

/**
 * The Practice editor: build the base Step by hand on the canvas, or paste a Practice
 * Script. Both write the same script, which the script box always reflects.
 * A Step strip picks the base or a Progression; Commentary shows over the canvas.
 */
export function PracticeImport() {
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
    passes,
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
    isGuest,
    newPractice,
    saved,
    restart,
    playStep,
  } = workspace;

  const { user, loading } = useUser();
  const signedIn = !loading && !!user;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [previewTool, setPreviewTool] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startLongPress = (id: string) => {
    previewTimer.current = setTimeout(() => setPreviewTool(id), 400);
  };
  const cancelLongPress = () => {
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
  };
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

  const wide = useMediaQuery('(min-width: 1280px)');
  const passMeta =
    passes.length === 0 ? '(none)' : `(${passes.length})${stepWarnings.length > 0 ? ` · ${stepWarnings.length} to check` : ''}`;

  const stepArea = step?.area ?? script.area;
  const stepLever = shownStep > 0 ? script.progressions[shownStep - 1]?.lever : undefined;
  const stepTitle = shownStep === 0 ? 'Base Step' : stepLever ? `Step ${shownStep}: ${LEVER_NAMES[stepLever]}` : `Step ${shownStep}`;
  const forwardIds = new Set(stepWarnings.filter((w) => w.kind === 'forward').map((w) => w.pass));

  return (
    <main className="flex min-h-[calc(100dvh-57px)] flex-col gap-2 overflow-x-hidden p-4 md:h-[calc(100dvh-57px)] md:flex-row md:gap-4">
      {/* On a phone this column's children join the page flow: the header first, then the canvas, then the groups. */}
      <section className="contents md:flex md:w-72 md:min-w-0 md:shrink-0 md:flex-col md:gap-2 md:overflow-y-auto lg:w-80">
        <div className="order-first flex flex-wrap items-center justify-between gap-2 md:order-none">
          <h1 className="text-xl font-heading font-bold text-text-primary">Practice editor</h1>
          <div className="flex gap-2">
            <Button variant="outline" className={TOOL_BUTTON} onClick={newPractice}>
              <FilePlus /> New
            </Button>
            {signedIn && saveButton}
          </div>
        </div>
        {!loading && !user && <SignInToSave />}
        
        <DevicePracticeOffer />

        <EditorSection title="Area" meta={`${stepArea.width} × ${stepArea.length} m`}>
          <AreaControl key={`${shownStep}-${stepArea.template}-${stepArea.width}x${stepArea.length}`} area={stepArea} hideLegend onChange={setArea} direction={script.direction} onDirectionChange={setDirection} />
        </EditorSection>

        {!wide && (
          <EditorSection title="Passing and kicking" meta={passMeta}>
            <PassList workspace={workspace} />
          </EditorSection>
        )}

        <EditorSection title={stepTitle}>
          <StepDetails hideLegend script={script} step={shownStep} onChange={commit} onSelectStep={playStep} />
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

        <EditorSection
          title="Advanced: Practice Script (for AI tools)"
          collapse="always"
          open={scriptOpen}
          onOpenChange={(next) => {
            setScriptOpen(next);
            if (next) setScriptLoaded(true);
          }}
          meta={errors.length > 0 ? '(can’t load)' : problems.length > 0 ? `(${problems.length} to fix)` : undefined}
        >
          <PracticeScriptActions text={scriptText} isGuest={isGuest} />
          <Link href="/practice-script/v1/guide" className="text-sm text-primary underline">How to write a script, or have an AI write it</Link>
          {scriptLoaded && <ScriptBox text={text} setText={setText} scriptText={scriptText} applyText={applyText} />}
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
      </section>

      <section className="order-first flex min-w-0 flex-col gap-2 md:order-none md:min-h-0 md:flex-1">
        <div role="group" aria-label="Steps" className="-mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 xl:justify-center">
          {Array.from({ length: stepCount(script) }, (_, n) => {
            const lever = n > 0 ? script.progressions[n - 1].lever : undefined;
            return (
              <Button
                key={n}
                className="h-11 shrink-0"
                variant={n === shownStep ? 'default' : 'outline'}
                aria-pressed={n === shownStep}
                onClick={() => playStep(n)}
              >
                {n === 0 ? 'Base' : lever ? `${n}. ${LEVER_NAMES[lever]}` : `${n}`}
              </Button>
            );
          })}
          <div className="shrink-0">
            <AddProgressionButton
              script={script}
              onAdd={(next) => commit(next) && playStep(next.progressions.length)}
            />
          </div>
        </div>

        <div role="toolbar" aria-label="Editing tools" className="flex flex-wrap items-center gap-2 lg:gap-x-2 xl:justify-center">
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
                onPointerEnter={() => setPreviewTool(id)}
                onPointerLeave={() => {
                  cancelLongPress();
                  setPreviewTool(null);
                }}
                onPointerDown={() => startLongPress(id)}
                onPointerUp={cancelLongPress}
                onPointerCancel={cancelLongPress}
                onFocus={() => setPreviewTool(id)}
                onBlur={() => setPreviewTool(null)}
              >
                {icon}
              </Button>
            ))}
          </div>
          <span className="hidden h-8 w-px bg-[var(--color-border)] lg:block" aria-hidden />
          {/* On a phone the kit takes its own row under the mode and history tools (phone and small tablet). */}
          <div role="group" aria-label="Place" className="order-2 flex basis-full items-center gap-0.5 sm:gap-1 lg:order-none lg:basis-auto">
            {PALETTE.map(({ kind, name }) => kind === 'cone' ? (
              <ConeSplitButton
                key={kind}
                active={tool === kind}
                colour={coneColour}
                onPlace={() => pickTool(kind)}
                onPickColour={pickConeColour}
                className={TOOL_BUTTON}
                onPreview={(p) => setPreviewTool(p ? 'cone' : null)}
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
                onPointerEnter={() => setPreviewTool(kind)}
                onPointerLeave={() => {
                  cancelLongPress();
                  setPreviewTool(null);
                }}
                onPointerDown={() => startLongPress(kind)}
                onPointerUp={cancelLongPress}
                onPointerCancel={cancelLongPress}
                onFocus={() => setPreviewTool(kind)}
                onBlur={() => setPreviewTool(null)}
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
          <span className="hidden h-8 w-px bg-[var(--color-border)] lg:block" aria-hidden />
          <div role="group" aria-label="History" className="order-1 ml-auto flex items-center gap-1 lg:order-none lg:ml-0">
            <Button
              variant="outline"
              className={TOOL_BUTTON}
              aria-label="Undo"
              title="Undo (Ctrl+Z)"
              onClick={undo}
              disabled={editor.past.length === 0}
              onPointerEnter={() => setPreviewTool('undo')}
              onPointerLeave={() => {
                cancelLongPress();
                setPreviewTool(null);
              }}
              onPointerDown={() => startLongPress('undo')}
              onPointerUp={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onFocus={() => setPreviewTool('undo')}
              onBlur={() => setPreviewTool(null)}
            >
              <Undo2 />
            </Button>
            <Button
              variant="outline"
              className={TOOL_BUTTON}
              aria-label="Redo"
              title="Redo (Ctrl+Shift+Z)"
              onClick={redo}
              disabled={editor.future.length === 0}
              onPointerEnter={() => setPreviewTool('redo')}
              onPointerLeave={() => {
                cancelLongPress();
                setPreviewTool(null);
              }}
              onPointerDown={() => startLongPress('redo')}
              onPointerUp={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onFocus={() => setPreviewTool('redo')}
              onBlur={() => setPreviewTool(null)}
            >
              <Redo2 />
            </Button>
          </div>
        </div>

        {!wide && <SelectionPanel workspace={workspace} preview={previewTool} />}

        {/* On a phone the box takes the Area's shape, so the playback controls sit right under the pitch. */}
        <div
          className="relative max-h-[60dvh] w-full aspect-[var(--area-aspect)] md:aspect-auto md:max-h-none md:min-h-0 md:flex-1"
          style={{ '--area-aspect': `${stepArea.width} / ${stepArea.length}` } as CSSProperties}
        >
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
                    {step.index === 0 ? 'Base Step' : step.lever ? `Step ${step.index}: ${LEVER_NAMES[step.lever]} lever` : `Step ${step.index}`}
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
        <div className="flex items-center gap-2 xl:justify-center">
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
              variant={showCommentary ? 'default' : 'outline'}
              size="icon"
              className="h-11 w-11"
              aria-label={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
              title={showCommentary ? 'Hide Commentary' : 'Show Commentary'}
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

      {/* From xl up, the Selection panel and passing and kicking get their own column beside the canvas. */}
      <aside aria-label="Selection, passing and kicking" className="hidden min-h-0 w-80 shrink-0 flex-col gap-2 overflow-y-auto xl:flex">
        {wide && (
          <>
            <SelectionPanel workspace={workspace} preview={previewTool} side />
            <h2 className="flex min-h-11 items-center text-sm font-medium text-text-primary">
              Passing and kicking&nbsp;<span className="font-sans font-normal normal-case text-text-muted">{passMeta}</span>
            </h2>
            <PassList workspace={workspace} />
          </>
        )}
      </aside>
    </main>
  );
}
