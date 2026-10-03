import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

export type GetPocketbookInput = { pocketbookId: string };

export const getPocketbookServerFn = createServerFn({
  method: "GET",
  strict: false,
})
  .validator((input: GetPocketbookInput) => input)
  .handler<Promise<Pocketbook>>(async ({ data }) => {
    const db = getDb();

    const pocketbookRow = await db
      .select()
      .from(pocketbooks)
      .where(eq(pocketbooks.id, data.pocketbookId))
      .get();

    if (!pocketbookRow) {
      throw new Error(`Pocketbook not found: ${data.pocketbookId}`);
    }

    return { ...pocketbookRow, noteCount: 0, taskCount: 0 };
  });
