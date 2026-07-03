import { and, eq, gte, isNull, max, sql } from "drizzle-orm";
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
  insertAfterSortOrder: number | null;
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
    insertAfterSortOrder,
  }: CreateTaskInput): TaskSchema => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    // Assign sortOrder within the same group (same note, or no-note tasks in the pocketbook).
    const groupCondition = noteId
      ? eq(tasks.note, noteId)
      : and(
          isNull(tasks.note),
          pocketbookId ? eq(tasks.pocketbook, pocketbookId) : undefined,
        );

    return db.transaction((tx) => {
      let sortOrder = 0;
      if (insertAfterSortOrder !== null) {
        sortOrder = insertAfterSortOrder + 1;
        tx
          .update(tasks)
          .set({
            sortOrder: sql`${tasks.sortOrder} + 1`,
          })
          .where(and(groupCondition, gte(tasks.sortOrder, sortOrder)))
          .run();
      } else {
        const maxResult = tx
          .select({ maxOrder: max(tasks.sortOrder) })
          .from(tasks)
          .where(groupCondition)
          .get();
        sortOrder = (maxResult?.maxOrder ?? -1) + 1;
      }

      const [inserted] = tx
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
    });
  },
);
