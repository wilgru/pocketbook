import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";

export type UpdateCommentInput = {
  commentId: string;
  content: string | null;
  tint: string | null;
  isWaypoint: boolean;
  noteIds: string[];
};

export const updateCommentServerFn = createServerFn({ method: "POST" })
  .validator((input: UpdateCommentInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();

    const [updated] = await db
      .update(comments)
      .set({
        content: data.content,
        tint: data.tint,
        isWaypoint: data.isWaypoint,
        updated: now,
      })
      .where(eq(comments.id, data.commentId))
      .returning()
      .all();

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

    return updated;
  });
