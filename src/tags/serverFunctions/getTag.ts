import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tags } from "src/tags/tags.schema";

export type GetTagInput = { tagId: string };

export const getTagServerFn = createServerFn({ method: "GET" })
  .validator((input: GetTagInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const row = await db
      .select()
      .from(tags)
      .where(eq(tags.id, data.tagId))
      .get();

    if (!row) {
      throw new Error(`Tag not found: ${data.tagId}`);
    }

    return row;
  });
