// Notes / roots I use sharps as def
export type Root =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";

export const ALL_ROOTS: Root[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type AccidentalPreference = "sharp" | "flat" | "both";

// Only sharps that can also be flat
const SHARP_TO_FLAT: { [key: string]: string } = {
  "C#": "D♭",
  "D#": "E♭",
  "F#": "G♭",
  "G#": "A♭",
  "A#": "B♭",
};

export function formatRoot(
  root: Root,
  preference: AccidentalPreference = "sharp",
): string {
  const flat = SHARP_TO_FLAT[root];

  // Natural notes (C, D, E, F, G, A, B)
  if (!flat) return root;

  if (preference === "sharp") return root;
  else if (preference === "flat") return flat;
  else return root + "/" + flat;
}

// CAGED shapes
export type CagedShape = "E" | "A" | "D" | "G" | "C";
export const ALL_CAGED_SHAPES: CagedShape[] = ["E", "A", "D", "G", "C"];

// Chord types
export type ChordType = "Major" | "Minor" | "7" | "Min7" | "Maj7" | "Power5";

export const ALL_CHORD_TYPES: ChordType[] = [
  "Major",
  "Minor",
  "7",
  "Min7",
  "Maj7",
  "Power5",
];

// short label
export const CHORD_TYPE_UI_LABEL: { [key: string]: string } = {
  Major: "Maj",
  Minor: "Min",
  "7": "7",
  Min7: "m7",
  Maj7: "Maj7",
  Power5: "5",
};
