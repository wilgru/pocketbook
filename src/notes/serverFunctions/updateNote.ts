import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/notes.schema";

export type UpdateNoteInput = {
  noteId: string;
  title: string | null;
  content: string | null;
  isBookmarked: boolean;
  tagIds: string[];
  links: Link[];
};

export const updateNoteServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: UpdateNoteInput) => input)
  .handler<Promise<Note>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

    const [updated] = await db
      .update(notes)
      .set({
        title: data.title,
        content: data.content ?? EMPTY_LEXICAL_CONTENT,
        isBookmarked: data.isBookmarked,
        links: data.links,
        updated: now,
      })
      .where(eq(notes.id, data.noteId))
      .returning()
      .all();

    // Replace tags: delete existing, insert new
    await db.delete(noteTags).where(eq(noteTags.noteId, data.noteId)).run();

    const { tasks } = await getTasksServerFn({
      data: { pocketbookId: updated.pocketbookId },
    });

    const { tags } = await getTagsServerFn({
      data: { pocketbookId: updated.pocketbookId, noteId: data.noteId },
    });

    if (data.tagIds.length > 0) {
      await db
        .insert(noteTags)
        .values(data.tagIds.map((tagId) => ({ noteId: data.noteId, tagId })))
        .run();
    }

    return {
      ...updated,
      tasks,
      tags,
      commentCount: 0,
    };
  });
