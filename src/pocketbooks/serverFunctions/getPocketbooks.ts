import { createServerFn } from "@tanstack/react-start";
import { eq, isNull, sql } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import { tasks } from "src/tasks/tasks.schema";

export type GetPocketbooksInput = {
  userId: string | null;
};

export const getPocketbooksServerFn = createServerFn({ method: "GET" })
  .validator((input: GetPocketbooksInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const rows = await db
      .select()
      .from(pocketbooks)
      .where(
        data.userId
          ? eq(pocketbooks.user, data.userId)
          : isNull(pocketbooks.user),
      )
      .all();

    const noteCountRows = await db
      .select({
        pocketbook: notes.pocketbook,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(notes)
      .where(isNull(notes.deleted))
      .groupBy(notes.pocketbook)
      .all();
    const noteCountMap = new Map(
      noteCountRows.map((r) => [r.pocketbook, r.count]),
    );

    const taskCountRows = await db
      .select({
        pocketbook: tasks.pocketbook,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(tasks)
      .groupBy(tasks.pocketbook)
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
