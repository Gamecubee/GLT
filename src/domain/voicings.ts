// ordering frets low to high
export type StringFret = number | "x";

export type Finger = 1 | 2 | 3 | 4;

export type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type VoicingFrets = readonly [
  StringFret,
  StringFret,
  StringFret,
  StringFret,
  StringFret,
  StringFret,
];

export type VoicingFingers = readonly [
  Finger | null,
  Finger | null,
  Finger | null,
  Finger | null,
  Finger | null,
  Finger | null,
];

export type Barre = Readonly<{
  finger: Finger;
  fret: number;
  fromString: StringIndex;
  toString: StringIndex;
}>;

export type ChordVoicing = Readonly<{
  frets: VoicingFrets;
  baseFret: number;
  fingers?: VoicingFingers;
  barres?: readonly Barre[];
}>;

export function checkBaseFret(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.floor(n));
}

export function isStringFret(v: unknown): v is StringFret {
  return v === "x" || (typeof v === "number" && Number.isInteger(v) && v >= 0);
}

export function isStringCoveredByBarre(
  barres: readonly Barre[] | undefined,
  stringIndex: StringIndex,
): boolean {
  if (!barres || barres.length === 0) return false;
  for (const b of barres) {
    if (stringIndex >= b.fromString && stringIndex <= b.toString) return true;
  }
  return false;
}
