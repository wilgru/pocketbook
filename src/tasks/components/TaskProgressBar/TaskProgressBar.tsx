import * as Popover from "@radix-ui/react-popover";
import { colours } from "src/colours/colours.constant";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import type { Colour } from "src/colours/Colour.type";

export type TaskProgressBarProps = {
  completed: number;
  cancelled: number;
  total: number;
  colour?: Colour;
  showInfoPopover?: boolean;
};

const TaskProgressBarInner = ({
  completed,
  cancelled,
  total,
  colour,
}: Omit<TaskProgressBarProps, "showInfoPopover">) => {
  const resolvedColour = colour ?? colours.orange;
  const activeFraction = total > 0 ? (completed + cancelled) / total : 0;
  const activePercent = Math.round(activeFraction * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500 w-8 text-right tabular-nums">
        {activePercent}%
      </span>
      <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${resolvedColour.background}`}
          style={{ width: `${activePercent}%` }}
        />
      </div>
    </div>
  );
};

const TaskProgressBarInfoPopover = ({
  completed,
  cancelled,
  total,
  colour,
  children,
}: Omit<TaskProgressBarProps, "showInfoPopover"> & {
  children: React.ReactNode;
}) => {
  const resolvedColour = colour ?? colours.orange;
  const todo = total - completed - cancelled;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50"
          sideOffset={6}
          align="center"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ControlPopover className="p-3">
            <div className="flex flex-col gap-1 text-xs text-slate-600 min-w-28">
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
              <div className="mt-1 pt-1 border-t border-slate-100 flex justify-between gap-4">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">{total}</span>
              </div>
            </div>
          </ControlPopover>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const TaskProgressBar = ({
  completed,
  cancelled,
  total,
  colour,
  showInfoPopover = true,
}: TaskProgressBarProps) => {
  const inner = (
    <TaskProgressBarInner
      completed={completed}
      cancelled={cancelled}
      total={total}
      colour={colour}
    />
  );

  if (showInfoPopover) {
    return (
      <TaskProgressBarInfoPopover
        completed={completed}
        cancelled={cancelled}
        total={total}
        colour={colour}
      >
        <button
          type="button"
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Show task progress details"
        >
          {inner}
        </button>
      </TaskProgressBarInfoPopover>
    );
  }

  return <div className="flex items-center">{inner}</div>;
};
