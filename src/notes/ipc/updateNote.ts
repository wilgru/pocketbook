import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { NoteSchema } from "src/notes/notes.schema";

export type UpdateNoteInput = {
  noteId: string;
  title: string | null;
  content: string | null;
  isBookmarked: boolean;
  tagIds: string[];
  links: string;
};

createIpcHandler(
  "notes:update",
  ({
    noteId,
    title,
    content,
    isBookmarked,
    tagIds,
    links,
  }: UpdateNoteInput): NoteSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(notes)
      .set({
        title: title,
        content: content,
        isBookmarked: isBookmarked,
        links: links,
        updated: now,
      })
      .where(eq(notes.id, noteId))
      .returning()
      .all();

    // Replace tags: delete existing, insert new
    db.delete(noteTags).where(eq(noteTags.noteId, noteId)).run();

    if (tagIds.length > 0) {
      db.insert(noteTags)
        .values(tagIds.map((tagId) => ({ noteId: noteId, tagId })))
        .run();
    }

    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      isBookmarked: updated.isBookmarked,
      links: updated.links,
      pocketbook: updated.pocketbook,
      user: updated.user,
      deleted: updated.deleted,
      created: updated.created,
      updated: updated.updated,
    };
  },
);
