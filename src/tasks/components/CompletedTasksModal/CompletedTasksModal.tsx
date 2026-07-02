import * as Dialog from "@radix-ui/react-dialog";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
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
    <Dialog.Portal>
      <Dialog.Overlay className="bg-black opacity-25 fixed inset-0 data-[state=open]:animate-overlayShow" />
      <Dialog.Content
        className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] overflow-y-scroll p-4 focus:outline-none bg-white border border-slate-300 rounded-2xl shadow-2xl data-[state=open]:animate-contentShow"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Dialog.Title className="mb-5 font-title text-xl">Done</Dialog.Title>

        <div className="flex flex-col gap-2">
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

        <div className="flex justify-end mt-5">
          <Dialog.Close asChild>
            <Button aria-label="Close" size="sm" colour={colour}>
              Close
            </Button>
          </Dialog.Close>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};
