import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  validate,
  warnings,
  resolveStep,
  positionsAt,
  formatError,
  stepCount,
  looseBalls as looseBallsOf,
  type LooseBall,
} from '@/features/practice/engine';
import {
  applyDirection,
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
import { useGuestPractice } from '@/features/practice/hooks/useGuestPractice';
import { areaTemplate, defaultDirection } from '@/features/practice/area';
import { type Area, type ConeColour, type Direction, type PracticeScript } from '@/features/practice/schema';

const COMMENTARY_STORAGE_KEY = 'ca_share_show_commentary';

export function useEditorWorkspace() {
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
  const [tags, setTags] = useState<string[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [tool, setTool] = useState<EditorTool>('select');
  const [rawSelection, setSelection] = useState<EditorSelection>(NO_SELECTION);
  /** Colour the next placed cone gets: the last one the Coach picked. */
  const [coneColour, setConeColour] = useState<ConeColour>('yellow');
  const [passBall, setPassBall] = useState<string | null>(null);
  /** Whether the next tap on a receiver with the pass tool adds a Pass or a Kick. */
  const [passKind, setPassKind] = useState<'pass' | 'kick'>('pass');
  /** A pass was just added to a receiver with a Run: the next tap on that Run picks the catch point. */
  const [pendingCatch, setPendingCatch] = useState<{ count: number; to: string } | null>(null);
  /** The pass whose Release point the Coach is picking: the next tap on the passer's Run sets it. */
  const [pendingRelease, setPendingRelease] = useState<string | null>(null);
  /** The loose ball the Coach is picking a collector for: the next tap on a player sends them to it. */
  const [pendingCollect, setPendingCollect] = useState<string | null>(null);
  const [ghost, setGhost] = useState(false);
  // Starts shown to match the server render; the saved choice, or collapsed on phones, applies after hydration.
  const [showCommentary, setShowCommentaryState] = useState(true);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(COMMENTARY_STORAGE_KEY);
      if (saved !== null) setShowCommentaryState(saved === 'true');
      else setShowCommentaryState(!((typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767px)').matches) || window.innerWidth < 768));
    } catch {
      // sessionStorage blocked: keep it shown
    }
  }, []);

  const setShowCommentary = (next: boolean | ((prev: boolean) => boolean)) => {
    setShowCommentaryState((prev) => {
      const val = typeof next === 'function' ? next(prev) : next;
      try {
        window.sessionStorage.setItem(COMMENTARY_STORAGE_KEY, String(val));
      } catch {
        // sessionStorage failure fallback
      }
      return val;
    });
  };
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

  /** Warnings for the shown Step: forward passes and early receivers. Never blocks saving. */
  const stepWarnings = useMemo(() => {
    try {
      return warnings(script).filter((w) => w.step === shownStep);
    } catch {
      return [];
    }
  }, [script, shownStep]);

  const selection: EditorSelection =
    rawSelection.marker && step?.markers.some((m) => m.id === rawSelection.marker) ? rawSelection : NO_SELECTION;
  const selectedMarker = step?.markers.find((m) => m.id === selection.marker);
  const selectedMove = step?.moves.find((m) => m.marker === selection.marker);
  const passes = step?.passes ?? [];
  const balls = step?.markers.filter((m) => m.kind === 'ball') ?? [];
  /** The ball a new pass moves: the Coach's pick if it is still there, else the first. */
  const activeBall = balls.find((b) => b.id === passBall)?.id ?? balls[0]?.id;
  /** Each ball's last time lying loose in this Step: the cell it lies on, and the pass that Collects it, if any. */
  const looseBalls = useMemo((): LooseBall[] => {
    if (!step) return [];
    try {
      const all = looseBallsOf(step);
      return all.filter((l, i) => !all.slice(i + 1).some((later) => later.ball === l.ball));
    } catch {
      return [];
    }
  }, [step]);
  /**
   * The ball the selected marker holds once this Step's passes are made: they
   * are its carrier. A player whose Run ends on a loose ball Collects it, so they carry it too.
   */
  const carriedBall = selectedMarker
    ? balls.find((b) => {
        const mine = passes.filter((p) => (p.ball ?? balls[0].id) === b.id);
        if ((mine.length > 0 ? mine[mine.length - 1].to : b.holder) === selectedMarker.id) return true;
        const loose = looseBalls.find((l) => l.ball === b.id && l.collect === undefined);
        const end = selectedMove?.waypoints[selectedMove.waypoints.length - 1];
        return loose !== undefined && end !== undefined && end.x === loose.cell.x && end.y === loose.cell.y;
      })?.id
    : undefined;
  const lastPass = passes[passes.length - 1];
  /** The pass whose catch point the Coach is picking, while the pass tool is on and its receiver has a Run. */
  const catchPass =
    tool === 'pass' &&
    pendingCatch &&
    lastPass &&
    passes.length === pendingCatch.count &&
    lastPass.to === pendingCatch.to &&
    step?.moves.some((m) => m.marker === lastPass.to)
      ? lastPass.id
      : undefined;
  const editing = step !== null && !playing && time === 0;
  /** The pass whose Release point the Coach is picking, while its passer has a Run. */
  const releasePassing = pendingRelease ? passes.find((p) => p.id === pendingRelease) : undefined;
  const releasePass =
    editing && releasePassing && step?.moves.some((m) => m.marker === releasePassing.from) ? releasePassing.id : undefined;
  /** The loose ball the Coach is picking a collector for: the next tap on a player sends them to it. */
  const collectBall = editing && pendingCollect && looseBalls.some((l) => l.ball === pendingCollect) ? pendingCollect : undefined;

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
  const edit = (change: Edit): boolean => {
    if (change.type === 'setColour') setConeColour(change.colour);
    const withColour = change.type === 'addMarker' && change.kind === 'cone' ? { ...change, colour: coneColour } : change;
    return commit(applyStepEdit(script, shownStep, withColour));
  };

  // A Kick is for one tap: picking someone else goes back to passing.
  useEffect(() => setPassKind('pass'), [rawSelection.marker]);

  const pickTool = (next: EditorTool) => {
    setTool(next);
    setPendingRelease(null);
    setPendingCollect(null);
    setPassKind('pass');
    stopPlayback();
    if (next !== 'select' && next !== 'run' && next !== 'pass') setSelection(NO_SELECTION);
  };

  /** The carrier's Pass or Kick action: the next tap on a player receives the ball. */
  const startPass = (kind: 'pass' | 'kick', ball: string) => {
    setTool('pass');
    setPassKind(kind);
    setPassBall(ball);
    stopPlayback();
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
  const setArea = (area: Area) => {
    const result = applyStepArea(script, shownStep, area);
    // Picking a different template for the base Step also resets the Direction of attack.
    const newTemplate = shownStep === 0 && typeof result !== 'string' && areaTemplate(result.area) !== areaTemplate(script.area);
    return commit(newTemplate ? applyDirection(result as PracticeScript, defaultDirection(area)) : result);
  };

  /** Set the Direction of attack as one undoable edit. */
  const setDirection = (direction: Direction) => commit(applyDirection(script, direction));
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
      setTags(practice.tags ?? []);
      setSourceUrl(practice.source_url ?? '');
      setSourceTitle(practice.source_title ?? '');
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
    setTags([]);
    setSourceUrl('');
    setSourceTitle('');
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

  return {
    editor,
    dispatch,
    script,
    scriptText,
    text,
    setText,
    errors,
    stepIndex,
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
    startCatch: (to: string) => setPendingCatch({ count: passes.length + 1, to }),
    endCatch: () => setPendingCatch(null),
    releasePass,
    startRelease: (id: string) => {
      setPendingCatch(null);
      setPendingCollect(null);
      setPendingRelease(id);
    },
    endRelease: () => setPendingRelease(null),
    looseBalls,
    collectBall,
    /** Collect: the next tap on a player sends them to loose ball `ball`. */
    startCollect: (ball: string) => {
      setTool('select');
      setPendingCatch(null);
      setPendingRelease(null);
      setPendingCollect(ball);
      stopPlayback();
    },
    endCollect: () => setPendingCollect(null),
    coneColour,
    pickConeColour: (colour: ConeColour) => {
      setConeColour(colour);
      pickTool('cone');
    },
    deleteSelection,
    undo,
    redo,
    openScript,
    applyText,
    setArea,
    setDirection,
    stepWarnings,
    libraryKey,
    setLibraryKey,
    isGuest,
    newPractice,
    saved,
    restart,
    playStep,
  };
}

export type EditorWorkspace = ReturnType<typeof useEditorWorkspace>;
