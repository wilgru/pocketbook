import { Dayjs } from "dayjs";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/notes.schema";

export type CreateNoteInput = {
  title: string | null;
  content: string;
  isBookmarked: boolean;
  tags: string[];
  links: Link[];
  pocketbookId: string | null;
  userId: string | null;
};

createIpcHandler(
  "notes:create",
  ({
    title,
    content,
    isBookmarked,
    tags,
    links,
    pocketbookId,
    userId,
  }: CreateNoteInput): Note => {
    const now = new Dayjs();
    const id = crypto.randomUUID();

    const [inserted] = db
      .insert(notes)
      .values({
        id,
        title,
        content,
        isBookmarked,
        links,
        pocketbook: pocketbookId,
        user: userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    if (tags.length > 0) {
      db.insert(noteTags)
        .values(tags.map((tag) => ({ noteId: id, tagId: tag })))
        .run();
    }

    return {
      id: inserted.id,
      title: inserted.title,
      content: inserted.content,
      isBookmarked: inserted.isBookmarked,
      links: inserted.links,
      pocketbook: inserted.pocketbook,
      user: inserted.user,
      deleted: inserted.deleted,
      created: inserted.created,
      updated: inserted.updated,
      tasks: [],
      tags: [],
      commentCount: 0,
    };
  },
);
