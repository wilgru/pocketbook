import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, isNull, max, sql } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";

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

export const createTaskServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateTaskInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const groupCondition = data.noteId
      ? eq(tasks.note, data.noteId)
      : and(
          isNull(tasks.note),
          data.pocketbookId
            ? eq(tasks.pocketbook, data.pocketbookId)
            : undefined,
        );

    let sortOrder = 0;

    if (data.insertAfterSortOrder !== null) {
      sortOrder = data.insertAfterSortOrder + 1;

      // Shift all tasks at or above the insertion point up by 1
      await db
        .update(tasks)
        .set({ sortOrder: sql`${tasks.sortOrder} + 1` })
        .where(and(groupCondition, gte(tasks.sortOrder, sortOrder)))
        .run();
    } else {
      // Append after the current highest sort order
      const maxResult = await db
        .select({ maxOrder: max(tasks.sortOrder) })
        .from(tasks)
        .where(groupCondition)
        .get();
      sortOrder = (maxResult?.maxOrder ?? -1) + 1;
    }

    const [inserted] = await db
      .insert(tasks)
      .values({
        id,
        title: data.title,
        description: data.description,
        link: data.link,
        links: data.links,
        isImportant: data.isImportant,
        note: data.noteId,
        dueDate: data.dueDate,
        sortOrder,
        pocketbook: data.pocketbookId,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  });
