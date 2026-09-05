import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { Task } from "src/tasks/tasks.schema";

export type GetTasksInput = {
  pocketbookId: string;
  noteId?: string;
  status?: "incomplete" | "completed" | "cancelled";
};

export const getTasksServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTasksInput) => input)
  .handler<Promise<{ tasks: Task[] }>>(async ({ data }) => {
    const db = getDb();

    const conditions = [eq(tasks.pocketbookId, data.pocketbookId)];

    if (data.noteId !== undefined) {
      conditions.push(eq(tasks.noteId, data.noteId));
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

    return { tasks: taskRows };
  });
