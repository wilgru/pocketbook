import { eq, isNull, sql } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import { tasks } from "src/tasks/tasks.schema";
import type { PocketbookSchema } from "src/pocketbooks/pocketbooks.schema";

export type GetPocketbooksInput = {
  userId: string | null;
};

export type GetPocketbooksResult = {
  pocketbooks: Array<
    PocketbookSchema & { noteCount: number; taskCount: number }
  >;
};

createIpcHandler(
  "getPocketbooks",
  ({ userId }: GetPocketbooksInput): GetPocketbooksResult => {
    const rows = db
      .select()
      .from(pocketbooks)
      .where(userId ? eq(pocketbooks.user, userId) : isNull(pocketbooks.user))
      .all();

    const noteCountRows = db
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

    const taskCountRows = db
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
  },
);
