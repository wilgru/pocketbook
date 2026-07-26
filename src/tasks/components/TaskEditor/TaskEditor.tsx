import dayjs from "dayjs";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { colours } from "src/colours/colours.constant";
import {
  defaultTaskToolbarAtom,
  taskToolbarAtom,
} from "src/common/atoms/taskToolbarAtom";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import { useDebouncedCallback } from "use-debounce";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/Task.type";

type TaskEditorProps = {
  task?: Partial<Task>;
  onSave?: () => void;
  onCreate?: (task: Task) => void;
  onCreateNextTask?: () => void | Promise<void>;
  autoFocusTitle?: boolean;
  onAutoFocusComplete?: () => void;
  colour?: Colour;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

const getInitialTask = (task: Partial<Task> | undefined): Task => {
  return {
    id: task?.id || "",
    title: task?.title || "",
    description: task?.description || "",
    note: task?.note || null,
    link: task?.link || null,
    links: task?.links || [],
    dueDate: task?.dueDate || null,
    completedDate: task?.completedDate || null,
    cancelledDate: task?.cancelledDate || null,
    isImportant: task?.isImportant || false,
    sortOrder: task?.sortOrder ?? 0,
    created: task?.created || dayjs(),
    updated: task?.updated || dayjs(),
  };
};

export const TaskEditor = ({
  task,
  onSave,
  onCreate,
  onCreateNextTask,
  autoFocusTitle = false,
  onAutoFocusComplete,
  colour = colours.orange,
}: TaskEditorProps) => {
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();

  const [taskToolbar, setTaskToolbarAtom] = useAtom(taskToolbarAtom);

  const [editedTask, setEditedTask] = useState<Task>(getInitialTask(task));
  const titleRef = useAutoResize(editedTask.title);
  const descriptionRef = useAutoResize(editedTask.description);

  const debouncedSave = useDebouncedCallback(async () => {
    if (!editedTask.title && !editedTask.description && !editedTask.id) {
      return;
    }

    if (editedTask.id) {
      updateTask({
        taskId: editedTask.id,
        updateTaskData: editedTask,
        includeSortOrder: false,
      });
      onSave?.();
    } else {
      const newTask = await createTask({ createTaskData: editedTask });

      if (newTask) {
        setEditedTask((prev) => ({ ...prev, id: newTask.id }));
        onCreate?.(newTask);
      }
    }
  }, 500);

  const onUpdateTask = useCallback(
    (updateTaskData?: Partial<Task>) => {
      setEditedTask((currentEditedTask) => ({
        ...currentEditedTask,
        ...updateTaskData,
      }));

      debouncedSave();
    },
    [debouncedSave],
  );

  const onFocusTask = () => {
    setTaskToolbarAtom((current) => ({
      ...current,
      task: editedTask,
      refocusRef: titleRef,
      onUpdateTask,
      colour,
      isVisible: true,
    }));
  };

  const onBlurTask = () => {
    if (taskToolbar.isToolbarBusy) {
      return;
    }

    debouncedSave.flush();
    setTaskToolbarAtom(defaultTaskToolbarAtom);
  };

  const onCheckCircleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const wasCompleted = !!editedTask.completedDate;
    const wasCancelled = !!editedTask.cancelledDate;

    const wasDoubleClick = e.detail === 2;

    if (wasDoubleClick) {
      onUpdateTask({ completedDate: null, cancelledDate: dayjs() });
      return;
    }

    if (wasCancelled || wasCompleted) {
      onUpdateTask({ completedDate: null, cancelledDate: null });
    } else {
      onUpdateTask({ completedDate: dayjs(), cancelledDate: null });
    }
  };

  const isCompleted = !!editedTask.completedDate;
  const isCancelled = !!editedTask.cancelledDate;
  const showDescription = !!editedTask.description;

  const isDueDateOverdue =
    !!editedTask.dueDate &&
    editedTask.dueDate.isBefore(dayjs(), "day") &&
    !isCompleted &&
    !isCancelled;

  // Auto-focus title once for newly created tasks.
  useEffect(() => {
    if (!autoFocusTitle || titleRef.current === document.activeElement) {
      return;
    }

    titleRef.current?.focus();
    onAutoFocusComplete?.();
  }, [autoFocusTitle, onAutoFocusComplete, titleRef]);

  // Update the task in the toolbar if the edited task changes to keep the toolbar in sync with the latest changes.
  useEffect(() => {
    if (editedTask.id === taskToolbar?.task?.id) {
      setTaskToolbarAtom((current) => ({
        ...current,
        task: editedTask,
      }));
    }
  }, [editedTask, setTaskToolbarAtom, taskToolbar?.task?.id]);

  return (
    <div className="w-full flex gap-1 items-start">
      <button
        className="pt-[3px] pl-px"
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={onCheckCircleClick}
      >
        <Icon
          iconName={
            isCompleted ? "checkCircle" : isCancelled ? "xCircle" : "circle"
          }
          size="sm"
          weight={isCompleted || isCancelled ? "fill" : "regular"}
          className={cn(
            "transition-colors",
            isCompleted && !isCancelled
              ? cn(colour.text, colour.textPillInverted)
              : "text-slate-400 hover:text-slate-600",
          )}
        />
      </button>

      <div className="w-full flex-col items-start">
        <div className="flex justify-between items-start">
          <textarea
            ref={titleRef}
            rows={1}
            name="title"
            value={editedTask.title ?? ""}
            placeholder="No Title"
            onFocus={onFocusTask}
            onBlur={onBlurTask}
            onKeyDown={async (e) => {
              if (e.key !== "Enter" || e.shiftKey) {
                return;
              }

              e.preventDefault();
              debouncedSave.flush();
              await onCreateNextTask?.();
            }}
            onChange={(e) =>
              onUpdateTask({
                title: e.target.value,
              })
            }
            className={cn(
              "flex-1 tracking-tight text-md bg-transparent placeholder-slate-400 select-none resize-none outline-none",
              isCompleted || isCancelled
                ? "text-slate-500"
                : editedTask.isImportant
                  ? "text-red-500"
                  : "text-slate-700",
              isCancelled && "line-through",
            )}
          />

          <div className="flex flex-row flex-wrap items-center gap-2 pl-1">
            {editedTask.links.map((link) => (
              <LinkPill key={link.id} link={link} colour={colour} />
            ))}

            {editedTask.isImportant && (
              <Icon
                iconName="warningCircle"
                size="sm"
                className={cn(
                  "mt-0.5",
                  isCompleted ? "text-slate-400" : "text-red-500",
                )}
              />
            )}

            {!!editedTask.dueDate && (
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  isDueDateOverdue
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {editedTask.dueDate.format("MMM D, YYYY")}
              </span>
            )}
          </div>
        </div>

        {showDescription && (
          <textarea
            ref={descriptionRef}
            rows={1}
            name="description"
            value={editedTask.description ?? ""}
            placeholder="No description"
            onFocus={onFocusTask}
            onBlur={onBlurTask}
            onChange={(e) =>
              onUpdateTask({
                description: e.target.value,
              })
            }
            className={cn(
              "w-full text-[13px] font-normal bg-transparent placeholder-slate-400 select-none resize-none outline-none",
              isCompleted || isCancelled ? "text-slate-400" : "text-slate-500",
            )}
          />
        )}
      </div>
    </div>
  );
};
