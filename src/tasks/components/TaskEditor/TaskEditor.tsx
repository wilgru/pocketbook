import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { LinksPopover } from "src/common/components/LinksPopover/LinksPopover";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { TaskBlockerPopover } from "src/tasks/components/TaskBlockerPopover/TaskBlockerPopover";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDeleteTask } from "src/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import { useDebouncedCallback } from "use-debounce";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/Task.type";

type TaskEditorProps = {
  task?: Partial<Task>;
  tasksForSorting?: Task[];
  onSave?: () => void;
  onCreate?: (task: Task) => void;
  onCreateNextTask?: () => void | Promise<void>;
  autoFocusTitle?: boolean;
  onAutoFocusComplete?: () => void;
  colour?: Colour;
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
    blockedComment: task?.blockedComment || null,
    blockedDate: task?.blockedDate || null,
    isImportant: task?.isImportant || false,
    sortOrder: task?.sortOrder ?? 0,
    created: task?.created || dayjs(),
    updated: task?.updated || dayjs(),
  };
};

export const TaskEditor = ({
  task,
  tasksForSorting,
  onSave,
  onCreate,
  onCreateNextTask,
  autoFocusTitle = false,
  onAutoFocusComplete,
  colour = colours.orange,
}: TaskEditorProps) => {
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();

  const [editedTask, setEditedTask] = useState<Task>(getInitialTask(task));
  const [sortOrderOverrides, setSortOrderOverrides] = useState<
    Record<string, number>
  >({});
  const [isFocused, setIsFocused] = useState(false);
  const [isControlsBusy, setIsControlsBusy] = useState(false);
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

  const sortingTasks = useMemo(
    () =>
      (tasksForSorting ?? [])
        .map((currentTask) => ({
          ...currentTask,
          sortOrder:
            sortOrderOverrides[currentTask.id] ?? currentTask.sortOrder,
        }))
        .sort((taskA, taskB) => taskA.sortOrder - taskB.sortOrder),
    [tasksForSorting, sortOrderOverrides],
  );

  const swapTaskOrder = useCallback(
    (taskA: Task, taskB: Task) => {
      const taskASortOrder = sortOrderOverrides[taskA.id] ?? taskA.sortOrder;
      const taskBSortOrder = sortOrderOverrides[taskB.id] ?? taskB.sortOrder;

      updateTask({
        taskId: taskA.id,
        updateTaskData: { ...taskA, sortOrder: taskBSortOrder },
      });
      updateTask({
        taskId: taskB.id,
        updateTaskData: { ...taskB, sortOrder: taskASortOrder },
      });

      setSortOrderOverrides((currentOverrides) => ({
        ...currentOverrides,
        [taskA.id]: taskBSortOrder,
        [taskB.id]: taskASortOrder,
      }));
    },
    [sortOrderOverrides, updateTask],
  );

  const handlePopoverOpenChange = (open: boolean) => {
    setIsControlsBusy(open);

    if (!open) {
      titleRef.current?.focus();
    }
  };

  const moveTask = (direction: -1 | 1) => {
    const taskIndex = sortingTasks.findIndex(
      (currentTask) => currentTask.id === editedTask.id,
    );
    const adjacentTask = sortingTasks[taskIndex + direction];

    if (taskIndex === -1 || !adjacentTask) {
      return;
    }

    swapTaskOrder(sortingTasks[taskIndex], adjacentTask);
  };

  // Auto-focus title once for newly created tasks.
  useEffect(() => {
    if (!autoFocusTitle || titleRef.current === document.activeElement) {
      return;
    }

    titleRef.current?.focus();
    onAutoFocusComplete?.();
  }, [autoFocusTitle, onAutoFocusComplete, titleRef]);

  const isCompleted = !!editedTask.completedDate;
  const isCancelled = !!editedTask.cancelledDate;
  const isBlocked = !!editedTask.blockedComment;

  const isDueDateOverdue =
    !!editedTask.dueDate &&
    editedTask.dueDate.isBefore(dayjs(), "day") &&
    !isCompleted &&
    !isCancelled;

  const showDescription = isFocused || !!editedTask.description;
  const showTaskControls = isFocused && !!editedTask.id;

  return (
    <div
      className="w-full flex gap-2 items-start"
      onFocus={() => {
        setIsFocused(true);
      }}
      onBlur={(e) => {
        const taskEditorRoot = e.currentTarget;
        setTimeout(() => {
          if (
            taskEditorRoot.contains(document.activeElement) ||
            isControlsBusy
          ) {
            return;
          }

          debouncedSave.flush();
          setSortOrderOverrides({});
          setIsFocused(false);
        }, 0);
      }}
    >
      {isBlocked ? (
        <Tooltip
          content={
            <div className="flex flex-col gap-1">
              <p className="text-slate-200">{editedTask.blockedComment}</p>
              <p className="mt-1 pt-1 border-t border-slate-600 flex justify-between gap-4 text-slate-400 italic text-xs">
                Click to unblock
              </p>
            </div>
          }
        >
          <button
            className="pt-0.75 pl-px"
            aria-label="Remove blocker"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() =>
              onUpdateTask({ blockedComment: null, blockedDate: null })
            }
          >
            <Icon
              iconName="handPalm"
              weight="regular"
              size="sm"
              className="text-orange-400 hover:text-orange-600 transition-colors"
            />
          </button>
        </Tooltip>
      ) : (
        <button
          className="pt-0.75 pl-px"
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
                ? cn(colour.text, colour.primary.textHovered)
                : "text-slate-400 hover:text-slate-600",
            )}
          />
        </button>
      )}

      <div className="w-full flex-col items-start">
        <div className="flex justify-between items-start">
          <textarea
            ref={titleRef}
            rows={1}
            name="title"
            value={editedTask.title ?? ""}
            placeholder="No Title"
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
              "flex-1 tracking-tight text-sm pt-0.5 bg-transparent placeholder-slate-400 select-none resize-none outline-hidden",
              isCompleted || isCancelled
                ? "text-slate-500"
                : editedTask.isImportant
                  ? "text-red-500"
                  : "text-slate-700",
              isCancelled && "line-through",
            )}
          />

          {!showTaskControls && (
            <div className="flex flex-row flex-wrap items-center gap-1 pl-1">
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
          )}
        </div>

        {showDescription && (
          <textarea
            ref={descriptionRef}
            rows={1}
            name="description"
            value={editedTask.description ?? ""}
            placeholder="No description"
            onChange={(e) =>
              onUpdateTask({
                description: e.target.value,
              })
            }
            className={cn(
              "-mb-0.5 w-full text-[13px] font-normal bg-transparent placeholder-slate-400 select-none resize-none outline-hidden",
              isCompleted || isCancelled ? "text-slate-400" : "text-slate-500",
            )}
          />
        )}
        {showTaskControls && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              iconName="caretUp"
              colour={colour}
              onClick={() => moveTask(-1)}
              disabled={
                sortingTasks.findIndex(
                  (currentTask) => currentTask.id === editedTask.id,
                ) <= 0
              }
            />

            <Button
              variant="ghost"
              size="xs"
              iconName="caretDown"
              colour={colour}
              onClick={() => moveTask(1)}
              disabled={
                sortingTasks.findIndex(
                  (currentTask) => currentTask.id === editedTask.id,
                ) ===
                sortingTasks.length - 1
              }
            />

            <Toggle
              isToggled={editedTask.isImportant}
              size="xs"
              colour={colours.red}
              onClick={() =>
                onUpdateTask({
                  isImportant: !editedTask.isImportant,
                })
              }
              iconName="warningCircle"
            />

            <TaskBlockerPopover
              blockedComment={editedTask.blockedComment}
              onChange={(blockedComment) => {
                onUpdateTask({
                  blockedComment,
                  blockedDate: blockedComment ? dayjs() : null,
                });
              }}
              onOpenChange={handlePopoverOpenChange}
            />

            <LinksPopover
              links={editedTask.links}
              colour={colour}
              onChange={(links) =>
                onUpdateTask({
                  links,
                })
              }
              onOpenChange={handlePopoverOpenChange}
            />

            <NoteSelect
              mode="single"
              selectedNotes={editedTask.note ? [editedTask.note] : []}
              colour={colour}
              onChange={(notes) => {
                onUpdateTask({
                  note: notes[0] ?? null,
                });
                handlePopoverOpenChange(false);
              }}
              onOpenChange={handlePopoverOpenChange}
            />

            <TaskDatePicker
              dueDate={editedTask.dueDate}
              colour={colour}
              isCompleted={isCompleted}
              isCancelled={isCancelled}
              onChange={(date) => {
                onUpdateTask({
                  dueDate: date,
                });
                handlePopoverOpenChange(false);
              }}
              onOpenChange={handlePopoverOpenChange}
            />

            <Button
              variant="ghost"
              size="xs"
              iconName="trash"
              colour={colours.red}
              onClick={() => {
                debouncedSave.cancel();
                deleteTask({ taskId: editedTask.id });
                setIsFocused(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
