import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";
import type { TagGroupSchema } from "src/tags/tags.schema";

export type UpdateTagGroupInput = {
  tagGroupId: string;
  title: string;
};

createIpcHandler(
  "updateTagGroup",
  ({ tagGroupId, title }: UpdateTagGroupInput): TagGroupSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(tagGroups)
      .set({ title, updated: now })
      .where(eq(tagGroups.id, tagGroupId))
      .returning()
      .all();

    return updated;
  },
);
