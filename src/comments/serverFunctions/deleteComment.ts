import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";

export type DeleteCommentInput = { commentId: string };

export const deleteCommentServerFn = createServerFn({ method: "POST" })
  .validator((input: DeleteCommentInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();

    await db
      .delete(commentNotes)
      .where(eq(commentNotes.commentId, data.commentId))
      .run();
    await db
      .delete(comments)
      .where(eq(comments.id, data.commentId))
      .run();

    return data.commentId;
  });
