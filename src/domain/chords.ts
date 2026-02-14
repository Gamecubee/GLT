import type {
  Root,
  CagedShape,
  ChordType,
  AccidentalPreference,
} from "./music";
import { formatRoot, CHORD_TYPE_UI_LABEL } from "./music";

// Chords
export type Chord = {
  root: Root;
  type: ChordType;
  shape: CagedShape;
};

// String everyone will see
export function formatChordPrompt(
  chord: Chord,
  preference: AccidentalPreference = "sharp",
): string {
  const formattedRoot = formatRoot(chord.root, preference);
  const typeLabel = CHORD_TYPE_UI_LABEL[chord.type];
  return `${formattedRoot} ${typeLabel} — ${chord.shape} SHAPE`;
}

// String id for history purposes
export function toChordId(chord: Chord): string {
  return `${chord.root}-${chord.type}-${chord.shape}`;
}
