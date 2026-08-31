import { createServerFn } from "@tanstack/react-start";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";

export type CreateNoteInput = {
  title: string | null;
  content: string | null;
  isBookmarked: boolean;
  tagIds: string[];
  links: string;
  pocketbookId: string | null;
  userId: string | null;
};

export const createNoteServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateNoteInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(notes)
      .values({
        id,
        title: data.title,
        content: data.content,
        isBookmarked: data.isBookmarked,
        links: data.links,
        pocketbook: data.pocketbookId,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    if (data.tagIds.length > 0) {
      await db
        .insert(noteTags)
        .values(data.tagIds.map((tagId) => ({ noteId: id, tagId })))
        .run();
    }

    return inserted;
  });
