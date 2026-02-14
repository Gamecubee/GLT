import type { AccidentalPreference } from "../../domain/music";
import type { ChordRandomizerSettings } from "../../domain/randomizer";
import type { Chord } from "../../domain/chords";

export type Phase = "prompt" | "revealed";

export type DisplaySettings = {
  accidentalPreference: AccidentalPreference;
};

export type ChordsState = {
  randomizerSettings: ChordRandomizerSettings;
  displaySettings: DisplaySettings;

  currentChord: Chord;
  phase: Phase;

  auto: boolean;
  paused: boolean;
  intervalSeconds: number;
};
