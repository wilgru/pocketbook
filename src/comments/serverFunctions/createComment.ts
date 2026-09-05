import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { inArray } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { Note } from "src/notes/notes.schema";

export type CreateCommentInput = {
  content: string | null;
  colour: Colour | null;
  isWaypoint: boolean;
  noteIds: string[];
  pocketbookId: string | null;
};

export const createCommentServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: CreateCommentInput) => input)
  .handler<Promise<Comment>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(comments)
      .values({
        id,
        content: data.content ?? EMPTY_LEXICAL_CONTENT,
        colour: data.colour,
        isWaypoint: data.isWaypoint,
        pocketbookId: data.pocketbookId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    if (data.noteIds.length > 0) {
      await db
        .insert(commentNotes)
        .values(data.noteIds.map((noteId) => ({ commentId: id, noteId })))
        .run();
    }

    const noteRows =
      data.noteIds.length > 0
        ? await db
            .select()
            .from(notes)
            .where(inArray(notes.id, data.noteIds))
            .all()
        : [];

    const rowNotes: Note[] = noteRows.map((noteRow) => ({
      ...noteRow,
      tasks: [],
      tags: [],
      commentCount: 0,
    }));

    return { ...inserted, notes: rowNotes };
  });
