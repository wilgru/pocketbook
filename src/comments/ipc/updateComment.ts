import { eq } from "drizzle-orm";
import { comments, commentNotes } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import type { CommentSchema } from "src/comments/comments.schema";

export type UpdateCommentInput = {
  commentId: string;
  content: string | null;
  tint: string | null;
  isWaypoint: boolean;
  noteIds: string[];
};

createIpcHandler(
  "updateComment",
  ({
    commentId,
    content,
    tint,
    isWaypoint,
    noteIds,
  }: UpdateCommentInput): CommentSchema => {
    const now = new Date().toISOString();

    const [updated] = db
      .update(comments)
      .set({ content, tint, isWaypoint, updated: now })
      .where(eq(comments.id, commentId))
      .returning()
      .all();

    db.delete(commentNotes).where(eq(commentNotes.commentId, commentId)).run();

    if (noteIds.length > 0) {
      db.insert(commentNotes)
        .values(noteIds.map((noteId) => ({ commentId, noteId })))
        .run();
    }

    return updated;
  },
);
