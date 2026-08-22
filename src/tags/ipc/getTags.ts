import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tags, tagGroups } from "src/tags/tags.schema";
import type { TagSchema, TagGroupSchema } from "src/tags/tags.schema";

export type GetTagsInput = {
  pocketbookId: string;
};

export type GetTagsResult = {
  tags: TagSchema[];
  tagGroups: TagGroupSchema[];
};

createIpcHandler(
  "getTags",
  ({ pocketbookId }: GetTagsInput): GetTagsResult => {
    const tagRows = db
      .select()
      .from(tags)
      .where(eq(tags.pocketbook, pocketbookId))
      .all();

    const tagGroupRows = db
      .select()
      .from(tagGroups)
      .where(eq(tagGroups.pocketbook, pocketbookId))
      .all();

    return { tags: tagRows, tagGroups: tagGroupRows };
  },
);
