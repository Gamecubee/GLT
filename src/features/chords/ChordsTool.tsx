import { useEffect, useMemo, useReducer } from "react";
import {
  ALL_CHORD_TYPES,
  ALL_CAGED_SHAPES,
  ALL_ROOTS,
  type AccidentalPreference,
  type ChordType,
  type CagedShape,
  type Root,
} from "../../domain/music";
import {
  pickRandomChord,
  type ChordRandomizerSettings,
  type RootMode,
  type CagedMode,
} from "../../domain/randomizer";
import { formatChordPrompt, toChordId, type Chord } from "../../domain/chords";
import { ChordsControls } from "./ChordsControls";
import { ChordsDisplay } from "./ChordsDisplay";
import type { ChordsState, DisplaySettings } from "./types";

type Action =
  | { type: "NEXT" }
  | { type: "REVEAL" }
  | { type: "TOGGLE_AUTO" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SET_INTERVAL_SECONDS"; seconds: number }
  | { type: "SET_REVEAL_SECONDS"; seconds: number }
  | {
      type: "UPDATE_RANDOMIZER_SETTINGS";
      patch: Partial<ChordRandomizerSettings>;
      regenerate?: boolean;
    }
  | { type: "UPDATE_DISPLAY_SETTINGS"; patch: Partial<DisplaySettings> }
  | { type: "SET_EXTRA_ROOTS_TEXT"; text: string }
  | { type: "RESET" };

const DEFAULT_RANDOMIZER_SETTINGS: ChordRandomizerSettings = {
  rootMode: "full",
  cagedMode: "randomShape",
  allowedTypes: ALL_CHORD_TYPES,
  allowedShapes: ALL_CAGED_SHAPES,
  extraRoots: [],
};

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  accidentalPreference: "sharp",
};

function parseExtraRootsText(text: string): Root[] {
  const tokens = text
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const rootSet = new Set<Root>();
  const allowed = new Set<string>(ALL_ROOTS as readonly string[]);
  for (const t of tokens) {
    if (allowed.has(t)) rootSet.add(t as Root);
  }
  return Array.from(rootSet);
}

function isCagedLetterRoot(r: Root): r is CagedShape {
  return r === "C" || r === "A" || r === "G" || r === "E" || r === "D";
}

// Apply the "training rule" at feature layer:
// - if not cagedOnly => no change
// - if cagedOnly + lock => letter roots force matching shape, extras keep random shape
// - if cagedOnly + randomShape => no change
function applyCagedRule(
  chord: Chord,
  settings: ChordRandomizerSettings,
): Chord {
  if (settings.rootMode !== "cagedOnly") return chord;
  if (settings.cagedMode !== "lock") return chord;

  if (isCagedLetterRoot(chord.root)) {
    const forced = chord.root;
    if (chord.shape !== forced) return { ...chord, shape: forced };
  }
  return chord;
}

function makeInitialState(): ChordsState & { extraRootsText: string } {
  const raw = pickRandomChord(DEFAULT_RANDOMIZER_SETTINGS);
  const currentChord = applyCagedRule(raw, DEFAULT_RANDOMIZER_SETTINGS);

  return {
    randomizerSettings: DEFAULT_RANDOMIZER_SETTINGS,
    displaySettings: DEFAULT_DISPLAY_SETTINGS,

    currentChord,
    phase: "prompt",

    auto: false,
    paused: false,
    intervalSeconds: 2,
    revealSeconds: 2,

    extraRootsText: "",
  };
}

type InternalState = ReturnType<typeof makeInitialState>;

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "NEXT": {
      const raw = pickRandomChord(state.randomizerSettings);
      const nextChord = applyCagedRule(raw, state.randomizerSettings);
      return { ...state, currentChord: nextChord, phase: "prompt" };
    }

    case "REVEAL":
      return { ...state, phase: "revealed" };

    case "TOGGLE_AUTO": {
      const nextAuto = !state.auto;
      return {
        ...state,
        auto: nextAuto,
        paused: nextAuto ? false : state.paused,
      };
    }

    case "TOGGLE_PAUSE":
      return { ...state, paused: !state.paused };

    case "SET_INTERVAL_SECONDS": {
      const seconds = Number.isFinite(action.seconds)
        ? action.seconds
        : state.intervalSeconds;
      return { ...state, intervalSeconds: Math.max(0.2, seconds) };
    }

    case "SET_REVEAL_SECONDS": {
      const seconds = Number.isFinite(action.seconds)
        ? action.seconds
        : state.revealSeconds;
      return { ...state, revealSeconds: Math.max(0.2, seconds) };
    }

    case "UPDATE_RANDOMIZER_SETTINGS": {
      const nextSettings = { ...state.randomizerSettings, ...action.patch };
      const regenerate = action.regenerate ?? true;

      if (!regenerate) {
        return { ...state, randomizerSettings: nextSettings };
      }

      const raw = pickRandomChord(nextSettings);
      const nextChord = applyCagedRule(raw, nextSettings);

      return {
        ...state,
        randomizerSettings: nextSettings,
        currentChord: nextChord,
        phase: "prompt",
      };
    }

    case "UPDATE_DISPLAY_SETTINGS": {
      const nextDisplay = { ...state.displaySettings, ...action.patch };
      return { ...state, displaySettings: nextDisplay };
    }

    case "SET_EXTRA_ROOTS_TEXT":
      return { ...state, extraRootsText: action.text };

    case "RESET":
      return makeInitialState();

    default:
      return state;
  }
}

