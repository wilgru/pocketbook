import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import { tags } from "src/tags/tags.schema";
import type { Note } from "src/notes/notes.schema";

export type GetNotesInput = {
  pocketbookId: string;
  isBookmarked?: boolean;
  tagIds?: string[];
};

export const getNotesServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetNotesInput) => input)
  .handler<Promise<{ notes: Note[] }>>(async ({ data }) => {
    const db = getDb();

    const conditions = [
      eq(notes.pocketbookId, data.pocketbookId),
      isNull(notes.deleted),
    ];

    if (data.isBookmarked !== undefined) {
      conditions.push(eq(notes.isBookmarked, data.isBookmarked));
    }

    if (data.tagIds) {
      const noteTagRows = await db
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .where(inArray(noteTags.tagId, data.tagIds))
        .all();

      const noteTagIds = noteTagRows.map((noteTagRow) => noteTagRow.noteId);

      conditions.push(inArray(tags.id, noteTagIds));
    }

    const noteRows = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .all();

    return {
      notes: noteRows.map((row) => ({
        ...row,
        tags: [], // todo get tags?
        tasks: [], // todo get tasks?
        commentCount: 0,
      })),
    };
  });
