import { createServerFn } from "@tanstack/react-start";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";

export type CreateCommentInput = {
  content: string | null;
  tint: string | null;
  isWaypoint: boolean;
  noteIds: string[];
  pocketbookId: string | null;
  userId: string | null;
};

export const createCommentServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateCommentInput) => input)
  .handler(async ({ data }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const [inserted] = await db
      .insert(comments)
      .values({
        id,
        content: data.content,
        tint: data.tint,
        isWaypoint: data.isWaypoint,
        pocketbook: data.pocketbookId,
        user: data.userId,
        created: now,
        updated: now,
      })
      .returning()
      .all();

    if (data.noteIds.length > 0) {
      await db
        .insert(commentNotes)
        .values(data.noteIds.map((noteId) => ({ commentId: id, noteId })))
        .run();
    }

    return inserted;
  });
