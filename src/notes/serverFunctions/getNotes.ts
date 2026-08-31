import { createServerFn } from "@tanstack/react-start";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type GetNotesInput = {
  pocketbookId: string;
  isBookmarked?: boolean;
  createdAfter?: string;
  createdBefore?: string;
};

export const getNotesServerFn = createServerFn({ method: "GET" })
  .validator((input: GetNotesInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const conditions = [
      eq(notes.pocketbook, data.pocketbookId),
      isNull(notes.deleted),
    ];

    if (data.isBookmarked !== undefined) {
      conditions.push(eq(notes.isBookmarked, data.isBookmarked));
    }

    if (data.createdAfter) {
      conditions.push(gte(notes.created, data.createdAfter));
    }

    if (data.createdBefore) {
      conditions.push(lte(notes.created, data.createdBefore));
    }

    const rows = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .all();

    const allNoteTags =
      rows.length > 0 ? await db.select().from(noteTags).all() : [];

    const tagsByNoteId = new Map<string, string[]>();
    for (const noteTag of allNoteTags) {
      const existing = tagsByNoteId.get(noteTag.noteId) ?? [];
      existing.push(noteTag.tagId);
      tagsByNoteId.set(noteTag.noteId, existing);
    }

    return {
      notes: rows.map((row) => ({
        ...row,
        tagIds: tagsByNoteId.get(row.id) ?? [],
      })),
    };
  });
