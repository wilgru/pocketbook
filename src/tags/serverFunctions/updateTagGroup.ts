import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";

export type UpdateTagGroupInput = {
  tagGroupId: string;
  title: string;
};

export const updateTagGroupServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdateTagGroupInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(tagGroups)
      .set({ title: data.title, updated: now })
      .where(eq(tagGroups.id, data.tagGroupId))
      .returning()
      .all();

    return updated;
  });
