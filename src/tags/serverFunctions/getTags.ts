import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tagGroups, tags } from "src/tags/tags.schema";

export type GetTagsInput = {
  pocketbookId: string;
};

export const getTagsServerFn = createServerFn({ method: "GET" })
  .validator((input: GetTagsInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const tagRows = await db
      .select()
      .from(tags)
      .where(eq(tags.pocketbook, data.pocketbookId))
      .all();

    const tagGroupRows = await db
      .select()
      .from(tagGroups)
      .where(eq(tagGroups.pocketbook, data.pocketbookId))
      .all();

    return { tags: tagRows, tagGroups: tagGroupRows };
  });
