import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";

export type GetPocketbookInput = { pocketbookId: string };

export const getPocketbookServerFn = createServerFn({ method: "GET" })
  .validator((input: GetPocketbookInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const row = await db
      .select()
      .from(pocketbooks)
      .where(eq(pocketbooks.id, data.pocketbookId))
      .get();

    if (!row) {
      throw new Error(`Pocketbook not found: ${data.pocketbookId}`);
    }

    return row;
  });
