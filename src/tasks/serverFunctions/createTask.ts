import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { and, eq, gte, isNull, max, sql } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tasks } from "src/tasks/tasks.schema";
import type { Dayjs } from "dayjs";
import type { Link } from "src/common/types/Link.type";
import type { Task } from "src/tasks/tasks.schema";

export type CreateTaskInput = {
  title: string;
  description: string;
  link: string; // TODO: what is this link?
  links: Link[];
  isImportant: boolean;
  noteId: string | null;
  dueDate: Dayjs | null;
  pocketbookId: string;
  insertAfterSortOrder: number | null;
};

export const createTaskServerFn = createServerFn({
  method: "POST",
  strict: false, // todo: remove all these strict props from server functions now
})
  .validator((input: CreateTaskInput) => input)
  .handler(async ({ data }): Promise<Task> => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const groupCondition = data.noteId
      ? eq(tasks.noteId, data.noteId)
      : and(
          isNull(tasks.noteId),
          data.pocketbookId
            ? eq(tasks.pocketbookId, data.pocketbookId)
            : undefined,
        );

    let newSortOrder = 0;

    if (data.insertAfterSortOrder !== null) {
      newSortOrder = data.insertAfterSortOrder + 1;

      // Shift all tasks at or above the insertion point up by 1
      await db
        .update(tasks)
        .set({ sortOrder: sql`${tasks.sortOrder} + 1` })
        .where(and(groupCondition, gte(tasks.sortOrder, newSortOrder)))
        .run();
    } else {
      // Append after the current highest sort order
      const maxResult = await db
        .select({ maxOrder: max(tasks.sortOrder) })
        .from(tasks)
        .where(groupCondition)
        .get();

      newSortOrder = (maxResult?.maxOrder ?? -1) + 1;
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
        noteId: data.noteId,
        dueDate: data.dueDate,
        sortOrder: newSortOrder,
        pocketbookId: data.pocketbookId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return { ...inserted, note: null };
  });
