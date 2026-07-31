import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { NoteSchema } from "src/notes/notes.schema";

export type GetNoteInput = { noteId: string };

export type GetNoteResult = {
  note: NoteSchema;
  tagIds: string[];
};

createIpcHandler("notes:getOne", ({ noteId }: GetNoteInput): GetNoteResult => {
  const row = db.select().from(notes).where(eq(notes.id, noteId)).get();

  if (!row) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const tags = db
    .select()
    .from(noteTags)
    .where(eq(noteTags.noteId, noteId))
    .all();

  return {
    note: {
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
    },
    tagIds: tags.map((t) => t.tagId),
  };
});
