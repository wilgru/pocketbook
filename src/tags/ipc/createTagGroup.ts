import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";
import type { TagGroupSchema } from "src/tags/tags.schema";

export type CreateTagGroupInput = {
  title: string;
  pocketbookId: string | null;
  userId: string | null;
};

createIpcHandler(
  "createTagGroup",
  ({ title, pocketbookId, userId }: CreateTagGroupInput): TagGroupSchema => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = db
      .insert(tagGroups)
      .values({
        id,
        title,
        pocketbook: pocketbookId,
        user: userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    return inserted;
  },
);
