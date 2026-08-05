import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { TaskProgressBar } from "../TaskProgressBar/TaskProgressBar";
import type { Colour } from "src/colours/Colour.type";
import type { TasksGroup } from "src/tasks/Task.type";

type TasksSectionProps = {
  taskGroup: TasksGroup;
  colour: Colour;
  /** Incrementing this counter causes the section to open a new task editor. Used by the toolbar plus button. */
  noNoteEditorTrigger?: number;
};

export const TasksSection = ({
  taskGroup,
  colour,
  noNoteEditorTrigger,
}: TasksSectionProps) => {
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const { createTask } = useCreateTask();
  const { pocketbookId } = useCurrentPocketbookId();
  const handledToolbarTriggerRef = useRef(0);

  const note = taskGroup.relevantTaskData.note;

  const completedTaskCount = taskGroup.tasks.reduce(
    (count, task) => (task.completedDate ? count + 1 : count),
    0,
  );
  const cancelledTaskCount = taskGroup.tasks.reduce(
    (count, task) => (task.cancelledDate ? count + 1 : count),
    0,
  );

  const visibleTasks = showCompleted
    ? taskGroup.tasks
    : taskGroup.tasks.filter(
        (task) => !task.completedDate && !task.cancelledDate,
      );

  const onCreateTask = useCallback(
    async (insertAfterSortOrder?: number) => {
      const createdTask = await createTask({
        createTaskData: {
          note: note ?? null,
          title: "",
          isImportant: false,
          link: null,
          links: [],
          description: "",
          dueDate: null,
          completedDate: null,
          cancelledDate: null,
        },
        insertAfterSortOrder,
      });
      if (createdTask?.id) {
        setNewTaskFocusId(createdTask.id);
      }
    },
    [createTask, note],
  );

  // Create a new no-note task whenever the toolbar plus button fires.
  useEffect(() => {
    if (!noNoteEditorTrigger || noNoteEditorTrigger <= 0) {
      return;
    }

    if (handledToolbarTriggerRef.current === noNoteEditorTrigger) {
      return;
    }

    handledToolbarTriggerRef.current = noNoteEditorTrigger;
    onCreateTask();
  }, [noNoteEditorTrigger, onCreateTask]);

  return (
    <section
      id={note?.id ?? "no-note"}
      className={cn("px-4 pt-4 pb-2", !note && "rounded-md bg-gray-50")}
    >
      <div className="flex flex-col mb-1 border-b border-slate-200">
        <h2
          className={cn(
            "font-title text-3xl pl-0.5",
            !note && "text-slate-500",
          )}
        >
          {taskGroup.title}
        </h2>

        <div className="mb-1 flex items-center justify-between gap-1">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              iconName="plus"
              colour={colour}
              onClick={() => onCreateTask()}
            >
              Add task
            </Button>

            {pocketbookId && note && (
              <Link
                to="/$pocketbookId/notes"
                params={{ pocketbookId }}
                search={{ noteId: note.id }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="arrowCircleRight"
                  colour={colour}
                >
                  Go to note
                </Button>
              </Link>
            )}
          </div>

          <TaskProgressBar
            cancelled={cancelledTaskCount}
            completed={completedTaskCount}
            total={taskGroup.tasks.length}
            colour={colour}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-1">
        {visibleTasks.map((task) => (
          <TaskEditor
            key={task.id}
            task={task}
            tasksForSorting={taskGroup.tasks}
            colour={colour}
            onCreateNextTask={() => onCreateTask(task.sortOrder)}
            autoFocusTitle={task.id === newTaskFocusId}
            onAutoFocusComplete={() => setNewTaskFocusId(null)}
          />
        ))}

        {completedTaskCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            colour={colours.grey}
            iconName={showCompleted ? "eyeSlash" : "eye"}
            onClick={() => setShowCompleted((current) => !current)}
          >
            {showCompleted ? "Hide completed " : "Show completed "}
            {`(${completedTaskCount})`}
          </Button>
        )}
      </div>
    </section>
  );
};
