import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { Dayjs } from "dayjs";
import type { Link } from "src/common/types/Link.type";
import type { Task } from "src/tasks/tasks.schema";

export type UpdateTaskInput = {
  taskId: string;
  title: string;
  description: string;
  link: string | null;
  links: Link[];
  isImportant: boolean;
  noteId: string | null;
  dueDate: Dayjs | null;
  completedDate: Dayjs | null;
  cancelledDate: Dayjs | null;
  blockedComment: string | null;
  blockedDate: Dayjs | null;
  sortOrder?: number;
};

export const updateTaskServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: UpdateTaskInput) => input)
  .handler<Promise<Task>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

    const [updated] = await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description,
        link: data.link,
        links: data.links,
        isImportant: data.isImportant,
        noteId: data.noteId,
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
