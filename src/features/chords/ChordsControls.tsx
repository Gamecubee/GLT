import { useMemo, useState } from "react";
import type {
  AccidentalPreference,
  CagedShape,
  ChordType,
  Root,
} from "../../domain/music";
import { ALL_ROOTS, CHORD_TYPE_UI_LABEL, formatRoot } from "../../domain/music";
import type { RootMode, CagedMode } from "../../domain/randomizer";

type Props = {
  // session
  auto: boolean;
  paused: boolean;
  intervalSeconds: number;
  revealSeconds: number;
  isRevealed: boolean;

  // display
  accidentalPreference: AccidentalPreference;

  // settings
  rootMode: RootMode;
  cagedMode: CagedMode;

  selectedChordTypes: readonly ChordType[];
  allChordTypes: readonly ChordType[];

  selectedCagedShapes: readonly CagedShape[];
  allCagedShapes: readonly CagedShape[];

  extraRootsText: string;

  // handlers
  onToggleAuto: () => void;
  onTogglePause: () => void;
  onIntervalChange: (value: string) => void;
  onRevealSecondsChange: (value: string) => void;
  onAccidentalChange: (value: AccidentalPreference) => void;

  onSetRootMode: (mode: RootMode) => void;
  onSetCagedMode: (mode: CagedMode) => void;

  onToggleChordType: (type: ChordType) => void;
  onToggleCagedShape: (shape: CagedShape) => void;

  // driven by the pool UI
  onExtraRootsTextChange: (value: string) => void;

  onReveal: () => void;
  onNext: () => void;
  onReset: () => void;
};

const CAGED_LETTERS: readonly Root[] = ["C", "A", "G", "E", "D"];

