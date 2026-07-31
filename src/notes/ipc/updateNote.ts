import { Dayjs } from "dayjs";
import { eq } from "drizzle-orm";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/notes.schema";
import type { Tag } from "src/tags/Tag.type";

export type UpdateNoteInput = {
  noteId: string;
  title: string | null;
  content: string;
  isBookmarked: boolean;
  tags: Tag[];
  links: Link[];
};

createIpcHandler(
  "notes:update",
  ({
    noteId,
    title,
    content,
    isBookmarked,
    tags,
    links,
  }: UpdateNoteInput): Note => {
    const [updated] = db
      .update(notes)
      .set({
        title: title,
        content: content,
        isBookmarked: isBookmarked,
        links: links,
        updated: new Dayjs(),
      })
      .where(eq(notes.id, noteId))
      .returning()
      .all();

    // Replace tags: delete existing, insert new
    db.delete(noteTags).where(eq(noteTags.noteId, noteId)).run();

    if (tags.length > 0) {
      db.insert(noteTags)
        .values(tags.map((tag) => ({ noteId: noteId, tagId: tag.id })))
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
      tasks: [],
      tags: [],
      commentCount: 0,
    };
  },
);
