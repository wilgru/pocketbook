import * as Dialog from "@radix-ui/react-dialog";
import dayjs from "dayjs";
import debounce from "debounce";
import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import {
  defaultTaskEditorState,
  taskEditorStateAtom,
} from "src/common/atoms/taskEditorStateAtom";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { TaskLinksModal } from "src/tasks/components/TaskLinksModal/TaskLinksModal";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDeleteTask } from "src/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import type { Dayjs } from "dayjs";
import type { MouseEvent } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Task } from "src/tasks/Task.type";

type TaskEditorProps = {
  task?: Partial<Task>;
  onSave?: () => void;
  onCreate?: (task: Task) => void;
  onCreateNextTask?: () => void | Promise<void>;
  onFocusLost?: () => void;
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
    isImportant: task?.isImportant || false,
    created: task?.created || dayjs(),
    updated: task?.updated || dayjs(),
  };
};

export const TaskEditor = ({
  task,
  onSave,
  onCreate,
  onCreateNextTask,
  onFocusLost,
  autoFocusTitle = false,
  onAutoFocusComplete,
  colour = colours.orange,
}: TaskEditorProps) => {
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();

  const setTaskEditorState = useSetAtom(taskEditorStateAtom);

  const [editedTask, setEditedTask] = useState<Task>(getInitialTask(task));
  const [isFocused, setIsFocused] = useState(false);
  const [linksModalKey, setLinksModalKey] = useState(0);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const titleRef = useAutoResize(editedTask.title);
  const descriptionRef = useAutoResize(editedTask.description);

  // Timer for distinguishing single vs double click on the status circle
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickSnapshotRef = useRef<{
    wasCompleted: boolean;
    wasCancelled: boolean;
  } | null>(null);
  const hasAutoFocusedRef = useRef(false);

  // Ref that always points to the latest save implementation so the debounced
  // function never closes over stale state.
  const saveRef = useRef<() => void | Promise<void>>();
  saveRef.current = async () => {
    if (!editedTask.title && !editedTask.description && !editedTask.id) {
      return;
    }

    if (editedTask.id) {
      updateTask({ taskId: editedTask.id, updateTaskData: editedTask });
      onSave?.();
    } else {
      const newTask = await createTask({ createTaskData: editedTask });
      if (newTask) {
        setEditedTask((prev) => ({ ...prev, id: newTask.id }));
        onCreate?.(newTask);
      }
    }
  };

  // Stable debounced save – created once and reused across renders.
  const debouncedSave = useRef(
    debounce(() => saveRef.current?.(), 500),
  ).current;

  // Flush any pending debounced save when the component unmounts (navigation).
  useEffect(() => {
    return () => {
      debouncedSave.flush();
    };
  }, [debouncedSave]);

  // Auto-focus title once for newly created tasks.
  useEffect(() => {
    if (!autoFocusTitle || hasAutoFocusedRef.current) {
      return;
    }

    titleRef.current?.focus();
    hasAutoFocusedRef.current = true;
    onAutoFocusComplete?.();
  }, [autoFocusTitle, onAutoFocusComplete, titleRef]);

  // Clear any pending click-timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      clickSnapshotRef.current = null;
    };
  }, []);

  const onUpdateTask = (updateTaskData?: Partial<Task>) => {
    setEditedTask((currentEditedTask) => ({
      ...currentEditedTask,
      ...updateTaskData,
      updated: dayjs(),
    }));
    debouncedSave();
  };

  // Stable refs so callbacks stored in the atom always call the latest implementation.
  const onFlagCallbackRef = useRef<() => void>();
  onFlagCallbackRef.current = () =>
    onUpdateTask({ isImportant: !editedTask.isImportant });

  const onDueDateCallbackRef = useRef<(date: Dayjs | null) => void>();
  onDueDateCallbackRef.current = (date) => onUpdateTask({ dueDate: date });

  const onDeleteCallbackRef = useRef<() => void>();
  onDeleteCallbackRef.current = () => deleteTask({ taskId: editedTask.id });

  const onLinkCallbackRef = useRef<() => void>();
  onLinkCallbackRef.current = () => {
    setLinksModalKey((k) => k + 1);
    setIsLinksModalOpen(true);
  };

  // Stable callbacks created once – these are safe to store in the atom.
  const stableFlagCallback = useRef(() =>
    onFlagCallbackRef.current?.(),
  ).current;
  const stableDueDateCallback = useRef((date: Dayjs | null) =>
    onDueDateCallbackRef.current?.(date),
  ).current;
  const stableDeleteCallback = useRef(() =>
    onDeleteCallbackRef.current?.(),
  ).current;
  const stableLinkCallback = useRef(() =>
    onLinkCallbackRef.current?.(),
  ).current;
  const stableDatePickerOpenChangeCallback = useRef((open: boolean) =>
    setIsDatePickerOpen(open),
  ).current;

  // Sync atom when focus state or colour changes.
  useEffect(() => {
    if (isFocused) {
      setTaskEditorState({
        isTaskFocused: true,
        colour,
        isImportant: editedTask.isImportant,
        dueDate: editedTask.dueDate,
        isCompleted: !!editedTask.completedDate,
        isCancelled: !!editedTask.cancelledDate,
        onLinkClick: stableLinkCallback,
        onFlagClick: stableFlagCallback,
        onDueDateChange: stableDueDateCallback,
        onDatePickerOpenChange: stableDatePickerOpenChangeCallback,
        onDeleteClick: stableDeleteCallback,
      });
    } else {
      setTaskEditorState((current) =>
        current.isTaskFocused ? { ...defaultTaskEditorState } : current,
      );
    }
  }, [isFocused, colour, setTaskEditorState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep toolbar display data (important, due date, completion) in sync while focused.
  useEffect(() => {
    if (!isFocused) return;
    setTaskEditorState((current) => ({
      ...current,
      isImportant: editedTask.isImportant,
      dueDate: editedTask.dueDate,
      isCompleted: !!editedTask.completedDate,
      isCancelled: !!editedTask.cancelledDate,
    }));
  }, [
    editedTask.isImportant,
    editedTask.dueDate,
    editedTask.completedDate,
    editedTask.cancelledDate,
    isFocused,
    setTaskEditorState,
  ]);

  // Clear atom on unmount if this task was the focused one.
  useEffect(() => {
    return () => {
      setTaskEditorState((current) =>
        current.isTaskFocused ? { ...defaultTaskEditorState } : current,
      );
    };
  }, [setTaskEditorState]);

  const handleCircleClick = () => {
    const previousState = {
      wasCompleted: !!editedTask.completedDate,
      wasCancelled: !!editedTask.cancelledDate,
    };

    if (clickTimerRef.current) {
      // Second click within threshold – treat as double click: toggle cancelled
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      const wasCancelled = !!clickSnapshotRef.current?.wasCancelled;
      clickSnapshotRef.current = null;
      if (wasCancelled) {
        onUpdateTask({ completedDate: null, cancelledDate: null });
      } else {
        onUpdateTask({ completedDate: null, cancelledDate: dayjs() });
      }
    } else {
      // First click: apply completion state immediately.
      if (previousState.wasCompleted || previousState.wasCancelled) {
        onUpdateTask({ completedDate: null, cancelledDate: null });
      } else {
        onUpdateTask({ completedDate: dayjs() });
      }

      // Keep a short window to support double-click cancel toggle.
      clickSnapshotRef.current = previousState;
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        clickSnapshotRef.current = null;
      }, 300);
    }
  };

  const handleCircleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSaveLinks = (links: Link[]) => {
    onUpdateTask({ links });
  };

  const isCompleted = !!editedTask.completedDate;
  const isCancelled = !!editedTask.cancelledDate;

  // Show description when focused (even if empty) or when it has content
  const showDescription = isFocused || !!editedTask.description;

  const isDueDateOverdue =
    !!editedTask.dueDate &&
    editedTask.dueDate.isBefore(dayjs(), "day") &&
    !isCompleted &&
    !isCancelled;

  return (
    <div
      className="w-full flex gap-2 items-start"
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (
          !e.currentTarget.contains(e.relatedTarget) &&
          !isLinksModalOpen &&
          !isDatePickerOpen
        ) {
          setIsFocused(false);
          onFocusLost?.();
        }
      }}
    >
      <button
        className="pt-px pl-px"
        onMouseDown={handleCircleMouseDown}
        onClick={handleCircleClick}
      >
        <Icon
          iconName={
            isCompleted ? "checkCircle" : isCancelled ? "xCircle" : "circle"
          }
          size="md"
          weight={isCompleted || isCancelled ? "fill" : "regular"}
          className="fill-slate-400 hover:fill-slate-600 transition-colors"
        />
      </button>

      <div className="w-full flex items-start justify-between">
        <div className="flex flex-col grow">
          <div className="flex items-center flex-1">
            {editedTask.isImportant && (
              <Icon
                iconName="exclamationMark"
                size="sm"
                className={cn(
                  "-ml-2 shrink-0",
                  isCompleted || isCancelled
                    ? "text-slate-500"
                    : "text-red-500",
                )}
              />
            )}

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
                await saveRef.current?.();
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
              className="w-full text-sm font-normal bg-transparent placeholder-slate-400 text-slate-500 select-none resize-none outline-none"
            />
          )}
        </div>

        <div className="flex flex-row flex-wrap items-center gap-2">
          {editedTask.links.map((link) => (
            <LinkPill key={link.id} link={link} colour={colour} />
          ))}

          {!!editedTask.dueDate && (
            <span
              className={cn(
                "text-xs px-2.5 py-0.5 rounded-md font-medium",
                isDueDateOverdue
                  ? "bg-red-100 text-red-500"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {editedTask.dueDate.format("MMM D, YYYY")}
            </span>
          )}
        </div>
      </div>

      <Dialog.Root
        open={isLinksModalOpen}
        onOpenChange={(open) => {
          setIsLinksModalOpen(open);
        }}
      >
        <TaskLinksModal
          key={linksModalKey}
          links={editedTask.links}
          colour={colour}
          onSave={onSaveLinks}
        />
      </Dialog.Root>
    </div>
  );
};
