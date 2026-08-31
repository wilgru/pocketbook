import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { noteTags } from "src/notes/notes.schema";
import { tags } from "src/tags/tags.schema";

export type DeleteTagInput = { tagId: string };

export const deleteTagServerFn = createServerFn({ method: "POST" })
  .validator((input: DeleteTagInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db.delete(noteTags).where(eq(noteTags.tagId, data.tagId)).run();
    await db.delete(tags).where(eq(tags.id, data.tagId)).run();

    return data.tagId;
  });
