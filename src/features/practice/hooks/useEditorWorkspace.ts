import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
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
import { useGuestPractice } from '@/features/practice/hooks/useGuestPractice';
import { type Area, type PracticeScript } from '@/features/practice/schema';

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
    editing,
    stopPlayback,
    commit,
    edit,
    pickTool,
    deleteSelection,
    undo,
    redo,
    openScript,
    applyText,
    setArea,
    libraryKey,
    setLibraryKey,
    isGuest,
    newPractice,
    saved,
    restart,
    playStep,
  };
}
