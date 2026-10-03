import { useForm, useSelector } from "@tanstack/react-form-start";
import { cn } from "cn";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { LinksPopover } from "src/common/components/LinksPopover/LinksPopover";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { TaskBlockerPopover } from "src/tasks/components/TaskBlockerPopover/TaskBlockerPopover";
import { TaskDatePicker } from "src/tasks/components/TaskDatePicker/TaskDatePicker";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDeleteTask } from "src/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import { useDebouncedCallback } from "use-debounce";
import type { Colour } from "src/colours/Colour.type";
import type { Task } from "src/tasks/tasks.schema";

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

type TaskFormValues = Omit<Task, "note">;

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

  const defaultValues: TaskFormValues = {
    pocketbookId: task?.pocketbookId || "",
    id: task?.id || "",
    title: task?.title || "",
    description: task?.description || "",
    noteId: task?.noteId || null,
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

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!value.title && !value.description && !value.id) {
        return;
      }

      if (value.id) {
        await updateTask({
          taskId: value.id,
          updateTaskData: {
            ...value,
            note: task?.note ?? null,
          },
          includeSortOrder: false,
        });
        onSave?.();
      } else {
        const newTask = await createTask({
          createTaskData: {
            ...value,
            note: task?.note ?? null,
          },
        });

        if (newTask) {
          form.setFieldValue("id", newTask.id);
          onCreate?.(newTask);
        }
      }
    },
  });

  const formValues = useSelector(form.store, (state) => state.values);
  const [sortOrderOverrides, setSortOrderOverrides] = useState<
    Record<string, number>
  >({});
  const [isFocused, setIsFocused] = useState(false);
  const [isControlsBusy, setIsControlsBusy] = useState(false);
  const titleRef = useAutoResize(formValues.title);
  const descriptionRef = useAutoResize(formValues.description);

  const debouncedSave = useDebouncedCallback(() => {
    void form.handleSubmit();
  }, 500);

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
      (currentTask) => currentTask.id === formValues.id,
    );
    const adjacentTask = sortingTasks[taskIndex + direction];

    if (taskIndex === -1 || !adjacentTask) {
      return;
    }

    swapTaskOrder(sortingTasks[taskIndex], adjacentTask);
  };

  const onStatusClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 2) {
      form.setFieldValue("completedDate", null);
      form.setFieldValue("cancelledDate", dayjs());
    } else if (isCompleted || isCancelled) {
      form.setFieldValue("completedDate", null);
      form.setFieldValue("cancelledDate", null);
    } else {
      form.setFieldValue("completedDate", dayjs());
      form.setFieldValue("cancelledDate", null);
    }
    debouncedSave();
  };

  // Auto-focus title once for newly created tasks.
  useEffect(() => {
    if (!autoFocusTitle || titleRef.current === document.activeElement) {
      return;
    }

    titleRef.current?.focus();
    onAutoFocusComplete?.();
  }, [autoFocusTitle, onAutoFocusComplete, titleRef]);

  const isCompleted = !!formValues.completedDate;
  const isCancelled = !!formValues.cancelledDate;

  const isDueDateOverdue =
    !!formValues.dueDate &&
    formValues.dueDate.isBefore(dayjs(), "day") &&
    !isCompleted &&
    !isCancelled;

  const showDescription = isFocused || !!formValues.description;
  const showTaskControls = isFocused && !!formValues.id;

  return (
    <div
      className="flex w-full items-start gap-2"
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
      {formValues.blockedComment ? (
        <Tooltip
          content={
            <div className="flex flex-col gap-1">
              <p className="text-slate-200">{formValues.blockedComment}</p>
              <p className="mt-1 flex justify-between gap-4 border-t border-slate-600 pt-1 text-xs text-slate-400 italic">
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
            onClick={() => {
              form.setFieldValue("blockedComment", null);
              form.setFieldValue("blockedDate", null);
              debouncedSave();
            }}
          >
            <Icon
              iconName="handPalm"
              weight="regular"
              size="sm"
              className="text-orange-400 transition-colors hover:text-orange-600"
            />
          </button>
        </Tooltip>
      ) : (
        <button
          className="pt-0.75 pl-px"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={onStatusClick}
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
        <div className="flex items-start justify-between">
          <form.Field name="title">
            {(field) => (
              <textarea
                ref={titleRef}
                rows={1}
                name="title"
                value={field.state.value ?? ""}
                placeholder="No Title"
                onKeyDown={async (e) => {
                  if (e.key !== "Enter" || e.shiftKey) {
                    return;
                  }

                  e.preventDefault();
                  debouncedSave.flush();
                  await onCreateNextTask?.();
                }}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  debouncedSave();
                }}
                className={cn(
                  "flex-1 resize-none bg-transparent pt-0.5 text-sm tracking-tight placeholder-slate-400 outline-hidden select-none",
                  isCompleted || isCancelled
                    ? "text-slate-500"
                    : formValues.isImportant
                      ? "text-red-500"
                      : "text-slate-700",
                  isCancelled && "line-through",
                )}
              />
            )}
          </form.Field>

          {!showTaskControls && (
            <div className="flex flex-row flex-wrap items-center gap-1 pl-1">
              {formValues.links.map((link) => (
                <LinkPill key={link.id} link={link} colour={colour} />
              ))}

              {formValues.isImportant && (
                <Icon
                  iconName="warningCircle"
                  size="sm"
                  className={cn(
                    "mt-0.5",
                    isCompleted ? "text-slate-400" : "text-red-500",
                  )}
                />
              )}

              {!!formValues.dueDate && (
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs",
                    isDueDateOverdue
                      ? "bg-red-100 text-red-500"
                      : "bg-gray-100 text-gray-500",
                  )}
                >
                  {formValues.dueDate.format("MMM D, YYYY")}
                </span>
              )}
            </div>
          )}
        </div>

        {showDescription && (
          <form.Field name="description">
            {(field) => (
              <textarea
                ref={descriptionRef}
                rows={1}
                name="description"
                value={field.state.value ?? ""}
                placeholder="No description"
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  debouncedSave();
                }}
                className={cn(
                  "-mb-0.5 w-full resize-none bg-transparent text-[13px] font-normal placeholder-slate-400 outline-hidden select-none",
                  isCompleted || isCancelled
                    ? "text-slate-400"
                    : "text-slate-500",
                )}
              />
            )}
          </form.Field>
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
                  (currentTask) => currentTask.id === formValues.id,
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
                  (currentTask) => currentTask.id === formValues.id,
                ) ===
                sortingTasks.length - 1
              }
            />

            <form.Field name="isImportant">
              {(field) => (
                <Toggle
                  isToggled={field.state.value}
                  size="xs"
                  colour={colours.red}
                  onClick={() => {
                    field.handleChange(!field.state.value);
                    debouncedSave();
                  }}
                  iconName="warningCircle"
                />
              )}
            </form.Field>

            <form.Field name="blockedComment">
              {(field) => (
                <TaskBlockerPopover
                  blockedComment={field.state.value}
                  onChange={(blockedComment) => {
                    field.handleChange(blockedComment);
                    form.setFieldValue(
                      "blockedDate",
                      blockedComment ? dayjs() : null,
                    );
                    debouncedSave();
                  }}
                  onOpenChange={handlePopoverOpenChange}
                />
              )}
            </form.Field>

            <form.Field name="links">
              {(field) => (
                <LinksPopover
                  links={field.state.value}
                  colour={colour}
                  onChange={(links) => {
                    field.handleChange(links);
                    debouncedSave();
                  }}
                  onOpenChange={handlePopoverOpenChange}
                />
              )}
            </form.Field>

            <form.Field name="noteId">
              {(field) => (
                <NoteSelect
                  mode="single"
                  selectedNotes={task?.note ? [task.note] : []}
                  colour={colour}
                  onChange={(notes) => {
                    field.handleChange(notes[0]?.id ?? null);
                    debouncedSave();
                    handlePopoverOpenChange(false);
                  }}
                  onOpenChange={handlePopoverOpenChange}
                />
              )}
            </form.Field>

            <form.Field name="dueDate">
              {(field) => (
                <TaskDatePicker
                  dueDate={field.state.value}
                  colour={colour}
                  isCompleted={isCompleted}
                  isCancelled={isCancelled}
                  onChange={(date) => {
                    field.handleChange(date);
                    debouncedSave();
                    handlePopoverOpenChange(false);
                  }}
                  onOpenChange={handlePopoverOpenChange}
                />
              )}
            </form.Field>

            <Button
              variant="ghost"
              size="xs"
              iconName="trash"
              colour={colours.red}
              onClick={() => {
                debouncedSave.cancel();
                deleteTask({ taskId: formValues.id });
                setIsFocused(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