function parseExtraRootsText(text: string): Root[] {
  const tokens = text
    .split(/[,\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean);

  const allowed = new Set<string>(ALL_ROOTS as readonly string[]);
  const out: Root[] = [];
  const seen = new Set<string>();

  for (const t of tokens) {
    if (allowed.has(t) && !seen.has(t)) {
      out.push(t as Root);
      seen.add(t);
    }
  }
  return out;
}

function serializeExtraRoots(roots: readonly Root[]): string {
  return roots.join(", ");
}
export function ChordsControls(props: Props) {
  // Accordion open state
  const [open, setOpen] = useState<"session" | "randomizer" | "display">(
    "session",
  );

  const showCaged = props.rootMode === "cagedOnly";

  const selectedExtraRoots = useMemo(
    () => parseExtraRootsText(props.extraRootsText),
    [props.extraRootsText],
  );

  // Pool for extra roots in CAGED mode:
  // all roots minus the base CAGED letters
  const extraRootPool: Root[] = useMemo(() => {
    const base = new Set<string>(CAGED_LETTERS);
    return (ALL_ROOTS as readonly Root[]).filter((r) => !base.has(r));
  }, []);

  const selectedExtraSet = useMemo(() => {
    return new Set<string>(selectedExtraRoots);
  }, [selectedExtraRoots]);

  const toggleExtraRoot = (r: Root) => {
    const next = new Set<string>(selectedExtraSet);
    if (next.has(r)) next.delete(r);
    else next.add(r);

    // Keep stable order according to pool
    const ordered = extraRootPool.filter((x) => next.has(x));
    props.onExtraRootsTextChange(serializeExtraRoots(ordered));
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4 md:px-6 md:py-6">
      <div className="text-[11px] tracking-[0.28em] text-neutral-500">
        CONTROLS
      </div>

      <div className="mt-4 grid gap-3">
        {/* SESSION */}
        <AccordionSection
          title="SESSION"
          subtitle="timers + flow"
          isOpen={open === "session"}
          onToggle={() =>
            setOpen(open === "session" ? "randomizer" : "session")
          }
        >
          <div className="grid gap-3">
            <Row label="AUTO">
              <ToggleSwitch
                value={props.auto}
                onToggle={props.onToggleAuto}
                onLabel="ON"
                offLabel="OFF"
              />
            </Row>

            <Row label="PAUSE">
              <ToggleSwitch
                value={props.paused}
                disabled={!props.auto}
                onToggle={props.onTogglePause}
                onLabel="PAUSED"
                offLabel="RUN"
              />
            </Row>

            <Row label="PROMPT (s)">
              <SliderWithNumber
                value={props.intervalSeconds}
                min={0.2}
                max={12}
                step={0.1}
                onChange={props.onIntervalChange}
              />
            </Row>

            <Row label="REVEAL (s)">
              <SliderWithNumber
                value={props.revealSeconds}
                min={0.2}
                max={12}
                step={0.1}
                onChange={props.onRevealSecondsChange}
              />
            </Row>

            <div className="mt-1 grid grid-cols-2 gap-3">
              <button
                onClick={props.onReveal}
                disabled={props.isRevealed}
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-medium transition",
                  props.isRevealed
                    ? "cursor-not-allowed border-neutral-900 bg-neutral-950 text-neutral-600"
                    : "border-neutral-800 bg-neutral-950 text-neutral-100 hover:border-neutral-700 hover:bg-white/5",
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
              className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 transition hover:border-neutral-700 hover:bg-white/5"
            >
              Reset Session
            </button>
          </div>
        </AccordionSection>

        {/* RANDOMIZER */}
        <AccordionSection
          title="RANDOMIZER"
          subtitle="roots + types + shapes"
          isOpen={open === "randomizer"}
          onToggle={() =>
            setOpen(open === "randomizer" ? "display" : "randomizer")
          }
        >
          <div className="grid gap-3">
            <Row label="ROOT POOL">
              <Segmented
                value={props.rootMode}
                options={[
                  { value: "cagedOnly", label: "CAGED" },
                  { value: "full", label: "FULL" },
                ]}
                onChange={(v) => props.onSetRootMode(v)}
              />
            </Row>

            {showCaged ? (
              <>
                <Row label="CAGED MODE">
                  <Segmented
                    value={props.cagedMode}
                    options={[
                      { value: "lock", label: "LOCK" },
                      { value: "randomShape", label: "RANDOM" },
                    ]}
                    onChange={(v) => props.onSetCagedMode(v)}
                  />
                </Row>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                      EXTRA ROOTS
                    </div>
                    <div className="text-[11px] tracking-[0.22em] text-neutral-600">
                      {selectedExtraRoots.length}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {extraRootPool.map((r) => {
                      const selected = selectedExtraSet.has(r);
                      const label = formatRoot(r, props.accidentalPreference);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleExtraRoot(r)}
                          className={[
                            "rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
                            selected
                              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                              : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-white/5",
                          ].join(" ")}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-sm text-neutral-400">
                    {props.cagedMode === "lock"
                      ? "In LOCK: letter roots force matching shape (C→C...). Extra roots use selected shapes."
                      : "Adds non-letter roots to the CAGED pool."}
                  </div>
                </div>
              </>
            ) : null}

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  CHORD TYPES
                </div>
                <div className="text-[11px] tracking-[0.22em] text-neutral-600">
                  {props.selectedChordTypes.length}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {props.allChordTypes.map((t) => {
                  const selected = props.selectedChordTypes.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => props.onToggleChordType(t)}
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
                        selected
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                          : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-white/5",
                      ].join(" ")}
                    >
                      {CHORD_TYPE_UI_LABEL[t]}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-sm text-neutral-400">
                Keep at least one enabled.
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  SHAPES
                </div>
                <div className="text-[11px] tracking-[0.22em] text-neutral-600">
                  {props.selectedCagedShapes.length}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {props.allCagedShapes.map((s) => {
                  const selected = props.selectedCagedShapes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => props.onToggleCagedShape(s)}
                      className={[
                        "rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
                        selected
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
                          : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-white/5",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-sm text-neutral-400">
                {props.rootMode === "cagedOnly" && props.cagedMode === "lock"
                  ? "LOCK: shapes affect extra roots only."
                  : "Used for shape randomization."}
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* DISPLAY */}
        <AccordionSection
          title="DISPLAY"
          subtitle="notation + preference"
          isOpen={open === "display"}
          onToggle={() => setOpen(open === "display" ? "session" : "display")}
        >
          <div className="grid gap-3">
            <Row label="ACCIDENTALS">
              <Segmented
                value={props.accidentalPreference}
                options={[
                  { value: "sharp", label: "♯" },
                  { value: "flat", label: "♭" },
                  { value: "both", label: "♯/♭" },
                ]}
                onChange={(v) => props.onAccidentalChange(v)}
              />
            </Row>

            {/* Optional: keep the select hidden for accessibility fallback if you want.
                For now we keep it out since segmented handles it. */}
          </div>
        </AccordionSection>
      </div>
    </div>
  );
}

/* UI primitives  */

function AccordionSection(props: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950">
      <button
        type="button"
        onClick={props.onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <div className="text-[11px] tracking-[0.28em] text-neutral-400">
            {props.title}
          </div>
          {props.subtitle ? (
            <div className="mt-1 text-xs text-neutral-600">
              {props.subtitle}
            </div>
          ) : null}
        </div>

        <div
          className={[
            "rounded-full border px-3 py-1 text-[11px] tracking-[0.22em] transition",
            props.isOpen
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
              : "border-neutral-800 text-neutral-400 hover:bg-white/5",
          ].join(" ")}
        >
          {props.isOpen ? "OPEN" : "CLOSED"}
        </div>
      </button>

      {props.isOpen ? (
        <div className="border-t border-neutral-800 px-4 py-4">
          {props.children}
        </div>
      ) : null}
    </div>
  );
}

function Row(props: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="text-[11px] tracking-[0.28em] text-neutral-500">
        {props.label}
      </div>
      <div className="flex items-center">{props.children}</div>
    </div>
  );
}

function ToggleSwitch(props: {
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  const label = props.value
    ? (props.onLabel ?? "ON")
    : (props.offLabel ?? "OFF");

  return (
    <button
      type="button"
      onClick={props.onToggle}
      disabled={props.disabled}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] tracking-[0.26em] transition",
        props.disabled
          ? "cursor-not-allowed border-neutral-900 text-neutral-700"
          : props.value
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
            : "border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "h-2.5 w-2.5 rounded-full border",
          props.disabled
            ? "border-neutral-800"
            : props.value
              ? "border-emerald-300/50 bg-emerald-200/60"
              : "border-neutral-700 bg-neutral-800",
        ].join(" ")}
      />
      {label}
    </button>
  );
}

function Segmented<T extends string>(props: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-full border border-neutral-800">
      {props.options.map((o, i) => {
        const active = o.value === props.value;
        return (
          <div key={o.value} className="flex items-stretch">
            <button
              type="button"
              onClick={() => props.onChange(o.value)}
              className={[
                "px-3 py-1 text-[11px] tracking-[0.26em] transition",
                active
                  ? "bg-emerald-400/12 text-emerald-200"
                  : "text-neutral-300 hover:bg-white/5",
              ].join(" ")}
            >
              {o.label}
            </button>
            {i < props.options.length - 1 ? (
              <div className="w-px bg-neutral-800" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SliderWithNumber(props: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: string) => void;
}) {
  const v = Number.isFinite(props.value) ? props.value : props.min;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={v}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-28 accent-emerald-300"
      />
      <input
        type="number"
        min={props.min}
        max={props.max}
        step={props.step}
        value={v}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-20 rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-sm text-neutral-200 outline-none focus:border-neutral-700"
      />
    </div>
  );
}
