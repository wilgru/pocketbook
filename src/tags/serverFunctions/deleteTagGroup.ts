import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";

export type DeleteTagGroupInput = { tagGroupId: string };

export const deleteTagGroupServerFn = createServerFn({ method: "POST" })
  .validator((input: DeleteTagGroupInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db.delete(tagGroups).where(eq(tagGroups.id, data.tagGroupId)).run();

    return data.tagGroupId;
  });
