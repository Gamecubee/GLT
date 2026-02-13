import type { ReactNode } from "react";

type DotMatrixPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: "chords";
};

export function DotMatrixPanel({
  title,
  children,
  className,
  accent,
}: DotMatrixPanelProps) {
  const accentClass =
    accent === "chords"
      ? "border-emerald-400/20 bg-emerald-400/5"
      : "border-neutral-800 bg-neutral-950";

  return (
    <div
      className={[
        "relative overflow-hidden rounded-xl border px-6 py-7",
        accentClass,
        className ?? "",
      ].join(" ")}
    >
      {/* Dot-matrix layer */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
        <div className="h-full w-full bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:12px_12px]" />
      </div>

      {/* Subtle top sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/5 to-transparent" />

      <div className="relative z-10">
        {title ? (
          <div className="text-[11px] tracking-[0.28em] text-neutral-500">
            {title}
          </div>
        ) : null}
        <div className={title ? "mt-4" : ""}>{children}</div>
      </div>
    </div>
  );
}
