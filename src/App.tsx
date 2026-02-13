import { DotMatrixPanel } from "./components/DotMatrixPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-10">
        {/* Main panel */}
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
            <div className="flex items-baseline gap-3">
              <div className="text-sm font-semibold tracking-[0.22em] text-neutral-200">
                GLT
              </div>
              <div className="text-xs tracking-[0.28em] text-neutral-500">
                GUITAR LEARNING TOOL
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] tracking-[0.26em] text-emerald-200">
                CHORDS
              </div>
              <div className="text-[11px] tracking-[0.26em] text-neutral-500">
                v0.1
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.2fr_0.8fr]">
            {/* Left: dot-matrix display */}
            <DotMatrixPanel title="DISPLAY" accent="chords">
              <div className="flex items-center justify-between">
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  NOW
                </div>
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  NEXT
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  PROMPT
                </div>

                {/* Placeholder: in futuro qui mettiamo il chord randomizzato */}
                <div className="mt-2 text-4xl font-semibold tracking-tight">
                  D#min7 <span className="text-neutral-400">— C FORM</span>
                </div>

                <div className="mt-2 text-sm text-neutral-400">
                  Reveal after: <span className="text-neutral-200">2.0s</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="FORMS" value="E A D G C" />
                <Stat label="TYPES" value="Maj Min 7" />
                <Stat label="MODE" value="Manual" />
              </div>

              {/* Placeholder area for SVG tab/diagram */}
              <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950/70 px-4 py-4">
                <div className="flex items-center justify-between text-[11px] tracking-[0.28em] text-neutral-500">
                  <span>TAB AREA</span>
                  <span className="text-emerald-200/90">READY</span>
                </div>
                <div className="mt-3 h-24 rounded-md border border-neutral-800 bg-neutral-950/60" />
                <div className="mt-2 text-sm text-neutral-400">
                  (Soon) SVG chord diagram will render here.
                </div>
              </div>
            </DotMatrixPanel>

            {/* Right: controls (non-functional placeholders) */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-6 py-7">
              <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                CONTROLS
              </div>

              <div className="mt-5 grid gap-3">
                <ControlRow label="AUTO" value="OFF" />
                <ControlRow label="INTERVAL" value="— s" />
                <ControlRow label="REVEAL" value="Tap to show tab" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-neutral-700">
                  Prev
                </button>
                <button className="rounded-xl border border-neutral-800 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-white">
                  Next
                </button>
              </div>

              <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
                <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                  STATUS
                </div>
                <div className="mt-2 grid gap-1 text-sm text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">MODE</span>
                    <span className="tracking-tight">CHORDS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">AUTO</span>
                    <span className="tracking-tight">OFF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">INTERVAL</span>
                    <span className="tracking-tight">—</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-[11px] tracking-[0.26em] text-neutral-600">
                TIP: keep commits small & frequent.
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4">
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              BUILD: LOCAL
            </div>
            <div className="text-[11px] tracking-[0.28em] text-neutral-500">
              © {new Date().getFullYear()} GLT by Gamecube
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat(props: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 px-4 py-3">
      <div className="text-[11px] tracking-[0.28em] text-neutral-500">
        {props.label}
      </div>
      <div className="mt-1 text-sm font-medium text-neutral-200">
        {props.value}
      </div>
    </div>
  );
}

function ControlRow(props: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
      <div className="text-[11px] tracking-[0.28em] text-neutral-500">
        {props.label}
      </div>
      <div className="text-sm font-medium text-neutral-200">{props.value}</div>
    </div>
  );
}
