import { createServerFn } from "@tanstack/react-start";
import { credentialsMiddleware } from "src/credentials/credentialsMiddleware";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";

export type DeletePocketbookInput = { pocketbookId: string };

export const deletePocketbookServerFn = createServerFn({ method: "POST" })
  .middleware([credentialsMiddleware])
  .validator((input: DeletePocketbookInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db
      .delete(pocketbooks)
      .where(eq(pocketbooks.id, data.pocketbookId))
      .run();

    return data.pocketbookId;
  });
