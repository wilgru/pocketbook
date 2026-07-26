import { eq } from "drizzle-orm";
import { comments, commentNotes } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import type { CommentSchema } from "src/comments/comments.schema";

export type GetCommentInput = { commentId: string };

export type GetCommentResult = {
  comment: CommentSchema;
  noteIds: string[];
};

createIpcHandler(
  "comments:getOne",
  ({ commentId }: GetCommentInput): GetCommentResult => {
    const row = db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .get();

    if (!row) {
      throw new Error(`Comment not found: ${commentId}`);
    }

    const notes = db
      .select()
      .from(commentNotes)
      .where(eq(commentNotes.commentId, commentId))
      .all();

    return {
      comment: row,
      noteIds: notes.map(
        (n: { commentId: string; noteId: string }) => n.noteId,
      ),
    };
  },
);
