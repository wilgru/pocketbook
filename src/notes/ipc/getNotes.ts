import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { Dayjs } from "dayjs";
import type { Note } from "src/notes/notes.schema";

export type GetNotesInput = {
  pocketbookId: string;
  isBookmarked?: boolean;
  createdAfter?: Dayjs;
  createdBefore?: Dayjs;
};

createIpcHandler(
  "notes:getAll",
  ({
    pocketbookId,
    isBookmarked,
    createdAfter,
    createdBefore,
  }: GetNotesInput): Note[] => {
    const conditions = [
      eq(notes.pocketbook, pocketbookId),
      isNull(notes.deleted),
    ];

    if (isBookmarked !== undefined) {
      conditions.push(eq(notes.isBookmarked, isBookmarked));
    }

    if (createdAfter) {
      conditions.push(gte(notes.created, createdAfter));
    }

    if (createdBefore) {
      conditions.push(lte(notes.created, createdBefore));
    }

    const rows = db
      .select()
      .from(notes)
      .where(and(...conditions))
      .all();

    const allNoteTags = rows.length > 0 ? db.select().from(noteTags).all() : [];

    const tagsByNoteId = new Map<string, string[]>();
    for (const noteTag of allNoteTags) {
      const existing = tagsByNoteId.get(noteTag.noteId) ?? [];
      existing.push(noteTag.tagId);
      tagsByNoteId.set(noteTag.noteId, existing);
    }

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      isBookmarked: row.isBookmarked,
      links: row.links,
      pocketbook: row.pocketbook,
      user: row.user,
      deleted: row.deleted,
      created: row.created,
      updated: row.updated,
      tasks: [],
      tags: [],
      commentCount: 0,
    }));
  },
);
