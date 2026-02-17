import type { ChordVoicing, StringFret, StringIndex } from "../domain/voicings";
import type { Root } from "../domain/music";

type Props = {
  voicing: ChordVoicing;
  /** if false: render only the grid (no dots, no X/O, no barre, no markers) */
  revealed?: boolean;
  /** how many frets to show in the window */
  fretsVisible?: number;
  /**
   * String names low->high (index 0..5). Not hardcoded: pass in from settings later.
   * Example standard tuning: ["E", "A", "D", "G", "B", "E"]
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
  const H = 220; // ↑ was 190: extra room for bottom numbers
  const pad = 16;

  const leftLabelW = 86; // string labels + base fret
  const gridX = leftLabelW;
  const gridY = 28;

  const bottomLabelH = 28; // reserved space for fret marker numbers
  const gridW = W - gridX - pad;
  const gridH = H - gridY - pad - bottomLabelH;

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
  const markerFretsInWindow = markersInWindow(voicing.baseFret, fretsVisible);

  const tuningToUse = tuning.length === 6 ? tuning : DEFAULT_TUNING;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Base fret label */}
      <text
        x={baseFretLabelX}
        y={gridY - 8}
        fontSize="11"
        letterSpacing="0.28em"
        fill="rgba(255,255,255,0.38)"
      >
        {voicing.baseFret === 1 ? "OPEN" : `${voicing.baseFret}FR`}
      </text>

      {/* String labels (not hardcoded: from `tuning`) */}
      {tuningToUse.map((name, i) => {
        const stringIndex = i as StringIndex;
        const y = yForString(stringIndex);
        return (
          <text
            key={i}
            x={stringLabelX}
            y={y + 4}
            fontSize="12"
            letterSpacing="0.22em"
            fill="rgba(255,255,255,0.42)"
          >
            {name}
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
                key={`xo-${i}`}
                x={openMarkerX}
                y={y + 4}
                fontSize="12"
                fill="rgba(255,255,255,0.38)"
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
            key={`s-${sTopToBottom}`}
            x1={gridX}
            y1={y}
            x2={gridX + gridW}
            y2={y}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />
        );
      })}

      {/* Grid: frets (vertical). lines 0..fretsVisible */}
      {Array.from({ length: fretsVisible + 1 }).map((_, f) => {
        const x = gridX + f * fretGap;
        const isLeftEdge = f === 0;

        // Nut = thicker left edge only if baseFret==1
        const strokeWidth = isLeftEdge && showNut ? 5 : 1;

        return (
          <line
            key={`f-${f}`}
            x1={x}
            y1={gridY}
            x2={x}
            y2={gridY + gridH}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={strokeWidth}
          />
        );
      })}

      {/* Fret markers (5/7/9/12) – subtle dots inside the grid */}
      {revealed
        ? markerFretsInWindow.map((absFret) => {
            const x = cellCenterXForFret(absFret);
            const cy = gridY + gridH / 2;
            const is12 = absFret % 12 === 0;

            const r = 2.6;
            const fill = "rgba(255,255,255,0.22)";

            return (
              <g key={`m-${absFret}`}>
                {is12 ? (
                  <>
                    <circle cx={x} cy={cy - 9} r={r} fill={fill} />
                    <circle cx={x} cy={cy + 9} r={r} fill={fill} />
                  </>
                ) : (
                  <circle cx={x} cy={cy} r={r} fill={fill} />
                )}
              </g>
            );
          })
        : null}

      {/* Fret marker numbers (below the grid) */}
      {markerFretsInWindow.map((absFret) => {
        const x = cellCenterXForFret(absFret);
        const y = gridY + gridH + 20; // inside the SVG now (no clipping)
        return (
          <text
            key={`mn-${absFret}`}
            x={x}
            y={y}
            textAnchor="middle"
            fontSize="12"
            letterSpacing="0.14em"
            fill="rgba(255,255,255,0.26)"
          >
            {absFret}
          </text>
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
            stroke="rgba(16,185,129,0.35)" // emerald-ish
            strokeWidth={6}
            strokeLinecap="round"
          />
        );
      })}

      {/* Dots */}
      {dots.map((d, i) => (
        <circle
          key={`d-${i}`}
          cx={d.x}
          cy={d.y}
          r={6.2}
          fill="rgba(16,185,129,0.70)"
          stroke="rgba(16,185,129,0.15)"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

function markersInWindow(baseFret: number, fretsVisible: number): number[] {
  const start = baseFret;
  const end = baseFret + fretsVisible - 1;

  const out: number[] = [];
  for (const f of FRET_MARKERS) {
    if (f >= start && f <= end) out.push(f);
  }
  return out;
}
