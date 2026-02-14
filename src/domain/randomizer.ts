import { ALL_ROOTS, type Root, type CagedShape, type ChordType } from "./music";
import type { Chord } from "./chords";

export type RootMode = "cagedOnly" | "full";

export const CAGED_ROOTS: Root[] = ["C", "A", "G", "E", "D"];

export type ChordRandomizerSettings = {
  rootMode: RootMode;
  extraRoots?: Root[];
  allowedTypes: ChordType[];
  allowedShapes: CagedShape[];
};

export function getCandidateRoots(settings: ChordRandomizerSettings): Root[] {
  const baseRoots = settings.rootMode === "cagedOnly" ? CAGED_ROOTS : ALL_ROOTS;
  const extras = settings.extraRoots ?? [];

  //duplicating
  const set = new Set<Root>();
  for (const r of baseRoots) set.add(r);
  for (const r of extras) set.add(r);

  return Array.from(set);
}

export function pickOneRoot(arr: readonly Root[], name = "roots"): Root {
  if (arr.length == 0) throw new Error(`pickOneRoot failed: ${name} is empty`);
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function pickOneType(
  arr: readonly ChordType[],
  name = "types",
): ChordType {
  if (arr.length == 0) throw new Error(`pickOneType failed: ${name} is empty`);
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function pickOneShape(
  arr: readonly CagedShape[],
  name = "shapes",
): CagedShape {
  if (arr.length == 0) throw new Error(`pickOneShape failed: ${name} is empty`);
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx]!;
}

export function pickRandomChord(settings: ChordRandomizerSettings): Chord {
  const roots = getCandidateRoots(settings);

  const root = pickOneRoot(roots, "candidateRoots");
  const type = pickOneType(settings.allowedTypes, "allowedTypes");
  const shape = pickOneShape(settings.allowedShapes, "allowedShapes");

  return { root, type, shape };
}
