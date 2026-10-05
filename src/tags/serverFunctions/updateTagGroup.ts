import { createServerFn } from "@tanstack/react-start";
import { credentialsMiddleware } from "src/credentials/credentialsMiddleware";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { tagGroups } from "src/tags/tags.schema";
import type { TagGroup } from "src/tags/tags.schema";

export type UpdateTagGroupInput = {
  tagGroupId: string;
  title?: string;
  layout?: TagGroup["layout"];
  groupBy?: TagGroup["groupBy"];
  sortBy?: TagGroup["sortBy"];
  sortDirection?: TagGroup["sortDirection"];
};

export const updateTagGroupServerFn = createServerFn({
  method: "POST",
  strict: false,
})
  .middleware([credentialsMiddleware])
  .validator((input: UpdateTagGroupInput) => input)
  .handler<Promise<TagGroup>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const { tagGroupId, ...changes } = data;
    const definedChanges = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );

    const [updated] = await db
      .update(tagGroups)
      .set({ ...definedChanges, updated: now })
      .where(eq(tagGroups.id, tagGroupId))
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
