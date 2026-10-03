import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type DeleteNoteInput = { noteId: string };

export const deleteNoteServerFn = createServerFn({ method: "POST" })
  .validator((input: DeleteNoteInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db.delete(noteTags).where(eq(noteTags.noteId, data.noteId)).run();
    await db.delete(notes).where(eq(notes.id, data.noteId)).run();

    return data.noteId;
  });
