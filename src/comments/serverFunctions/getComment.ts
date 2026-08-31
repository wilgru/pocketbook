import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";

export type GetCommentInput = { commentId: string };

export const getCommentServerFn = createServerFn({ method: "GET" })
  .validator((input: GetCommentInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const row = await db
      .select()
      .from(comments)
      .where(eq(comments.id, data.commentId))
      .get();

    if (!row) {
      throw new Error(`Comment not found: ${data.commentId}`);
    }

    const noteRows = await db
      .select()
      .from(commentNotes)
      .where(eq(commentNotes.commentId, data.commentId))
      .all();

    return {
      comment: row,
      noteIds: noteRows.map((n) => n.noteId),
    };
  });
