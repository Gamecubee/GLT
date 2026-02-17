import { useMemo } from "react";
import type { Chord } from "../../domain/chords";
import { getCagedVoicingForChord } from "../../domain/cagedVoicings";
import type { ChordVoicing } from "../../domain/voicings";
import { ChordDiagramSvg } from "../../components/ChordDiagramSvg";
import type { Phase } from "./types";

type Props = {
  chord: Chord;

  promptText: string;
  chordId: string;
  phase: Phase;

  auto: boolean;
  paused: boolean;
  intervalSeconds: number;
  revealSeconds: number;
};

const EMPTY_VOICING: ChordVoicing = {
  baseFret: 1,
  frets: ["x", "x", "x", "x", "x", "x"],
  // no fingers / barres
};

export function ChordsDisplay(props: Props) {
  const isRevealed = props.phase === "revealed";

  // Try to resolve a real voicing; can be null while templates are incomplete.
  const resolvedVoicing = useMemo(() => {
    return getCagedVoicingForChord(props.chord);
  }, [props.chord]);

  // Always render a grid: if no template, render an empty voicing.
  const voicingToRender = resolvedVoicing ?? EMPTY_VOICING;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-5">
      {/* left accent */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-emerald-300/40" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-emerald-300/10 to-transparent" />

      {/* content */}
      <div className="relative">
        {" "}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              CHORD
            </div>

            <div className="mt-2 truncate text-2xl font-semibold text-neutral-100">
              {props.promptText}
            </div>

            <div className="mt-2 text-xs text-neutral-600">{props.chordId}</div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              FLOW
            </div>
            <div className="mt-2 text-sm text-neutral-200">
              {props.auto
                ? props.paused
                  ? "AUTO • PAUSED"
                  : "AUTO"
                : "MANUAL"}
            </div>
            <div className="mt-1 text-xs text-neutral-600">
              prompt {props.intervalSeconds.toFixed(1)}s • reveal{" "}
              {props.revealSeconds.toFixed(1)}s
            </div>
          </div>
        </div>
        {/* Diagram area: grid always visible, notes only on reveal */}
        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              DIAGRAM
            </div>

            {!resolvedVoicing ? (
              <div className="text-[11px] tracking-[0.22em] text-neutral-600">
                NO TEMPLATE
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <ChordDiagramSvg
              voicing={voicingToRender}
              revealed={isRevealed}
              fretsVisible={15}
              tuning={["E", "A", "D", "G", "B", "E"]}
              className="w-full"
            />
          </div>

          {!isRevealed ? (
            <div className="mt-3 text-sm text-neutral-400">
              Press <span className="text-neutral-200">Space</span> (or Reveal)
              to show the chord.
            </div>
          ) : !resolvedVoicing ? (
            <div className="mt-3 text-sm text-neutral-400">
              Template not implemented yet for this shape/type. The grid is
              shown as a placeholder.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
