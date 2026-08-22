import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";

export type DeletePocketbookInput = { pocketbookId: string };

createIpcHandler(
  "deletePocketbook",
  ({ pocketbookId }: DeletePocketbookInput): string => {
    db.delete(pocketbooks).where(eq(pocketbooks.id, pocketbookId)).run();

    return pocketbookId;
  },
);
