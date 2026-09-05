import { createServerFn } from "@tanstack/react-start";
import { isNull, sql } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import { tasks } from "src/tasks/tasks.schema";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

export const getPocketbooksServerFn = createServerFn({
  method: "GET",
  strict: false,
})
  .validator((input) => input)
  .handler<Promise<{ pocketbooks: Pocketbook[] }>>(async () => {
    const db = getDb();

    const rows = await db.select().from(pocketbooks).all();

    const noteCountRows = await db
      .select({
        pocketbook: notes.pocketbookId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(notes)
      .where(isNull(notes.deleted))
      .groupBy(notes.pocketbookId)
      .all();
    const noteCountMap = new Map(
      noteCountRows.map((r) => [r.pocketbook, r.count]),
    );

    const taskCountRows = await db
      .select({
        pocketbook: tasks.pocketbookId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(tasks)
      .groupBy(tasks.pocketbookId)
      .all();
    const taskCountMap = new Map(
      taskCountRows.map((r) => [r.pocketbook, r.count]),
    );

    return {
      pocketbooks: rows.map((j) => ({
        ...j,
        noteCount: noteCountMap.get(j.id) ?? 0,
        taskCount: taskCountMap.get(j.id) ?? 0,
      })),
    };
  });
