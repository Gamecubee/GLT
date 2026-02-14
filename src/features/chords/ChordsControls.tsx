import type { AccidentalPreference } from "../../domain/music";

type Props = {
  auto: boolean;
  paused: boolean;
  intervalSeconds: number;
  isRevealed: boolean;
  accidentalPreference: AccidentalPreference;

  onToggleAuto: () => void;
  onTogglePause: () => void;
  onIntervalChange: (value: string) => void;
  onAccidentalChange: (value: string) => void;

  onReveal: () => void;
  onNext: () => void;
  onReset: () => void;
};

export function ChordsControls(props: Props) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-6 py-7">
      <div className="text-[11px] tracking-[0.28em] text-neutral-500">
        CONTROLS
      </div>

      <div className="mt-5 grid gap-3">
        {/* AUTO */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            AUTO
          </div>
          <button
            onClick={props.onToggleAuto}
            className={[
              "rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
              props.auto
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                : "border-neutral-800 text-neutral-300 hover:border-neutral-700",
            ].join(" ")}
          >
            {props.auto ? "ON" : "OFF"}
          </button>
        </div>

        {/* PAUSE */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            PAUSE
          </div>
          <button
            onClick={props.onTogglePause}
            disabled={!props.auto}
            className={[
              "rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
              !props.auto
                ? "cursor-not-allowed border-neutral-900 text-neutral-700"
                : props.paused
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-700",
            ].join(" ")}
          >
            {props.paused ? "PAUSED" : "RUN"}
          </button>
        </div>

        {/* INTERVAL */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            INTERVAL (s)
          </div>
          <input
            type="number"
            min={0.2}
            step={0.1}
            value={props.intervalSeconds}
            onChange={(e) => props.onIntervalChange(e.target.value)}
            className="w-24 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          />
        </div>

        {/* ACCIDENTALS */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            ACCIDENTALS
          </div>
          <select
            value={props.accidentalPreference}
            onChange={(e) => props.onAccidentalChange(e.target.value)}
            className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-700"
          >
            <option value="sharp">Sharps</option>
            <option value="flat">Flats</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={props.onReveal}
          disabled={props.isRevealed}
          className={[
            "rounded-xl border px-4 py-3 text-sm font-medium transition",
            props.isRevealed
              ? "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600"
              : "border-neutral-800 bg-neutral-950 text-neutral-100 hover:border-neutral-700",
          ].join(" ")}
        >
          Reveal
        </button>

        <button
          onClick={props.onNext}
          className="rounded-xl border border-neutral-800 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white"
        >
          Next
        </button>
      </div>

      <button
        onClick={props.onReset}
        className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 transition hover:border-neutral-700"
      >
        Reset Session
      </button>
    </div>
  );
}
