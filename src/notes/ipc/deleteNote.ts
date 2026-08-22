import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type DeleteNoteInput = { noteId: string };

createIpcHandler("deleteNote", ({ noteId }: DeleteNoteInput): string => {
  db.delete(noteTags).where(eq(noteTags.noteId, noteId)).run();
  db.delete(notes).where(eq(notes.id, noteId)).run();

  return noteId;
});
