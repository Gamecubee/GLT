import type { ChordVoicing, StringFret } from "../domain/voicings";

type Props = {
  voicing: ChordVoicing;
  className?: string;
  // number of frets to show in the diagram window
  fretCount?: number; // default 5
};

const STRINGS = 6 as const;

function isNumberFret(f: StringFret): f is number {
  return typeof f === "number";
}

export function ChordDiagramSvg({ voicing, className, fretCount = 5 }: Props) {
  // Geometry (tweak later for TE vibe)
  const W = 220;
  const H = 180;

  const padX = 18;
  const padTop = 22;
  const padBottom = 18;

  const nutOrTopFretHeight = 10; // space for X/O
  const gridTop = padTop + nutOrTopFretHeight;
  const gridBottom = H - padBottom;

  const gridLeft = padX;
  const gridRight = W - padX;

  const gridWidth = gridRight - gridLeft;
  const gridHeight = gridBottom - gridTop;

  const stringGap = gridWidth / (STRINGS - 1);
  const fretGap = gridHeight / fretCount;

  const baseFret = voicing.baseFret;

  // Helpers: x for string index, y for fret number
  const xForString = (s: number) => gridLeft + s * stringGap;

  // Fret lines are drawn at: 0..fretCount
  const yForFretLine = (i: number) => gridTop + i * fretGap;

  // Dot center for an absolute fret number f:
  // - if f === 0 => open (not a dot)
  // - otherwise dot is centered in the cell corresponding to that fret
  const yForFretDot = (absoluteFret: number) => {
    const rel = absoluteFret - baseFret; // 0..(fretCount-1) ideally
    return gridTop + rel * fretGap + fretGap / 2;
  };

  // Top markers X/O
  const topMarkerY = padTop + 8;

  // Styles (keep simple; we'll theme later)
  const stroke = "#262626"; // neutral-800-ish
  const text = "#d4d4d4"; // neutral-300-ish

  // Determine visible window
  const minVisibleFret = baseFret;
  const maxVisibleFret = baseFret + fretCount - 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label="Chord diagram"
    >
      {/* Base fret label */}
      {baseFret > 1 ? (
        <text
          x={gridLeft - 10}
          y={gridTop + fretGap / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="10"
          fill={text}
        >
          {baseFret}fr
        </text>
      ) : null}

      {/* X/O markers */}
      {voicing.frets.map((f, i) => {
        const x = xForString(i);
        let label: string | null = null;
        if (f === "x") label = "X";
        else if (f === 0) label = "O";
        else label = null;

        return label ? (
          <text
            key={`m-${i}`}
            x={x}
            y={topMarkerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill={text}
          >
            {label}
          </text>
        ) : null;
      })}

      {/* Strings (vertical lines) */}
      {Array.from({ length: STRINGS }).map((_, s) => (
        <line
          key={`s-${s}`}
          x1={xForString(s)}
          y1={gridTop}
          x2={xForString(s)}
          y2={gridBottom}
          stroke={stroke}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Frets (horizontal lines). Draw fretCount+1 lines to create fretCount cells */}
      {Array.from({ length: fretCount + 1 }).map((_, i) => (
        <line
          key={`f-${i}`}
          x1={gridLeft}
          y1={yForFretLine(i)}
          x2={gridRight}
          y2={yForFretLine(i)}
          stroke={stroke}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Nut (thicker) only if baseFret === 1 */}
      {baseFret === 1 ? (
        <line
          x1={gridLeft}
          y1={gridTop}
          x2={gridRight}
          y2={gridTop}
          stroke={text}
          strokeWidth={3}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {/* Barres */}
      {voicing.barres?.map((b, idx) => {
        // Only draw if within visible window
        if (b.fret < minVisibleFret || b.fret > maxVisibleFret) return null;

        const y = yForFretDot(b.fret);
        const x1 = xForString(b.fromString);
        const x2 = xForString(b.toString);

        return (
          <line
            key={`barre-${idx}`}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={text}
            strokeWidth={6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.85}
          />
        );
      })}

      {/* Dots */}
      {voicing.frets.map((f, i) => {
        if (!isNumberFret(f)) return null;
        if (f === 0) return null;
        if (f < minVisibleFret || f > maxVisibleFret) return null;

        const x = xForString(i);
        const y = yForFretDot(f);

        return (
          <g key={`d-${i}`}>
            <circle cx={x} cy={y} r={7} fill={text} opacity={0.95} />
            {/* Optional finger label */}
            {voicing.fingers?.[i] ? (
              <text
                x={x}
                y={y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fill="#0a0a0a"
              >
                {voicing.fingers[i]}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
