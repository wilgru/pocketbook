import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { tasks } from "src/tasks/tasks.schema";
import type { Note } from "src/notes/notes.schema";
import type { Task } from "src/tasks/tasks.schema";

export type GetTaskInput = { taskId: string };

export const getTaskServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTaskInput) => input)
  .handler(async ({ data }): Promise<Task> => {
    const db = getDb();

    const taskRow = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, data.taskId))
      .get();

    if (!taskRow) {
      throw new Error(`Task not found: ${data.taskId}`);
    }

    let note: Note | null = null;
    if (taskRow.noteId) {
      note = await getNoteServerFn({ data: { noteId: taskRow.noteId } });
    }

    return { ...taskRow, note };
  });
