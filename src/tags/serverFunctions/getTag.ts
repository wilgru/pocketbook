import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { Tag } from "src/tags/tags.schema";

export type GetTagInput = { tagId: string };

export const getTagServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTagInput) => input)
  .handler<Promise<Tag>>(async ({ data }) => {
    const db = getDb();

    const tagRow = await db
      .select()
      .from(tags)
      .where(eq(tags.id, data.tagId))
      .get();

    if (!tagRow) {
      throw new Error(`Tag not found: ${data.tagId}`);
    }

    return { ...tagRow, noteCount: 0 };
  });
