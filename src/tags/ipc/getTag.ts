import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tags } from "src/tags/tags.schema";
import type { TagSchema } from "src/tags/tags.schema";

export type GetTagInput = { tagId: string };

createIpcHandler("getTag", ({ tagId }: GetTagInput): TagSchema => {
  const row = db.select().from(tags).where(eq(tags.id, tagId)).get();

  if (!row) {
    throw new Error(`Tag not found: ${tagId}`);
  }

  return row;
});
