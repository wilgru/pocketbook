import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type GetNoteInput = { noteId: string };

export const getNoteServerFn = createServerFn({ method: "GET" })
  .validator((input: GetNoteInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const row = await db
      .select()
      .from(notes)
      .where(eq(notes.id, data.noteId))
      .get();

    if (!row) {
      throw new Error(`Note not found: ${data.noteId}`);
    }

    const tags = await db
      .select()
      .from(noteTags)
      .where(eq(noteTags.noteId, data.noteId))
      .all();

    return {
      note: row,
      tagIds: tags.map((t) => t.tagId),
    };
  });
