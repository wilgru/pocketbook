import { and, asc, eq, isNotNull, isNull } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { TaskSchema } from "src/tasks/tasks.schema";

export type GetTasksInput = {
  pocketbookId: string;
  noteId?: string;
  status?: "incomplete" | "completed" | "cancelled";
};

export type GetTasksResult = {
  tasks: TaskSchema[];
};

createIpcHandler(
  "tasks:getAll",
  ({ pocketbookId, noteId, status }: GetTasksInput): GetTasksResult => {
    const conditions = [eq(tasks.pocketbook, pocketbookId)];

    if (noteId !== undefined) {
      conditions.push(eq(tasks.note, noteId));
    }

    if (status === "incomplete") {
      conditions.push(isNull(tasks.completedDate));
      conditions.push(isNull(tasks.cancelledDate));
    } else if (status === "completed") {
      conditions.push(isNotNull(tasks.completedDate));
    } else if (status === "cancelled") {
      conditions.push(isNotNull(tasks.cancelledDate));
    }

    const rows = db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.sortOrder))
      .all();

    return { tasks: rows };
  },
);
