import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { tagGroups } from "src/tags/tags.schema";
import { getTagsServerFn } from "./getTags";
import type { Tag, TagGroup } from "src/tags/tags.schema";

export type GetTagGroupsInput = {
  pocketbookId: string;
};

export const getTagGroupsServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTagGroupsInput) => input)
  .handler<Promise<{ tagGroups: TagGroup[]; ungroupedTags: Tag[] }>>(
    async ({ data }) => {
      const db = getDb();

      const tagGroupRows = await db
        .select()
        .from(tagGroups)
        .where(eq(tagGroups.pocketbookId, data.pocketbookId))
        .all();

      const { tags } = await getTagsServerFn({
        data: { pocketbookId: data.pocketbookId },
      });

      const ungroupedTags: Tag[] = [];

      const tagGroupsWithTags: TagGroup[] = tagGroupRows.map((tagGroupRow) => {
        return { ...tagGroupRow, tags: [] };
      });

      tags.forEach((tag) => {
        if (tag.tagGroupId) {
          const tagGroup = tagGroupsWithTags.find(
            (group) => group.id === tag.tagGroupId,
          );

          if (tagGroup) {
            tagGroup.tags.push(tag);
          }
        } else {
          ungroupedTags.push(tag);
        }
      });

      return {
        tagGroups: tagGroupsWithTags,
        ungroupedTags: tags,
      };
    },
  );
