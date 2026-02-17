import type { ChordVoicing, StringFret, StringIndex } from "../domain/voicings";
import type { Root } from "../domain/music";

type Props = {
  voicing: ChordVoicing;

  /** if false: render only the grid (no dots, no X/O, no barre) */
  revealed?: boolean;

  /** how many frets to show in the window */
  fretsVisible?: number;

  /**
   * String names low->high (index 0..5). Not hardcoded: pass in from settings later.
   * Example standard tuning: ["E", "A", "D", "G", "B", "e"]
   */
  tuning?: readonly Root[];

  className?: string;
};

const DEFAULT_TUNING: readonly Root[] = ["E", "A", "D", "G", "B", "E"];

// Marker frets (absolute fret numbers, like on real guitars)
const FRET_MARKERS: readonly number[] = [5, 7, 9, 12];

export function ChordDiagramSvg({
  voicing,
  revealed = true,
  fretsVisible: fretsVisibleProp = 14,
  tuning = DEFAULT_TUNING,
  className,
}: Props) {
  const fretsVisible = Math.max(4, Math.floor(fretsVisibleProp));

  // Layout
  const W = 680;
  const H = 190;

  const pad = 16;
  const leftLabelW = 86; // space for string labels + base fret
  const gridX = leftLabelW;
  const gridY = 28;
  const gridW = W - gridX - pad;
  const gridH = H - gridY - pad;

  const strings = 6;

  const stringGap = gridH / (strings - 1);
  const fretGap = gridW / fretsVisible;

  const yForString = (stringIndexLowToHigh: StringIndex) => {
    // show high string on top; input index is low->high (0..5)
    const fromTop = 5 - stringIndexLowToHigh;
    return gridY + fromTop * stringGap;
  };

  const isNumberFret = (f: StringFret): f is number => typeof f === "number";

  const cellCenterXForFret = (absFret: number) => {
    const rel = absFret - voicing.baseFret; // 0..fretsVisible-1
    return gridX + rel * fretGap + fretGap * 0.5;
  };

  const openMarkerX = gridX - 26;
  const baseFretLabelX = 18;
  const stringLabelX = 46;

  const showNut = voicing.baseFret === 1;

  // Dots (notes) – only in revealed mode and only inside window
  const dots = revealed
    ? (voicing.frets as readonly StringFret[]).flatMap((f, i) => {
        const stringIndex = i as StringIndex;
        if (f === "x") return [];
        if (!isNumberFret(f)) return [];
        if (f === 0) return []; // open marker, not a dot

        const rel = f - voicing.baseFret;
        if (rel < 0 || rel >= fretsVisible) return [];

        return [{ x: cellCenterXForFret(f), y: yForString(stringIndex) }];
      })
    : [];

  const barres = revealed && voicing.barres ? voicing.barres : [];

  // Fret markers (5,7,9,12) if visible in the current window
  const markerFretsInWindow = useMemoMarkers(voicing.baseFret, fretsVisible);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Chord diagram"
    >
      {/* Base fret label */}
      <text
        x={baseFretLabelX}
        y={gridY + gridH * 0.55}
        className="fill-neutral-500 text-[11px] tracking-[0.28em]"
      >
        {voicing.baseFret === 1 ? "OPEN" : `${voicing.baseFret}FR`}
      </text>

      {/* String labels (not hardcoded: from `tuning`) */}
      {(tuning.length === 6 ? tuning : DEFAULT_TUNING).map((name, i) => {
        const stringIndex = i as StringIndex;
        const y = yForString(stringIndex);

        // display top->bottom as high->low, so flip label too
        // (we render from i=0..5 but yForString flips positioning)
        const label = name === "E" && stringIndex === 5 ? "e" : name;

        return (
          <text
            key={`slabel-${i}`}
            x={stringLabelX}
            y={y + 4}
            className="fill-neutral-500 text-[12px]"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}

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

      {/* Grid: frets (vertical). lines 0..fretsVisible */}
      {Array.from({ length: fretsVisible + 1 }).map((_, f) => {
        const x = gridX + f * fretGap;
        const isLeftEdge = f === 0;
        const isRightEdge = f === fretsVisible;

        // Nut = thicker left edge only if baseFret==1
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

      {/* Fret markers (5/7/9/12) – subtle, inside the grid */}
      {markerFretsInWindow.map((absFret) => {
        const x = cellCenterXForFret(absFret);
        const cy = gridY + gridH / 2;

        const is12 = absFret % 12 === 0; // includes 12, 24...
        const r = 2.6;

        return (
          <g key={`mk-${absFret}`} opacity={0.7}>
            {is12 ? (
              <>
                <circle
                  cx={x}
                  cy={cy - 10}
                  r={r}
                  className="fill-neutral-700"
                />
                <circle
                  cx={x}
                  cy={cy + 10}
                  r={r}
                  className="fill-neutral-700"
                />
              </>
            ) : (
              <circle cx={x} cy={cy} r={r} className="fill-neutral-700" />
            )}
          </g>
        );
      })}

      {/* Barres (under dots) */}
      {barres.map((b, idx) => {
        const rel = b.fret - voicing.baseFret;
        if (rel < 0 || rel >= fretsVisible) return null;

        const x = gridX + rel * fretGap + fretGap * 0.5;

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
          r={7.5}
          className="fill-emerald-300 stroke-emerald-200"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

function useMemoMarkers(baseFret: number, fretsVisible: number): number[] {
  const start = baseFret;
  const end = baseFret + fretsVisible - 1;

  const out: number[] = [];
  for (const f of FRET_MARKERS) {
    if (f >= start && f <= end) out.push(f);
  }
  return out;
}
