import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";
import type { Colour } from "src/colours/Colour.type";

export type TaskProgressBarProps = {
  completed: number;
  cancelled: number;
  total: number;
  colour?: Colour;
  showInfoPopover?: boolean;
  className?: string;
};

const TaskProgressBarInner = ({
  completed,
  cancelled,
  total,
  colour,
}: Omit<TaskProgressBarProps, "showInfoPopover">) => {
  const resolvedColour = colour ?? colours.orange;
  const completedFraction = total > 0 ? completed / total : 0;
  const cancelledFraction = total > 0 ? cancelled / total : 0;
  const activeFraction = completedFraction + cancelledFraction;
  const activePercent = Math.round(activeFraction * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-8 text-right tabular-nums">
        {activePercent}%
      </span>
      <div className="relative w-40 h-1 rounded-full bg-slate-200 overflow-hidden">
        {cancelledFraction > 0 && (
          <div
            className="absolute inset-y-0 left-0 h-full bg-slate-400 transition-all"
            style={{
              width: `${Math.round((completedFraction + cancelledFraction) * 100)}%`,
            }}
          />
        )}
        {completedFraction > 0 && (
          <div
            className={`absolute inset-y-0 left-0 h-full transition-all ${resolvedColour.background}`}
            style={{ width: `${Math.round(completedFraction * 100)}%` }}
          />
        )}
      </div>
    </div>
  );
};

export const TaskProgressBar = ({
  completed,
  cancelled,
  total,
  colour,
  showInfoPopover = true,
  className,
}: TaskProgressBarProps) => {
  const todo = total - completed - cancelled;

  const inner = (
    <TaskProgressBarInner
      completed={completed}
      cancelled={cancelled}
      total={total}
      colour={colour}
    />
  );

  if (showInfoPopover) {
    const tooltipContent = (
      <div className="flex flex-col gap-1 min-w-28">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">To do</span>
          <span className="text-slate-100">{todo}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Completed</span>
          <span className="text-slate-100">{completed}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Cancelled</span>
          <span className="text-slate-100">{cancelled}</span>
        </div>
        <div className="mt-1 pt-1 border-t border-slate-600 flex justify-between gap-4">
          <span className="text-slate-300">Total</span>
          <span className="text-slate-100">{total}</span>
        </div>
      </div>
    );

    return (
      <Tooltip content={tooltipContent}>
        <div className={cn("flex items-center", className)}>{inner}</div>
      </Tooltip>
    );
  }

  return <div className={cn("flex items-center", className)}>{inner}</div>;
};
