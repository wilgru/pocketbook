import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { noteTags } from "src/notes/notes.schema";
import { tags } from "src/tags/tags.schema";
import type { Tag } from "src/tags/tags.schema";

export type GetTagsInput = {
  pocketbookId: string;
  noteIds?: string[];
  tagGroupIds?: string[];
  hasNoTagGroup?: boolean;
};

export const getTagsServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetTagsInput) => input)
  .handler<Promise<{ tags: Tag[] }>>(async ({ data }) => {
    const db = getDb();

    const conditions = [eq(tags.pocketbookId, data.pocketbookId)];

    if (data.noteIds) {
      const noteTagRows = await db
        .select({ tagId: noteTags.tagId })
        .from(noteTags)
        .where(inArray(noteTags.noteId, data.noteIds))
        .all();

      const noteTagIds = noteTagRows.map((r) => r.tagId);

      if (noteTagIds.length === 0) {
        return { tags: [] };
      }

      conditions.push(inArray(tags.id, noteTagIds));
    }

    if (data.tagGroupIds) {
      conditions.push(inArray(tags.tagGroupId, data.tagGroupIds));
    }

    if (data.hasNoTagGroup) {
      conditions.push(eq(tags.tagGroupId, "")); // TODO check this actually works
    }

    const tagRows = await db
      .select()
      .from(tags)
      .where(and(...conditions))
      .all();

    return {
      tags: tagRows.map((tagRow) => {
        return { ...tagRow, noteCount: 0 }; // TODO: get note counts
      }),
    };
  });
