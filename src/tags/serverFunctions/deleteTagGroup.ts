import { createServerFn } from "@tanstack/react-start";
import { credentialsMiddleware } from "src/credentials/credentialsMiddleware";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";

export type DeleteTagGroupInput = { tagGroupId: string };

export const deleteTagGroupServerFn = createServerFn({ method: "POST" })
  .middleware([credentialsMiddleware])
  .validator((input: DeleteTagGroupInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db.delete(tagGroups).where(eq(tagGroups.id, data.tagGroupId)).run();

    return data.tagGroupId;
  });
