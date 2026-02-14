import { DotMatrixPanel } from "../../components/DotMatrixPanel";
import type { Phase } from "./types";

type Props = {
  promptText: string;
  chordId: string;
  phase: Phase;
  auto: boolean;
  paused: boolean;

  intervalSeconds: number; // prompt seconds
  revealSeconds: number; // revealed seconds
};

export function ChordsDisplay(props: Props) {
  const isRevealed = props.phase === "revealed";

  return (
    <DotMatrixPanel title="DISPLAY" accent="chords" className="h-full">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] tracking-[0.28em] text-neutral-500">
          PROMPT
        </div>
        <div className="text-[11px] tracking-[0.28em] text-neutral-500">
          {props.auto
            ? props.paused
              ? "AUTO: PAUSED"
              : "AUTO: ON"
            : "AUTO: OFF"}
        </div>
      </div>

      <div className="mt-4 sm:mt-5">
        <div className="font-semibold tracking-tight text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">
          {props.promptText}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-neutral-400">
          <span>
            ID: <span className="text-neutral-200">{props.chordId}</span>
          </span>

          <span>
            Prompt:{" "}
            <span className="text-neutral-200">
              {props.intervalSeconds.toFixed(1)}s
            </span>
          </span>

          <span>
            Reveal:{" "}
            <span className="text-neutral-200">
              {props.revealSeconds.toFixed(1)}s
            </span>
          </span>

          <span>
            Phase:{" "}
            <span className="text-neutral-200">
              {isRevealed ? "REVEALED" : "PROMPT"}
            </span>
          </span>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 rounded-lg border border-neutral-800 bg-neutral-950/60 px-4 py-4">
        <div className="flex items-center justify-between text-[11px] tracking-[0.28em] text-neutral-500">
          <span>TAB / DIAGRAM</span>
          <span
            className={isRevealed ? "text-emerald-200" : "text-neutral-600"}
          >
            {isRevealed ? "VISIBLE" : "HIDDEN"}
          </span>
        </div>

        <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/60 h-24 sm:h-28 lg:h-36 xl:h-44" />

        <div className="mt-2 text-xs sm:text-sm text-neutral-400">
          {isRevealed
            ? "Placeholder: here we will render the SVG chord diagram."
            : "Press Reveal (or wait in Auto mode) to show the diagram."}
        </div>
      </div>
    </DotMatrixPanel>
  );
}
