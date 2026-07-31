import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { Note } from "src/notes/notes.schema";

export type GetNoteInput = { noteId: string };

createIpcHandler("notes:getOne", ({ noteId }: GetNoteInput): Note => {
  const row = db.select().from(notes).where(eq(notes.id, noteId)).get();

  if (!row) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const notetagRows = db
    .select()
    .from(noteTags)
    .where(eq(noteTags.noteId, noteId))
    .all();

  // const tagRows = use the tags ipc here

  return {
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
  };
});
