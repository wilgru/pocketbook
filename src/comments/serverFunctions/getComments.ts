import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";

export type GetCommentsInput = {
  pocketbookId: string;
};

export const getCommentsServerFn = createServerFn({ method: "GET" })
  .validator((input: GetCommentsInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    const rows = await db
      .select()
      .from(comments)
      .where(eq(comments.pocketbook, data.pocketbookId))
      .all();

    const allCommentNotes =
      rows.length > 0 ? await db.select().from(commentNotes).all() : [];

    const noteIdsByCommentId = new Map<string, string[]>();
    for (const commentNote of allCommentNotes) {
      const existing = noteIdsByCommentId.get(commentNote.commentId) ?? [];
      existing.push(commentNote.noteId);
      noteIdsByCommentId.set(commentNote.commentId, existing);
    }

    return {
      comments: rows.map((row) => ({
        ...row,
        noteIds: noteIdsByCommentId.get(row.id) ?? [],
      })),
    };
  });
