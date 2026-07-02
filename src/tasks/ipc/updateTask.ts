import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { TaskSchema } from "src/tasks/tasks.schema";

export type UpdateTaskInput = {
  taskId: string;
  title: string;
  description: string;
  link: string | null;
  links: string;
  isImportant: boolean;
  noteId: string | null;
  dueDate: string | null;
  completedDate: string | null;
  cancelledDate: string | null;
  sortOrder?: number;
};

createIpcHandler(
  "tasks:update",
  ({
    taskId,
    title,
    description,
    link,
    links,
    isImportant,
    noteId,
    dueDate,
    completedDate,
    cancelledDate,
    sortOrder,
  }: UpdateTaskInput): TaskSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(tasks)
      .set({
        title,
        description,
        link,
        links,
        isImportant,
        note: noteId,
        dueDate,
        completedDate,
        cancelledDate,
        ...(sortOrder !== undefined ? { sortOrder } : {}),
        updated: now,
      })
      .where(eq(tasks.id, taskId))
      .returning()
      .all();

    return updated;
  },
);
