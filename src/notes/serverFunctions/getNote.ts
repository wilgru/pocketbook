import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import type { Note } from "src/notes/notes.schema";

export type GetNoteInput = { noteId: string };

export const getNoteServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetNoteInput) => input)
  .handler<Promise<Note>>(async ({ data }) => {
    const db = getDb();

    const noteRow = await db
      .select()
      .from(notes)
      .where(eq(notes.id, data.noteId))
      .get();

    if (!noteRow) {
      throw new Error(`Note not found: ${data.noteId}`);
    }

    const { tasks } = await getTasksServerFn({
      data: { pocketbookId: noteRow.pocketbookId },
    });

    const { tags } = await getTagsServerFn({
      data: { pocketbookId: noteRow.pocketbookId, noteId: data.noteId },
    });

    return {
      ...noteRow,
      tasks,
      tags,
      commentCount: 0,
    };
  });
