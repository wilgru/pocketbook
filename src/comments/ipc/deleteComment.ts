import { eq } from "drizzle-orm";
import { comments, commentNotes } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";

export type DeleteCommentInput = { commentId: string };

createIpcHandler(
  "comments:delete",
  ({ commentId }: DeleteCommentInput): string => {
    db.delete(commentNotes).where(eq(commentNotes.commentId, commentId)).run();
    db.delete(comments).where(eq(comments.id, commentId)).run();

    return commentId;
  },
);
