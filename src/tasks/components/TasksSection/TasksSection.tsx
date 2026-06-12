import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "src/common/components/Button/Button";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useUpdateTask } from "src/tasks/hooks/useUpdateTask";
import type { Colour } from "src/colours/Colour.type";
import type { Task, TasksGroup } from "src/tasks/Task.type";

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
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { pocketbookId } = useCurrentPocketbookId();
  const handledToolbarTriggerRef = useRef(0);

  const note = taskGroup.relevantTaskData.note;

  const onCreateTask = useCallback(async () => {
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
    });
    if (createdTask?.id) {
      setNewTaskFocusId(createdTask.id);
    }
  }, [createTask, note]);

  const swapTaskOrder = useCallback(
    (taskA: Task, taskB: Task) => {
      updateTask({ taskId: taskA.id, updateTaskData: { ...taskA, sortOrder: taskB.sortOrder } });
      updateTask({ taskId: taskB.id, updateTaskData: { ...taskB, sortOrder: taskA.sortOrder } });
    },
    [updateTask],
  );

  const getMoveCallbacks = useCallback(
    (index: number, tasks: Task[]) => {
      const onMoveUp =
        index > 0
          ? () => swapTaskOrder(tasks[index], tasks[index - 1])
          : undefined;
      const onMoveDown =
        index < tasks.length - 1
          ? () => swapTaskOrder(tasks[index], tasks[index + 1])
          : undefined;
      return { onMoveUp, onMoveDown };
    },
    [swapTaskOrder],
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

  const isNoNote = !note;

  if (isNoNote) {
    return (
      <section id="no-note">
        <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50">
          <div
            className="flex gap-2 items-center"
            onMouseOver={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
          >
            <p className="text-lg text-slate-400 font-title">
              {taskGroup.title}
            </p>

            {isTitleHovered && (
              <Button
                variant="ghost-strong"
                size="sm"
                iconName="plus"
                colour={colour}
                onClick={() => onCreateTask()}
              />
            )}
          </div>

          {taskGroup.tasks.length === 0 && (
            <div className="w-full p-3 flex flex-col gap-3 items-center">
              <p className="text-slate-500">No task yet</p>

              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  iconName="plusSquare"
                  onClick={() => onCreateTask()}
                >
                  Create your first task
                </Button>
              </div>
            </div>
          )}

          {taskGroup.tasks.map((task, index) => (
            <TaskEditor
              key={task.id}
              task={task}
              colour={colour}
              onCreateNextTask={onCreateTask}
              autoFocusTitle={task.id === newTaskFocusId}
              onAutoFocusComplete={() => setNewTaskFocusId(null)}
              {...getMoveCallbacks(index, taskGroup.tasks)}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={note.id}>
      <div
        className="flex p-2 gap-2 items-center"
        onMouseOver={() => setIsTitleHovered(true)}
        onMouseLeave={() => setIsTitleHovered(false)}
      >
        <h2 className="font-title text-3xl">{taskGroup.title}</h2>

        {isTitleHovered && (
          <div className="mb-2 flex gap-1">
            <Button
              variant="ghost-strong"
              size="sm"
              iconName="plus"
              colour={colour}
              onClick={() => onCreateTask()}
            />

            {pocketbookId && (
              <Link
                to="/$pocketbookId/notes"
                params={{ pocketbookId }}
                search={{ noteId: note.id }}
              >
                <Button
                  variant="ghost-strong"
                  size="sm"
                  iconName="arrowCircleRight"
                  colour={colour}
                />
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-1">
        {taskGroup.tasks.map((task, index) => (
          <TaskEditor
            key={task.id}
            task={task}
            colour={colour}
            onCreateNextTask={onCreateTask}
            autoFocusTitle={task.id === newTaskFocusId}
            onAutoFocusComplete={() => setNewTaskFocusId(null)}
            {...getMoveCallbacks(index, taskGroup.tasks)}
          />
        ))}
      </div>
    </section>
  );
};
