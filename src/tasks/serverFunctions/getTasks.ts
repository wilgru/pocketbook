import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { tasks } from "src/tasks/tasks.schema";
import type { Task } from "src/tasks/tasks.schema";

export type GetTasksInput = {
  pocketbookId: string;
  noteIds?: string[];
  status?: "incomplete" | "completed" | "cancelled";
  expandNotes?: boolean;
};

export const getTasksServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTasksInput) => input)
  .handler<Promise<{ tasks: Task[] }>>(async ({ data }) => {
    const db = getDb();
    const conditions = [eq(tasks.pocketbookId, data.pocketbookId)];

    if (data.noteIds !== undefined) {
      conditions.push(inArray(tasks.noteId, data.noteIds));
    }

    if (data.status === "incomplete") {
      conditions.push(isNull(tasks.completedDate));
      conditions.push(isNull(tasks.cancelledDate));
    } else if (data.status === "completed") {
      conditions.push(isNotNull(tasks.completedDate));
    } else if (data.status === "cancelled") {
      conditions.push(isNotNull(tasks.cancelledDate));
    }

    const taskRows = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.sortOrder))
      .all();

    const tasksWithNotes: Task[] = taskRows.map((taskRow) => {
      return { ...taskRow, note: null };
    });

    if (data.expandNotes) {
      const { notes } = await getNotesServerFn({
        data: { pocketbookId: data.pocketbookId },
      });

      tasksWithNotes.forEach((task) => {
        if (task.noteId) {
          const note = notes.find((note) => note.id === task.noteId);

          if (note) {
            task.note = note;
          }
        }
      });
    }

    return { tasks: tasksWithNotes };
  });
