// src/domain/cagedVoicings.ts
import type { Chord } from "./chords";
import type { CagedShape, Root, ChordType } from "./music";
import type {
  Barre,
  ChordVoicing,
  StringFret,
  StringIndex,
  VoicingFrets,
  VoicingFingers,
  Finger,
} from "./voicings";
import { checkBaseFret } from "./voicings";

// -----------------------------
// Semitone helpers
// -----------------------------

const ROOT_TO_SEMITONE: Record<Root, number> = {
  C: 0,
  "C#": 1,
  D: 2,
  "D#": 3,
  E: 4,
  F: 5,
  "F#": 6,
  G: 7,
  "G#": 8,
  A: 9,
  "A#": 10,
  B: 11,
};

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function semitoneDelta(from: Root, to: Root): number {
  return mod12(ROOT_TO_SEMITONE[to] - ROOT_TO_SEMITONE[from]);
}

/**
 * Base root for each CAGED shape (the "open" reference).
 * This is the anchor for transposition.
 */
const SHAPE_BASE_ROOT: Record<CagedShape, Root> = {
  E: "E",
  A: "A",
  D: "D",
  G: "G",
  C: "C",
};

// -----------------------------
// Template model (relative frets)
// -----------------------------

type TemplateFret = number | "x"; // 0 allowed; we transpose it too (0 -> delta)
type TemplateFrets = readonly [
  TemplateFret,
  TemplateFret,
  TemplateFret,
  TemplateFret,
  TemplateFret,
  TemplateFret,
];

type TemplateBarre = Readonly<{
  finger: Finger;
  fret: number; // relative (0 allowed)
  fromString: StringIndex;
  toString: StringIndex;
}>;

type VoicingTemplate = Readonly<{
  frets: TemplateFrets;
  fingers?: VoicingFingers;
  barres?: readonly TemplateBarre[];
}>;

type TemplateKey = `${CagedShape}-${ChordType}`;

// -----------------------------
// Templates (START SMALL)
// -----------------------------

const TEMPLATES: Partial<Record<TemplateKey, VoicingTemplate>> = {
  "E-Major": {
    frets: [0, 2, 2, 1, 0, 0],
    fingers: [null, 2, 3, 1, null, null],
    barres: [{ finger: 1, fret: 0, fromString: 0, toString: 5 }],
  },
  "E-Minor": {
    frets: [0, 2, 2, 0, 0, 0],
    fingers: [null, 2, 3, null, null, null],
    barres: [{ finger: 1, fret: 0, fromString: 0, toString: 5 }],
  },
  "A-Major": {
    frets: ["x", 0, 2, 2, 2, 0],
    fingers: [null, null, 1, 2, 3, null],
    barres: [{ finger: 1, fret: 0, fromString: 1, toString: 5 }],
  },
  "A-Minor": {
    frets: ["x", 0, 2, 2, 1, 0],
    fingers: [null, null, 2, 3, 1, null],
    barres: [{ finger: 1, fret: 0, fromString: 1, toString: 5 }],
  },
};

// -----------------------------
// Transposition
// -----------------------------

function transposeFret(f: TemplateFret, delta: number): StringFret {
  if (f === "x") return "x";
  return f + delta;
}

function transposeTemplate(
  t: VoicingTemplate,
  delta: number,
): Omit<ChordVoicing, "baseFret"> {
  // Make TS happy: build the 6-tuple explicitly
  const frets: VoicingFrets = [
    transposeFret(t.frets[0], delta),
    transposeFret(t.frets[1], delta),
    transposeFret(t.frets[2], delta),
    transposeFret(t.frets[3], delta),
    transposeFret(t.frets[4], delta),
    transposeFret(t.frets[5], delta),
  ];

  const barres: Barre[] | undefined = t.barres
    ? t.barres
        .map((b) => ({
          ...b,
          fret: b.fret + delta,
        }))
        // Drop fake "barre at 0" when not transposed
        .filter((b) => b.fret > 0)
    : undefined;

  return {
    frets,
    fingers: t.fingers,
    barres,
  };
}

function computeBaseFret(v: Omit<ChordVoicing, "baseFret">): number {
  let min = Infinity;

  for (const f of v.frets) {
    if (typeof f === "number" && f > 0) min = Math.min(min, f);
  }

  if (v.barres) {
    for (const b of v.barres) min = Math.min(min, b.fret);
  }

  if (!Number.isFinite(min)) return 1;
  return checkBaseFret(min);
}

// -----------------------------
// Public API
// -----------------------------

export function getCagedVoicingForChord(chord: Chord): ChordVoicing | null {
  const key = `${chord.shape}-${chord.type}` as TemplateKey;
  const template = TEMPLATES[key];
  if (!template) return null;

  const baseRoot = SHAPE_BASE_ROOT[chord.shape];
  const delta = semitoneDelta(baseRoot, chord.root);

  const partial = transposeTemplate(template, delta);
  const baseFret = computeBaseFret(partial);

  return { ...partial, baseFret };
}
