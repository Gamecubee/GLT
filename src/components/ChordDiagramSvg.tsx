import type { ChordVoicing, StringFret, StringIndex } from "../domain/voicings";

type Props = {
  voicing: ChordVoicing;

  /** if false: render only the grid (no dots, no X/O, no barre) */
  revealed?: boolean;

  /** Tailwind classes */
  className?: string;
};

/**
 * Horizontal chord diagram:
 * - X axis: frets (left -> right)
 * - Y axis: strings (top = high E, bottom = low E)
 *
 * voicing.frets is ordered low->high (E A D G B e) == stringIndex 0..5
 * We render top->bottom as high->low for typical readability.
 */
export function ChordDiagramSvg({
  voicing,
  revealed = true,
  className,
}: Props) {
  // Layout (SVG user units)
  const W = 560;
  const H = 170;

  // Grid box
  const pad = 16;
  const gridX = 96; // leave space on the left for X/O and base fret
  const gridY = 26;
  const gridW = W - gridX - pad;
  const gridH = H - gridY - pad;

  // Diagram: 6 strings, 5 frets visible
  const strings = 6;
  const fretsVisible = 5;

  const stringGap = gridH / (strings - 1);
  const fretGap = gridW / fretsVisible; // we draw 6 vertical lines (0..5), cells are between lines

  // Helpers
  const yForString = (stringIndexLowToHigh: StringIndex) => {
    // stringIndex 0 (low E) should be bottom; 5 (high e) top
    const fromTop = 5 - stringIndexLowToHigh;
    return gridY + fromTop * stringGap;
  };

  const isNumberFret = (f: StringFret): f is number => typeof f === "number";

  const cellCenterXForFret = (absFret: number) => {
    // absFret is an absolute fret number (0=open, 1..)
    // We place dots in the "cell" between fret line (n-baseFret) and (n-baseFret+1)
    const rel = absFret - voicing.baseFret; // 0..(fretsVisible-1) ideally
    return gridX + rel * fretGap + fretGap * 0.5;
  };

  const openMarkerX = gridX - 26;
  const baseFretLabelX = 24;

  const showNut = voicing.baseFret === 1;

  // Precompute dots (only those we can draw in the visible window)
  const dots = revealed
    ? (voicing.frets as readonly StringFret[]).flatMap((f, i) => {
        const stringIndex = i as StringIndex;

        if (f === "x") return [];
        if (!isNumberFret(f)) return [];

        if (f === 0) {
          // open marker (not a dot on the grid)
          return [];
        }

        const rel = f - voicing.baseFret;
        if (rel < 0 || rel >= fretsVisible) return []; // out of visible window

        return [
          {
            x: cellCenterXForFret(f),
            y: yForString(stringIndex),
          },
        ];
      })
    : [];

  // Barres (optional)
  const barres = revealed && voicing.barres ? voicing.barres : [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Chord diagram"
    >
      {/* Background (transparent by default; container already black) */}

      {/* Base fret label */}
      <text
        x={baseFretLabelX}
        y={gridY + gridH * 0.55}
        className="fill-neutral-500 text-[11px] tracking-[0.28em]"
      >
        {voicing.baseFret === 1 ? "OPEN" : `${voicing.baseFret}FR`}
      </text>

      {/* X / O markers (only when revealed) */}
      {revealed
        ? (voicing.frets as readonly StringFret[]).map((f, i) => {
            const stringIndex = i as StringIndex;
            const y = yForString(stringIndex);

            const label =
              f === "x" ? "×" : isNumberFret(f) && f === 0 ? "○" : "";
            if (!label) return null;

            return (
              <text
                key={`marker-${i}`}
                x={openMarkerX}
                y={y + 4}
                className="fill-neutral-500 text-[14px]"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })
        : null}

      {/* Grid: strings (horizontal) */}
      {Array.from({ length: strings }).map((_, sTopToBottom) => {
        // sTopToBottom: 0..5 (top=high e). Convert back to low-index:
        const stringIndexLowToHigh = (5 - sTopToBottom) as StringIndex;
        const y = yForString(stringIndexLowToHigh);

        return (
          <line
            key={`string-${sTopToBottom}`}
            x1={gridX}
            y1={y}
            x2={gridX + gridW}
            y2={y}
            className="stroke-neutral-700"
            strokeWidth={1}
            shapeRendering="crispEdges"
          />
        );
      })}

      {/* Grid: frets (vertical). We draw 0..fretsVisible */}
      {Array.from({ length: fretsVisible + 1 }).map((_, f) => {
        const x = gridX + f * fretGap;

        const isLeftEdge = f === 0;
        const isRightEdge = f === fretsVisible;

        // Nut (thicker left edge if baseFret==1)
        const strokeWidth = isLeftEdge && showNut ? 5 : 1;

        return (
          <line
            key={`fret-${f}`}
            x1={x}
            y1={gridY}
            x2={x}
            y2={gridY + gridH}
            className={
              isLeftEdge || isRightEdge
                ? "stroke-neutral-600"
                : "stroke-neutral-800"
            }
            strokeWidth={strokeWidth}
            shapeRendering="crispEdges"
          />
        );
      })}

      {/* Barres (draw under dots) */}
      {barres.map((b, idx) => {
        const rel = b.fret - voicing.baseFret;
        if (rel < 0 || rel >= fretsVisible) return null;

        const x = gridX + rel * fretGap + fretGap * 0.5;

        // y range from fromString..toString (low->high indices), but our y mapping handles it
        const y1 = yForString(b.fromString);
        const y2 = yForString(b.toString);

        const top = Math.min(y1, y2);
        const bottom = Math.max(y1, y2);

        return (
          <line
            key={`barre-${idx}`}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
            className="stroke-emerald-300/70"
            strokeWidth={10}
            strokeLinecap="round"
          />
        );
      })}

      {/* Dots */}
      {dots.map((d, i) => (
        <circle
          key={`dot-${i}`}
          cx={d.x}
          cy={d.y}
          r={8}
          className="fill-emerald-300 stroke-emerald-200"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
