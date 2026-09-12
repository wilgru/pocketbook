import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { getDb } from "src/db/connection";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { tagGroups } from "src/tags/tags.schema";
import type { TagGroup } from "src/tags/tags.schema";

export type CreateTagGroupInput = {
  title: string;
  pocketbookId: string | null;
};

export const createTagGroupServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .validator((input: CreateTagGroupInput) => input)
  .handler<Promise<TagGroup>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(tagGroups)
      .values({
        id,
        title: data.title,
        pocketbookId: data.pocketbookId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    const { tags } = inserted.pocketbookId
      ? await getTagsServerFn({
          data: {
            pocketbookId: inserted.pocketbookId,
            tagGroupIds: [inserted.id],
          },
        })
      : { tags: [] };

    return { ...inserted, tags };
  });
