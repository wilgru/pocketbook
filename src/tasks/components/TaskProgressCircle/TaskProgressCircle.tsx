import { colours } from "src/colours/colours.constant";
import { getColourHex } from "src/colours/utils/getColourHex";
import type { Colour } from "src/colours/Colour.type";

export type TaskProgressCircleProps = {
  completed: number;
  cancelled: number;
  total: number;
  colour?: Colour;
  size?: number;
};

const TRACK_COLOUR = "#e2e8f0";

/**
 * Computes the (x, y) point on the circle at the given angle (in radians),
 * where 0 is the top (12 o'clock position).
 */
const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): [number, number] => {
  // SVG angles: 0 = 3 o'clock, rotate so 0 = 12 o'clock by subtracting π/2
  const adjusted = angleRad - Math.PI / 2;
  return [cx + r * Math.cos(adjusted), cy + r * Math.sin(adjusted)];
};

/**
 * Builds an SVG pie-slice path from startAngle to endAngle (in radians).
 * Returns null when the slice covers the full circle (100%) to avoid
 * degenerate path calculations.
 */
const buildPieSlicePath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string | null => {
  const fullCircle = Math.abs(endAngle - startAngle) >= 2 * Math.PI - 0.0001;
  if (fullCircle) {
    return null;
  }

  const [startX, startY] = polarToCartesian(cx, cy, r, startAngle);
  const [endX, endY] = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${startX} ${startY}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`,
    "Z",
  ].join(" ");
};

export const TaskProgressCircle = ({
  completed,
  cancelled,
  total,
  colour,
  size = 36,
}: TaskProgressCircleProps) => {
  const resolvedColour = colour ?? colours.orange;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const activeFraction = total > 0 ? (completed + cancelled) / total : 0;
  const activeAngle = activeFraction * 2 * Math.PI;
  const activeColour = getColourHex(resolvedColour);

  const slicePath = buildPieSlicePath(cx, cy, r, 0, activeAngle);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`${Math.round(activeFraction * 100)}% complete`}
      role="img"
    >
      {/* Background circle (track) */}
      <circle cx={cx} cy={cy} r={r} fill={TRACK_COLOUR} />

      {/* Active pie slice */}
      {activeFraction > 0 &&
        (slicePath ? (
          <path d={slicePath} fill={activeColour} />
        ) : (
          /* Full circle: render as a circle instead of a degenerate path */
          <circle cx={cx} cy={cy} r={r} fill={activeColour} />
        ))}
    </svg>
  );
};
