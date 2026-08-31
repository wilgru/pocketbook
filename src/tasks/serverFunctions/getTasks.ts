import { createServerFn } from "@tanstack/react-start";
import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

export type GetTasksInput = {
  pocketbookId: string;
  noteId?: string;
  status?: "incomplete" | "completed" | "cancelled";
};

export const getTasksServerFn = createServerFn({ method: "GET" })
  .validator((input: GetTasksInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const conditions = [eq(tasks.pocketbook, data.pocketbookId)];

    if (data.noteId !== undefined) {
      conditions.push(eq(tasks.note, data.noteId));
    }

    if (data.status === "incomplete") {
      conditions.push(isNull(tasks.completedDate));
      conditions.push(isNull(tasks.cancelledDate));
    } else if (data.status === "completed") {
      conditions.push(isNotNull(tasks.completedDate));
    } else if (data.status === "cancelled") {
      conditions.push(isNotNull(tasks.cancelledDate));
    }

    const rows = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.sortOrder))
      .all();

    return { tasks: rows };
  });
