import { eq, max, and, isNull } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { TaskSchema } from "src/tasks/tasks.schema";

export type CreateTaskInput = {
  title: string;
  description: string;
  link: string | null;
  links: string;
  isImportant: boolean;
  noteId: string | null;
  dueDate: string | null;
  pocketbookId: string | null;
  userId: string | null;
};

createIpcHandler(
  "tasks:create",
  ({
    title,
    description,
    link,
    links,
    isImportant,
    noteId,
    dueDate,
    pocketbookId,
    userId,
  }: CreateTaskInput): TaskSchema => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    // Assign sortOrder as max existing + 1 within the same group (note or pocketbook)
    const conditions = noteId
      ? and(eq(tasks.note, noteId))
      : and(isNull(tasks.note), pocketbookId ? eq(tasks.pocketbook, pocketbookId) : undefined);

    const maxResult = db
      .select({ maxOrder: max(tasks.sortOrder) })
      .from(tasks)
      .where(conditions)
      .get();

    const sortOrder = (maxResult?.maxOrder ?? -1) + 1;

    const [inserted] = db
      .insert(tasks)
      .values({
        id,
        title,
        description,
        link,
        links,
        isImportant,
        note: noteId,
        dueDate,
        sortOrder,
        pocketbook: pocketbookId,
        user: userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  },
);
