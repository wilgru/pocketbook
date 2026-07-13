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
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDeleteTask } from "src/tasks/hooks/useDeleteTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import type { Dayjs } from "dayjs";
import type { MouseEvent } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/Note.type";
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
  onFocusLost,
  autoFocusTitle = false,
  onAutoFocusComplete,
  colour = colours.orange,
  onMoveUp,
  onMoveDown,
}: TaskEditorProps) => {
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();

  const setTaskEditorState = useSetAtom(taskEditorStateAtom);

  const [editedTask, setEditedTask] = useState<Task>(getInitialTask(task));
  const [isFocused, setIsFocused] = useState(false);
  const [isLinksPopoverOpen, setIsLinksPopoverOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isNoteSelectOpen, setIsNoteSelectOpen] = useState(false);
  const isLinksPopoverOpenRef = useRef(false);
  const isDatePickerOpenRef = useRef(false);
  const isNoteSelectOpenRef = useRef(false);
  const [editorInstanceId] = useState(
    () => `task-editor-${Math.random().toString(36).slice(2)}`,
  );
  const editorRootRef = useRef<HTMLDivElement>(null);

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

  const scheduleTitleRefocus = () => {
    setTimeout(() => {
      const editorRoot = editorRootRef.current;
      const activeElement = document.activeElement as HTMLElement | null;

      if (!editorRoot || !titleRef.current) {
        return;
      }

      const shouldRefocus =
        !activeElement ||
        activeElement === document.body ||
        editorRoot.contains(activeElement);

      if (shouldRefocus) {
        titleRef.current.focus();
      }
    }, 0);
  };

  // Stable refs so callbacks stored in the atom always call the latest implementation.
  const onFlagCallbackRef = useRef<() => void>();
  onFlagCallbackRef.current = () =>
    onUpdateTask({ isImportant: !editedTask.isImportant });

  const onNoteCallbackRef = useRef<(note: Note | null) => void>();
  onNoteCallbackRef.current = (note) => onUpdateTask({ note });

  const onDueDateCallbackRef = useRef<(date: Dayjs | null) => void>();
  onDueDateCallbackRef.current = (date) => onUpdateTask({ dueDate: date });

  const onDeleteCallbackRef = useRef<() => void>();
  onDeleteCallbackRef.current = () => deleteTask({ taskId: editedTask.id });

  const onLinksCallbackRef = useRef<(links: Link[]) => void>();
  onLinksCallbackRef.current = (links) => onUpdateTask({ links });

  const onMoveUpCallbackRef = useRef<(() => void) | undefined>(onMoveUp);
  onMoveUpCallbackRef.current = onMoveUp;

  const onMoveDownCallbackRef = useRef<(() => void) | undefined>(onMoveDown);
  onMoveDownCallbackRef.current = onMoveDown;

  // Stable callbacks created once – these are safe to store in the atom.
  const stableFlagCallback = useRef(() =>
    onFlagCallbackRef.current?.(),
  ).current;
  const stableNoteCallback = useRef((note: Note | null) =>
    onNoteCallbackRef.current?.(note),
  ).current;
  const stableDueDateCallback = useRef((date: Dayjs | null) =>
    onDueDateCallbackRef.current?.(date),
  ).current;
  const stableDeleteCallback = useRef(() =>
    onDeleteCallbackRef.current?.(),
  ).current;
  const stableLinksCallback = useRef((links: Link[]) =>
    onLinksCallbackRef.current?.(links),
  ).current;
  const stableLinkPopoverOpenChangeCallback = useRef((open: boolean) =>
    {
      isLinksPopoverOpenRef.current = open;
      setIsLinksPopoverOpen(open);
      if (!open) {
        scheduleTitleRefocus();
      }
    },
  ).current;
  const stableDatePickerOpenChangeCallback = useRef((open: boolean) =>
    {
      isDatePickerOpenRef.current = open;
      setIsDatePickerOpen(open);
      if (!open) {
        scheduleTitleRefocus();
      }
    },
  ).current;
  const stableNoteSelectOpenChangeCallback = useRef((open: boolean) =>
    {
      isNoteSelectOpenRef.current = open;
      setIsNoteSelectOpen(open);
      if (!open) {
        scheduleTitleRefocus();
      }
    },
  ).current;
  const stableMoveUpCallback = useRef(() =>
    onMoveUpCallbackRef.current?.(),
  ).current;
  const stableMoveDownCallback = useRef(() =>
    onMoveDownCallbackRef.current?.(),
  ).current;

  // Sync atom when focus state or colour changes.
  useEffect(() => {
    if (isFocused) {
      setTaskEditorState({
        focusedTaskEditorId: editorInstanceId,
        isTaskFocused: true,
        colour,
        links: editedTask.links,
        selectedNote: editedTask.note,
        isImportant: editedTask.isImportant,
        dueDate: editedTask.dueDate,
        isCompleted: !!editedTask.completedDate,
        isCancelled: !!editedTask.cancelledDate,
        onNoteChange: stableNoteCallback,
        onNoteSelectOpenChange: stableNoteSelectOpenChangeCallback,
        onLinksChange: stableLinksCallback,
        onLinkPopoverOpenChange: stableLinkPopoverOpenChangeCallback,
        onFlagClick: stableFlagCallback,
        onDueDateChange: stableDueDateCallback,
        onDatePickerOpenChange: stableDatePickerOpenChangeCallback,
        onDeleteClick: stableDeleteCallback,
        onMoveUp: stableMoveUpCallback,
        onMoveDown: stableMoveDownCallback,
      });
    } else {
      setTaskEditorState((current) =>
        current.focusedTaskEditorId === editorInstanceId
          ? { ...defaultTaskEditorState }
          : current,
      );
    }
  }, [isFocused, colour, editorInstanceId, setTaskEditorState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep toolbar display data (important, due date, completion) in sync while focused.
  useEffect(() => {
    if (!isFocused) return;
    setTaskEditorState((current) => ({
      ...current,
      links: editedTask.links,
      selectedNote: editedTask.note,
      isImportant: editedTask.isImportant,
      dueDate: editedTask.dueDate,
      isCompleted: !!editedTask.completedDate,
      isCancelled: !!editedTask.cancelledDate,
    }));
  }, [
    editedTask.links,
    editedTask.note,
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
        current.focusedTaskEditorId === editorInstanceId
          ? { ...defaultTaskEditorState }
          : current,
      );
    };
  }, [editorInstanceId, setTaskEditorState]);

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
      ref={editorRootRef}
      className="w-full flex gap-1 items-start"
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        const editorRoot = e.currentTarget;
        setTimeout(() => {
          if (
            !editorRoot.contains(document.activeElement) &&
            !isDatePickerOpen &&
            !isNoteSelectOpen &&
            !isLinksPopoverOpen &&
            !isLinksPopoverOpenRef.current &&
            !isDatePickerOpenRef.current &&
            !isNoteSelectOpenRef.current
          ) {
            setIsFocused(false);
            onFocusLost?.();
          }
        }, 0);
      }}
    >
      <button
        className="pt-[3px] pl-px"
        onMouseDown={handleCircleMouseDown}
        onClick={handleCircleClick}
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
