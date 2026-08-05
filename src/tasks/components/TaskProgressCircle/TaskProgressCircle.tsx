import { colours } from "src/colours/colours.constant";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";
import { getColourHex } from "src/colours/utils/getColourHex";
import type { Colour } from "src/colours/Colour.type";

export type TaskProgressCircleProps = {
  completed: number;
  cancelled: number;
  total: number;
  colour?: Colour;
  size?: number;
  showInfoPopover?: boolean;
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

type CircleSvgProps = Pick<
  TaskProgressCircleProps,
  "completed" | "cancelled" | "total" | "colour" | "size"
>;

const CircleSvg = ({
  completed,
  cancelled,
  total,
  colour,
  size = 36,
}: CircleSvgProps) => {
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

const TaskProgressCircleInfoTooltip = ({
  completed,
  cancelled,
  total,
  colour,
  children,
}: Omit<TaskProgressCircleProps, "size" | "showInfoPopover"> & {
  children: React.ReactNode;
}) => {
  const resolvedColour = colour ?? colours.orange;
  const todo = total - completed - cancelled;

  const tooltipContent = (
    <div className="flex flex-col gap-1 min-w-28">
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Todo</span>
        <span className="font-medium">{todo}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className={resolvedColour.primary.text}>Completed</span>
        <span className="font-medium">{completed}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Cancelled</span>
        <span className="font-medium">{cancelled}</span>
      </div>
      <div className="mt-1 pt-1 border-t border-slate-600 flex justify-between gap-4">
        <span className="text-slate-300">Total</span>
        <span className="font-medium">{total}</span>
      </div>
    </div>
  );

  return <Tooltip content={tooltipContent}>{children}</Tooltip>;
};

export const TaskProgressCircle = ({
  completed,
  cancelled,
  total,
  colour,
  size = 36,
  showInfoPopover = false,
}: TaskProgressCircleProps) => {
  const svg = (
    <CircleSvg
      completed={completed}
      cancelled={cancelled}
      total={total}
      colour={colour}
      size={size}
    />
  );

  if (showInfoPopover) {
    return (
      <TaskProgressCircleInfoTooltip
        completed={completed}
        cancelled={cancelled}
        total={total}
        colour={colour}
      >
        <div className="flex items-center">{svg}</div>
      </TaskProgressCircleInfoTooltip>
    );
  }

  return <div className="flex items-center">{svg}</div>;
};
