import { Close } from "@radix-ui/react-dialog";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { Dialog } from "src/common/components/Dialog/Dialog";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/Task.type";

type CompletedTasksModalProps = {
  tasks: Task[];
  colour?: Colour;
};

export const CompletedTasksModal = ({
  tasks,
  colour = colours.orange,
}: CompletedTasksModalProps) => {
  return (
    <Dialog
      title="Done"
      className="w-200 h-150"
      bodyScrollable
      footer={
        <div className="flex justify-end">
          <Close asChild>
            <Button aria-label="Close" size="sm" colour={colour}>
              Close
            </Button>
          </Close>
        </div>
      }
    >
      <div className="flex flex-col gap-2 p-3">
        {tasks.length === 0 && (
          <p className="text-slate-400 text-sm py-2">
            No tasks completed or cancelled.
          </p>
        )}

        {tasks.map((task) => {
          const isCompleted = !!task.completedDate;
          const isCancelled = !!task.cancelledDate;
          const timestamp =
            (task.completedDate ?? task.cancelledDate)?.format(
              "DD MMM, h:mm A",
            ) ?? "";

          return (
            <div key={task.id} className="flex items-start gap-2 py-1">
              <Icon
                iconName={isCompleted ? "checkCircle" : "xCircle"}
                size="md"
                weight="fill"
                className={cn(
                  "mt-px shrink-0",
                  isCompleted ? colour.text : "text-slate-400",
                )}
              />
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-md text-slate-600 leading-snug",
                    isCancelled && "line-through text-slate-400",
                  )}
                >
                  {task.title || "No Title"}
                </span>
                <span className="text-xs text-slate-400">{timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
};
