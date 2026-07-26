import { comments, commentNotes } from "src/comments/comments.schema";
import { createIpcHandler } from "src/common/utils/createIpcHandler";
import { db } from "src/db/connection";
import type { CommentSchema } from "src/comments/comments.schema";

export type CreateCommentInput = {
  content: string | null;
  tint: string | null;
  isWaypoint: boolean;
  noteIds: string[];
  pocketbookId: string | null;
  userId: string | null;
};

createIpcHandler(
  "comments:create",
  ({
    content,
    tint,
    isWaypoint,
    noteIds,
    pocketbookId,
    userId,
  }: CreateCommentInput): CommentSchema => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = db
      .insert(comments)
      .values({
        id,
        content,
        tint,
        isWaypoint,
        pocketbook: pocketbookId,
        user: userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    if (noteIds.length > 0) {
      db.insert(commentNotes)
        .values(noteIds.map((noteId) => ({ commentId: id, noteId })))
        .run();
    }

    return inserted;
  },
);
