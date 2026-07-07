import { useCallback, useState } from "react";
import { NoteListItem } from "src/notes/components/NoteListItem/NoteListItem";
import { StickyNoteListItem } from "src/notes/components/NoteListItem/StickyNoteListItem";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useTaskReorder } from "src/tasks/hooks/useTaskReorder";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";
import type { UpdatesGroup } from "src/updates/Update.type";

type UpdatesSectionProps = {
  group: UpdatesGroup;
  colour: Colour;
  notes: Note[];
  tasks: Task[];
};

export const UpdatesSection = ({
  group,
  colour,
  notes,
  tasks,
}: UpdatesSectionProps) => {
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);
  const { createTask } = useCreateTask();
  const { getMoveCallbacks } = useTaskReorder();

  const onCreateTask = useCallback(
    async (insertAfterSortOrder?: number) => {
      const createdTask = await createTask({
        createTaskData: {
          note: null,
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
    [createTask],
  );

  return (
    <section id={group.title} className="w-full flex flex-col gap-1">
      <h2 className="font-title text-3xl">{group.title}</h2>

      <div className="flex flex-col p-4 rounded-2xl bg-gray-50 gap-3">
        {tasks.length > 0 && (
          <div className="pb-2 border-dashed border-b border-slate-300">
            <h2 className="font-title text-lg text-slate-400">Tasks</h2>

            <div className="flex flex-col gap-1.5 p-1">
              {tasks.map((task, index) => (
                <TaskEditor
                  key={task.id}
                  task={task}
                  colour={colour}
                  onCreateNextTask={() => onCreateTask(task.sortOrder)}
                  autoFocusTitle={task.id === newTaskFocusId}
                  onAutoFocusComplete={() => setNewTaskFocusId(null)}
                  {...getMoveCallbacks(index, tasks)}
                />
              ))}
            </div>
          </div>
        )}

        {notes.length > 0 && (
          <div className="pb-2 border-dashed border-b border-slate-300">
            <h2 className="font-title text-lg text-slate-400">Notes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1">
              {notes.map((note) => {
                const hasNoTitle = !note.title || note.title.trim() === "";

                if (hasNoTitle) {
                  return (
                    <StickyNoteListItem
                      key={note.id}
                      note={note}
                      colour={colour}
                    />
                  );
                }

                return (
                  <NoteListItem key={note.id} note={note} colour={colour} />
                );
              })}
            </div>
          </div>
        )}

        {group.updates.length > 0 && (
          <div>
            <h2 className="font-title text-lg text-slate-400">Comments</h2>

            <div className="flex flex-col gap-1 relative">
              {group.updates.map((upd) => (
                <UpdateEditor key={upd.id} update={upd} colour={colour} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
