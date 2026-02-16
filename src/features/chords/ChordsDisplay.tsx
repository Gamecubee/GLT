import { useMemo } from "react";
import type { Chord } from "../../domain/chords";
import { getCagedVoicingForChord } from "../../domain/cagedVoicings";
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

export function ChordsDisplay(props: Props) {
  const isRevealed = props.phase === "revealed";

  const voicing = useMemo(() => {
    if (!isRevealed) return null;
    return getCagedVoicingForChord(props.chord);
  }, [isRevealed, props.chord]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            CHORD
          </div>
          <div className="mt-2 text-2xl font-semibold text-neutral-100">
            {props.promptText}
          </div>
          <div className="mt-2 text-xs text-neutral-600">{props.chordId}</div>
        </div>

        <div className="text-right">
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            MODE
          </div>
          <div className="mt-2 text-sm text-neutral-200">
            {props.auto ? (props.paused ? "AUTO • PAUSED" : "AUTO") : "MANUAL"}
          </div>
          <div className="mt-1 text-xs text-neutral-600">
            prompt {props.intervalSeconds.toFixed(1)}s • reveal{" "}
            {props.revealSeconds.toFixed(1)}s
          </div>
        </div>
      </div>

      {/* Reveal area */}
      <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
        <div className="text-[11px] tracking-[0.28em] text-neutral-500">
          {isRevealed ? "DIAGRAM" : "WAITING"}
        </div>

        {isRevealed ? (
          voicing ? (
            <div className="mt-3">
              <ChordDiagramSvg voicing={voicing} className="h-auto w-full" />
            </div>
          ) : (
            <div className="mt-3 text-sm text-neutral-400">
              No voicing yet for this shape/type (seed only has E/A
              Major/Minor).
            </div>
          )
        ) : (
          <div className="mt-3 text-sm text-neutral-400">
            Press reveal (or space) to show the chord diagram.
          </div>
        )}
      </div>
    </div>
  );
}
