import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/notes.schema";

export type CreateNoteInput = {
  title: string | null;
  content: string | null;
  isBookmarked: boolean;
  tagIds: string[];
  links: Link[];
  pocketbookId: string;
};

export const createNoteServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: CreateNoteInput) => input)
  .handler<Promise<Note>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(notes)
      .values({
        id,
        title: data.title,
        content: data.content ?? EMPTY_LEXICAL_CONTENT,
        isBookmarked: data.isBookmarked,
        links: data.links,
        pocketbookId: data.pocketbookId,
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

    const { tasks } = await getTasksServerFn({
      data: { pocketbookId: inserted.pocketbookId, noteIds: [id] },
    });

    const { tags } = await getTagsServerFn({
      data: { pocketbookId: inserted.pocketbookId, noteIds: [id] },
    });

    if (data.tagIds.length > 0) {
      await db
        .insert(noteTags)
        .values(data.tagIds.map((tagId) => ({ noteId: id, tagId })))
        .run();
    }

    return {
      ...inserted,
      tasks,
      tags,
      commentCount: 0,
    };
  });