export function ChordsTool() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  // Auto-advance: prompt duration vs reveal duration
  useEffect(() => {
    if (!state.auto) return;
    if (state.paused) return;

    const delaySeconds =
      state.phase === "prompt" ? state.intervalSeconds : state.revealSeconds;
    const delayMs = Math.round(delaySeconds * 1000);

    const t = window.setTimeout(() => {
      dispatch({ type: state.phase === "prompt" ? "REVEAL" : "NEXT" });
    }, delayMs);

    return () => window.clearTimeout(t);
  }, [
    state.auto,
    state.paused,
    state.phase,
    state.intervalSeconds,
    state.revealSeconds,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;

      const el = document.activeElement;
      const isTypingTarget =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable);

      if (isTypingTarget) return;

      e.preventDefault();

      if (state.phase === "prompt") {
        dispatch({ type: "REVEAL" });
      } else {
        dispatch({ type: "NEXT" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.phase]);

  // --- Settings handlers ---

  const setRootMode = (mode: RootMode) => {
    // UX: when switching into CAGED, default to randomShape
    const patch: Partial<ChordRandomizerSettings> =
      mode === "cagedOnly"
        ? { rootMode: "cagedOnly", cagedMode: "randomShape" }
        : { rootMode: "full" };

    dispatch({
      type: "UPDATE_RANDOMIZER_SETTINGS",
      patch,
      regenerate: true,
    });
  };

  const setCagedMode = (mode: CagedMode) => {
    dispatch({
      type: "UPDATE_RANDOMIZER_SETTINGS",
      patch: { cagedMode: mode },
      regenerate: true,
    });
  };

  const toggleChordType = (t: ChordType) => {
    const cur = state.randomizerSettings.allowedTypes;
    const has = cur.includes(t);
    if (has && cur.length === 1) return; // prevent empty
    const next = has ? cur.filter((x) => x !== t) : [...cur, t];

    dispatch({
      type: "UPDATE_RANDOMIZER_SETTINGS",
      patch: { allowedTypes: next },
      regenerate: true,
    });
  };

  const toggleCagedShape = (s: CagedShape) => {
    const cur = state.randomizerSettings.allowedShapes;
    const has = cur.includes(s);
    if (has && cur.length === 1) return; // prevent empty
    const next = has ? cur.filter((x) => x !== s) : [...cur, s];

    dispatch({
      type: "UPDATE_RANDOMIZER_SETTINGS",
      patch: { allowedShapes: next },
      regenerate: true,
    });
  };

  const onExtraRootsTextChange = (text: string) => {
    dispatch({ type: "SET_EXTRA_ROOTS_TEXT", text });

    const parsed = parseExtraRootsText(text);
    dispatch({
      type: "UPDATE_RANDOMIZER_SETTINGS",
      patch: { extraRoots: parsed },
      regenerate: false, // don't reroll chord while typing
    });
  };

  const onAccidentalChange = (v: AccidentalPreference) => {
    dispatch({
      type: "UPDATE_DISPLAY_SETTINGS",
      patch: { accidentalPreference: v },
    });
  };

  const promptText = useMemo(() => {
    return formatChordPrompt(
      state.currentChord,
      state.displaySettings.accidentalPreference,
    );
  }, [state.currentChord, state.displaySettings.accidentalPreference]);

  const chordId = useMemo(
    () => toChordId(state.currentChord),
    [state.currentChord],
  );

  const isRevealed = state.phase === "revealed";

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <ChordsDisplay
        chord={state.currentChord}
        promptText={promptText}
        chordId={chordId}
        phase={state.phase}
        auto={state.auto}
        paused={state.paused}
        intervalSeconds={state.intervalSeconds}
        revealSeconds={state.revealSeconds}
      />

      <ChordsControls
        auto={state.auto}
        paused={state.paused}
        intervalSeconds={state.intervalSeconds}
        revealSeconds={state.revealSeconds}
        isRevealed={isRevealed}
        accidentalPreference={state.displaySettings.accidentalPreference}
        rootMode={state.randomizerSettings.rootMode}
        cagedMode={state.randomizerSettings.cagedMode}
        selectedChordTypes={state.randomizerSettings.allowedTypes}
        allChordTypes={ALL_CHORD_TYPES}
        selectedCagedShapes={state.randomizerSettings.allowedShapes}
        allCagedShapes={ALL_CAGED_SHAPES}
        extraRootsText={state.extraRootsText}
        onToggleAuto={() => dispatch({ type: "TOGGLE_AUTO" })}
        onTogglePause={() => dispatch({ type: "TOGGLE_PAUSE" })}
        onIntervalChange={(v) =>
          dispatch({ type: "SET_INTERVAL_SECONDS", seconds: Number(v) })
        }
        onRevealSecondsChange={(v) =>
          dispatch({ type: "SET_REVEAL_SECONDS", seconds: Number(v) })
        }
        onAccidentalChange={onAccidentalChange}
        onSetRootMode={setRootMode}
        onSetCagedMode={setCagedMode}
        onToggleChordType={toggleChordType}
        onToggleCagedShape={toggleCagedShape}
        onExtraRootsTextChange={onExtraRootsTextChange}
        onReveal={() => dispatch({ type: "REVEAL" })}
        onNext={() => dispatch({ type: "NEXT" })}
        onReset={() => dispatch({ type: "RESET" })}
      />
    </div>
  );
}
