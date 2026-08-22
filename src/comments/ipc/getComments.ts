import { eq } from "drizzle-orm";
import { comments, commentNotes } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import type { CommentSchema } from "src/comments/comments.schema";

export type GetCommentsInput = {
  pocketbookId: string;
};

export type GetCommentsResult = {
  comments: Array<CommentSchema & { noteIds: string[] }>;
};

createIpcHandler(
  "getComments",
  ({ pocketbookId }: GetCommentsInput): GetCommentsResult => {
    const rows = db
      .select()
      .from(comments)
      .where(eq(comments.pocketbook, pocketbookId))
      .all();

    const allCommentNotes =
      rows.length > 0 ? db.select().from(commentNotes).all() : [];

    const noteIdsByCommentId = new Map<string, string[]>();
    for (const commentNote of allCommentNotes) {
      const existing = noteIdsByCommentId.get(commentNote.commentId) ?? [];
      existing.push(commentNote.noteId);
      noteIdsByCommentId.set(commentNote.commentId, existing);
    }

    return {
      comments: rows.map((row: CommentSchema) => ({
        ...row,
        noteIds: noteIdsByCommentId.get(row.id) ?? [],
      })),
    };
  },
);
