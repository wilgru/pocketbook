import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { tagGroups } from "src/tags/tags.schema";
import type { TagGroup } from "src/tags/tags.schema";

export type UpdateTagGroupInput = {
  tagGroupId: string;
  title: string;
};

export const updateTagGroupServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: UpdateTagGroupInput) => input)
  .handler<Promise<TagGroup>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

    const [updated] = await db
      .update(tagGroups)
      .set({ title: data.title, updated: now })
      .where(eq(tagGroups.id, data.tagGroupId))
      .returning()
      .all();

    const { tags } = updated.pocketbookId
      ? await getTagsServerFn({
          data: {
            pocketbookId: updated.pocketbookId,
            tagGroupIds: [updated.id],
          },
        })
      : { tags: [] };

    return { ...updated, tags };
  });
