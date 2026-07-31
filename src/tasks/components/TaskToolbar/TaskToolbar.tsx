import { useAtom } from "jotai";
import { useCallback } from "react";
import { colours } from "src/colours/colours.constant";
import { taskToolbarAtom } from "src/common/atoms/taskToolbarAtom";
import { Button } from "src/common/components/Button/Button";
import { LinksPopover } from "src/common/components/LinksPopover/LinksPopover";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";
import { useDeleteTask } from "src/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import type { Task } from "src/tasks/Task.type";

export const TaskToolbar = () => {
  const { deleteTask } = useDeleteTask();
  const { updateTask } = useUpdateTask();

  const [atom, setTaskToolbarAtom] = useAtom(taskToolbarAtom);
  const { task, tasksForSorting, onUpdateTask, colour, refocusRef } = atom;

  const handlePopoverOpenChange = (open: boolean) => {
    setTaskToolbarAtom((current) => ({ ...current, isToolbarBusy: open }));

    if (!open) {
      refocusRef?.current?.focus();
    }
  };

  // have to use updateTask instead of onUpdateTask here because we need to update the sortOrder of both tasks, separately
  const swapTaskOrder = useCallback(
    (taskA: Task, taskB: Task) => {
      console.log("Swapping task order", taskA, taskB);

      updateTask({
        taskId: taskA.id,
        updateTaskData: { ...taskA, sortOrder: taskB.sortOrder },
      });
      updateTask({
        taskId: taskB.id,
        updateTaskData: { ...taskB, sortOrder: taskA.sortOrder },
      });
    },
    [updateTask],
  );

  const toolbarColour = colour ?? colours.orange;

  if (!task || !tasksForSorting) {
    return null;
  }

  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row gap-1 border-r-2 pr-1 border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          iconName="caretUp"
          colour={toolbarColour}
          onClick={() =>
            task.sortOrder > 0
              ? swapTaskOrder(
                  task,
                  tasksForSorting.find(
                    (t) => t.sortOrder === task.sortOrder - 1,
                  )!,
                )
              : undefined
          }
          disabled={task.sortOrder === 0}
        />
        <Button
          variant="ghost"
          size="sm"
          iconName="caretDown"
          colour={toolbarColour}
          onClick={() =>
            task.sortOrder < tasksForSorting.length - 1
              ? swapTaskOrder(
                  task,
                  tasksForSorting.find(
                    (t) => t.sortOrder === task.sortOrder + 1,
                  )!,
                )
              : undefined
          }
          disabled={task.sortOrder >= tasksForSorting.length - 1}
        />
      </div>

      <div className="flex flex-row gap-1 border-r-2 px-1 border-slate-100">
        <Toggle
          isToggled={task.isImportant}
          size="sm"
          colour={colours.red}
          onClick={() =>
            onUpdateTask?.({
              isImportant: !task.isImportant,
            })
          }
          iconName="warningCircle"
        />

        <LinksPopover
          links={task.links}
          colour={toolbarColour}
          onChange={(links) => {
            onUpdateTask?.({
              links: links,
            });
          }}
          onOpenChange={handlePopoverOpenChange}
        />

        <NoteSelect
          mode="single"
          selectedNotes={task.note ? [task.note] : []}
          showPlaceholderText={false}
          colour={toolbarColour}
          onChange={(notes) => {
            onUpdateTask?.({
              note: notes[0] ?? null,
            });
            handlePopoverOpenChange(false);
          }}
          onOpenChange={handlePopoverOpenChange}
        />

        <TaskDatePicker
          dueDate={task.dueDate}
          colour={toolbarColour}
          isCompleted={!!task.completedDate}
          isCancelled={!!task.cancelledDate}
          onChange={(date) => {
            onUpdateTask?.({
              dueDate: date,
            });
            handlePopoverOpenChange(false);
          }}
          onOpenChange={handlePopoverOpenChange}
        />
      </div>

      <div className="flex flex-row gap-1 pl-1">
        <Button
          variant="ghost"
          size="sm"
          iconName="trash"
          colour={colours.red}
          onClick={() => {
            deleteTask({ taskId: task.id });
            setTaskToolbarAtom((current) => ({
              ...current,
              task: null,
              isVisible: false,
            }));
          }}
        />
      </div>
    </div>
  );
};
