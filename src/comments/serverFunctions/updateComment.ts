import { createServerFn } from "@tanstack/react-start";
import dayjs from "dayjs";
import { eq, inArray } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { Note } from "src/notes/notes.schema";

export type UpdateCommentInput = {
  commentId: string;
  content: string | null;
  colour: Colour | null;
  isWaypoint: boolean;
  noteIds: string[];
};

export const updateCommentServerFn = createServerFn({
  method: "POST",
  strict: { output: false },
})
  .validator((input: UpdateCommentInput) => input)
  .handler<Promise<Comment>>(async ({ data }) => {
    const db = getDb();
    const now = dayjs();

    const [updated] = await db
      .update(comments)
      .set({
        content: data.content ?? EMPTY_LEXICAL_CONTENT,
        colour: data.colour,
        isWaypoint: data.isWaypoint,
        updated: now,
      })
      .where(eq(comments.id, data.commentId))
      .returning()
      .all();

    // Replace note links: delete existing, insert new
    await db
      .delete(commentNotes)
      .where(eq(commentNotes.commentId, data.commentId))
      .run();

    if (data.noteIds.length > 0) {
      await db
        .insert(commentNotes)
        .values(
          data.noteIds.map((noteId) => ({ commentId: data.commentId, noteId })),
        )
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
    })); // Not returning actual tasks, tags, or comment count for now, as we probably dont need them in the context of comments (at least not yet)

    return { ...updated, notes: rowNotes };
  });
