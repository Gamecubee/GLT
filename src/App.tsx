import { ChordsTool } from "./features/chords/ChordsTool";

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
          <div className="px-6 py-8">
            <ChordsTool />
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
