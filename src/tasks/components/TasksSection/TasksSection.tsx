import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useTaskReorder } from "src/tasks/hooks/useTaskReorder";
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
  const { createTask } = useCreateTask();
  const { getMoveCallbacks } = useTaskReorder();
  const { pocketbookId } = useCurrentPocketbookId();
  const handledToolbarTriggerRef = useRef(0);

  const note = taskGroup.relevantTaskData.note;

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

  // const isNoNote = !note;

  // if (isNoNote) {
  //   return (
  //     <section id="no-note">
  //       <div className="flex flex-col gap-2 p-4 rounded-2xl bg-gray-50">
  //         <div
  //           className="flex gap-2 items-center"
  //           onMouseOver={() => setIsTitleHovered(true)}
  //           onMouseLeave={() => setIsTitleHovered(false)}
  //         >
  //           <p className="font-title text-3xl text-slate-400">
  //             {taskGroup.title}
  //           </p>

  //           {isTitleHovered && (
  //             <Button
  //               variant="ghost-strong"
  //               size="sm"
  //               iconName="plus"
  //               colour={colour}
  //               onClick={() => onCreateTask()}
  //             />
  //           )}
  //         </div>

  //         {taskGroup.tasks.length === 0 && (
  //           <div className="w-full p-3 flex flex-col gap-3 items-center">
  //             <p className="text-slate-500">No task yet</p>

  //             <div>
  //               <Button
  //                 variant="ghost"
  //                 size="sm"
  //                 className="w-full"
  //                 iconName="plusSquare"
  //                 onClick={() => onCreateTask()}
  //               >
  //                 Create your first task
  //               </Button>
  //             </div>
  //           </div>
  //         )}

  //         {taskGroup.tasks.map((task, index) => (
  //           <TaskEditor
  //             key={task.id}
  //             task={task}
  //             colour={colour}
  //             onCreateNextTask={() => onCreateTask(task.sortOrder)}
  //             autoFocusTitle={task.id === newTaskFocusId}
  //             onAutoFocusComplete={() => setNewTaskFocusId(null)}
  //             {...getMoveCallbacks(index, taskGroup.tasks)}
  //           />
  //         ))}
  //       </div>
  //     </section>
  //   );
  // }

  return (
    <section
      id={note?.id ?? "no-note"}
      className={cn("p-4", !note && "rounded-2xl bg-gray-50")}
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

        <div className="mb-1 flex gap-1">
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
      </div>

      <div className="flex flex-col gap-1.5 p-1">
        {taskGroup.tasks.map((task, index) => (
          <TaskEditor
            key={task.id}
            task={task}
            colour={colour}
            onCreateNextTask={() => onCreateTask(task.sortOrder)}
            autoFocusTitle={task.id === newTaskFocusId}
            onAutoFocusComplete={() => setNewTaskFocusId(null)}
            {...getMoveCallbacks(index, taskGroup.tasks)}
          />
        ))}
      </div>
    </section>
  );
};
