import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

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
  blockedComment: string | null;
  blockedDate: string | null;
  sortOrder?: number;
};

export const updateTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdateTaskInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description,
        link: data.link,
        links: data.links,
        isImportant: data.isImportant,
        note: data.noteId,
        dueDate: data.dueDate,
        completedDate: data.completedDate,
        cancelledDate: data.cancelledDate,
        blockedComment: data.blockedComment,
        blockedDate: data.blockedDate,
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        updated: now,
      })
      .where(eq(tasks.id, data.taskId))
      .returning()
      .all();

    return updated;
  });
