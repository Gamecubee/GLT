import { ChordsTool } from "./features/chords/ChordsTool";

export default function App() {
  return (
    <div className="min-h-[100dvh] bg-neutral-950 text-neutral-100 antialiased">
      {/* Outer padding responsive + safe areas */}
      <div className="min-h-[100dvh] px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Main panel should fill available space */}
        <div className="min-h-[calc(100dvh-1rem)] sm:min-h-[calc(100dvh-2rem)] lg:min-h-[calc(100dvh-3rem)] w-full rounded-2xl border border-neutral-800 bg-neutral-950/70 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
          {/* Panel layout: header / body / footer */}
          <div className="flex min-h-[inherit] flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-baseline gap-3">
                <div className="text-sm font-semibold tracking-[0.22em] text-neutral-200">
                  GLT
                </div>
                <div className="hidden text-xs tracking-[0.28em] text-neutral-500 sm:block">
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
            </header>

            {/* Body (flex-1 so it expands) */}
            <main className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6">
              <ChordsTool />
            </main>

            {/* Footer */}
            <footer className="flex items-center justify-between border-t border-neutral-800 px-4 py-3 sm:px-6 sm:py-4">
              <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                BUILD: LOCAL
              </div>
              <div className="text-[11px] tracking-[0.28em] text-neutral-500">
                © {new Date().getFullYear()} GLT
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
