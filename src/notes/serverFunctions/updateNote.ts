import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type UpdateNoteInput = {
  noteId: string;
  title: string | null;
  content: string | null;
  isBookmarked: boolean;
  tagIds: string[];
  links: string;
};

export const updateNoteServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdateNoteInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(notes)
      .set({
        title: data.title,
        content: data.content,
        isBookmarked: data.isBookmarked,
        links: data.links,
        updated: now,
      })
      .where(eq(notes.id, data.noteId))
      .returning()
      .all();

    // Replace tags: delete existing, insert new
    await db.delete(noteTags).where(eq(noteTags.noteId, data.noteId)).run();

    if (data.tagIds.length > 0) {
      await db
        .insert(noteTags)
        .values(data.tagIds.map((tagId) => ({ noteId: data.noteId, tagId })))
        .run();
    }

    return updated;
  });
