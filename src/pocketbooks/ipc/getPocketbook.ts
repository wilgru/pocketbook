import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { PocketbookSchema } from "src/pocketbooks/pocketbooks.schema";

export type GetPocketbookInput = { pocketbookId: string };

createIpcHandler(
  "getPocketbook",
  ({ pocketbookId }: GetPocketbookInput): PocketbookSchema => {
    const row = db
      .select()
      .from(pocketbooks)
      .where(eq(pocketbooks.id, pocketbookId))
      .get();

    if (!row) {
      throw new Error(`Pocketbook not found: ${pocketbookId}`);
    }

    return row;
  },
);
