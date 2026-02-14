import { useEffect, useMemo, useReducer } from "react";
import {
  ALL_CHORD_TYPES,
  ALL_CAGED_SHAPES,
  type AccidentalPreference,
} from "../../domain/music";
import {
  pickRandomChord,
  type ChordRandomizerSettings,
} from "../../domain/randomizer";
import { formatChordPrompt, toChordId, type Chord } from "../../domain/chords";
import { ChordsControls } from "./ChordsControls";
import { ChordsDisplay } from "./ChordsDisplay";
import type { ChordsState, DisplaySettings, Phase } from "./types";

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
    }
  | { type: "UPDATE_DISPLAY_SETTINGS"; patch: Partial<DisplaySettings> }
  | { type: "RESET" };

const DEFAULT_RANDOMIZER_SETTINGS: ChordRandomizerSettings = {
  rootMode: "full",
  allowedTypes: ALL_CHORD_TYPES,
  allowedShapes: ALL_CAGED_SHAPES,
  extraRoots: [],
};

const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  accidentalPreference: "sharp",
};

function makeInitialState(): ChordsState {
  return {
    randomizerSettings: DEFAULT_RANDOMIZER_SETTINGS,
    displaySettings: DEFAULT_DISPLAY_SETTINGS,
    currentChord: pickRandomChord(DEFAULT_RANDOMIZER_SETTINGS),
    phase: "prompt",
    auto: false,
    paused: false,
    intervalSeconds: 2,
    revealSeconds: 1,
  };
}

function reducer(state: ChordsState, action: Action): ChordsState {
  switch (action.type) {
    case "NEXT": {
      const nextChord: Chord = pickRandomChord(state.randomizerSettings);
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
      const nextChord = pickRandomChord(nextSettings);
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

    case "RESET":
      return makeInitialState();

    default:
      return state;
  }
}
function isAccidentalPreference(v: string): v is AccidentalPreference {
  return v === "sharp" || v === "flat" || v === "both";
}

export function ChordsTool() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

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

  // auto: prompt -> reveal -> next (loop)
  // auto: prompt -> reveal -> next (loop)
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
    state.intervalSeconds,
    state.revealSeconds,
    state.phase,
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
      <ChordsDisplay
        promptText={promptText}
        chordId={chordId}
        phase={state.phase as Phase}
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
        onToggleAuto={() => dispatch({ type: "TOGGLE_AUTO" })}
        onTogglePause={() => dispatch({ type: "TOGGLE_PAUSE" })}
        onIntervalChange={(v) =>
          dispatch({ type: "SET_INTERVAL_SECONDS", seconds: Number(v) })
        }
        onRevealSecondsChange={(v) =>
          dispatch({ type: "SET_REVEAL_SECONDS", seconds: Number(v) })
        }
        onAccidentalChange={(v) => {
          if (!isAccidentalPreference(v)) return;
          dispatch({
            type: "UPDATE_DISPLAY_SETTINGS",
            patch: { accidentalPreference: v },
          });
        }}
        onReveal={() => dispatch({ type: "REVEAL" })}
        onNext={() => dispatch({ type: "NEXT" })}
        onReset={() => dispatch({ type: "RESET" })}
      />
    </div>
  );
}
