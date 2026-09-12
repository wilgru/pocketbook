import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes, noteTags } from "src/notes/notes.schema";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import type { Note } from "src/notes/notes.schema";
import type { Tag } from "src/tags/tags.schema";

export type GetNotesInput = {
  pocketbookId: string;
  isBookmarked?: boolean;
  tagIds?: string[];
};

export const getNotesServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetNotesInput) => input)
  .handler<Promise<{ notes: Note[] }>>(async ({ data }) => {
    const db = getDb();

    const conditions = [
      eq(notes.pocketbookId, data.pocketbookId),
      isNull(notes.deleted),
    ];

    if (data.isBookmarked !== undefined) {
      conditions.push(eq(notes.isBookmarked, data.isBookmarked));
    }

    if (data.tagIds) {
      const noteTagRows = await db
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .where(inArray(noteTags.tagId, data.tagIds))
        .all();

      const noteTagIds = noteTagRows.map((noteTagRow) => noteTagRow.noteId);

      conditions.push(inArray(notes.id, noteTagIds));
    }

    const noteRows = await db
      .select()
      .from(notes)
      .where(and(...conditions))
      .all();

    const noteIds = noteRows.map((note) => note.id);

    const { tasks } = await getTasksServerFn({
      data: { pocketbookId: data.pocketbookId, noteIds },
    });

    const { tags: pocketbookTags } = await getTagsServerFn({
      data: { pocketbookId: data.pocketbookId, noteIds },
    });

    const noteTagRows = await db
      .select()
      .from(noteTags)
      .where(inArray(noteTags.noteId, noteIds))
      .all();

    const tagById = new Map(pocketbookTags.map((tag) => [tag.id, tag]));
    const tagIdsByNoteId = new Map<string, string[]>();
    for (const noteTag of noteTagRows) {
      const existing = tagIdsByNoteId.get(noteTag.noteId) ?? [];
      existing.push(noteTag.tagId);
      tagIdsByNoteId.set(noteTag.noteId, existing);
    }

    return {
      notes: noteRows.map((row) => {
        const noteTagIds = tagIdsByNoteId.get(row.id) ?? [];
        const noteTagsList = noteTagIds
          .map((tagId) => tagById.get(tagId))
          .filter((tag): tag is Tag => tag !== undefined);

        const noteTasks = tasks.filter((task) => task.noteId === row.id);

        return {
          ...row,
          tags: noteTagsList,
          tasks: noteTasks,
          commentCount: 0,
        };
      }),
    };
  });
