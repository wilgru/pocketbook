import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray } from "drizzle-orm";
import { commentNotes, comments } from "src/comments/comments.schema";
import { getDb } from "src/db/connection";
import { notes } from "src/notes/notes.schema";
import type { Comment } from "src/comments/comments.schema";
import type { Note } from "src/notes/notes.schema";

export type GetCommentsInput = {
  pocketbookId: string;
  noteId?: string;
};

export const getCommentsServerFn = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((input: GetCommentsInput) => input)
  .handler<Promise<{ comments: Comment[] }>>(async ({ data }) => {
    const db = getDb();

    const conditions = [eq(comments.pocketbookId, data.pocketbookId)];

    if (data.noteId) {
      const commentNoteRows = await db
        .select({ commentId: commentNotes.commentId })
        .from(commentNotes)
        .where(eq(commentNotes.noteId, data.noteId))
        .all();

      const commentIds = commentNoteRows.map((row) => row.commentId);

      if (commentIds.length === 0) {
        return { comments: [] };
      }

      conditions.push(inArray(comments.id, commentIds));
    }

    const rows = await db
      .select()
      .from(comments)
      .where(and(...conditions))
      .all();

    const allCommentNotes =
      rows.length > 0
        ? await db
            .select()
            .from(commentNotes)
            .where(
              inArray(
                commentNotes.commentId,
                rows.map((row) => row.id),
              ),
            )
            .all()
        : [];

    const noteIdsByCommentId = new Map<string, string[]>();
    const allNoteIds = new Set<string>();
    for (const commentNote of allCommentNotes) {
      const existing = noteIdsByCommentId.get(commentNote.commentId) ?? [];
      existing.push(commentNote.noteId);
      noteIdsByCommentId.set(commentNote.commentId, existing);
      allNoteIds.add(commentNote.noteId);
    }

    const noteRows =
      allNoteIds.size > 0
        ? await db
            .select()
            .from(notes)
            .where(inArray(notes.id, Array.from(allNoteIds)))
            .all()
        : [];
    const noteById = new Map(noteRows.map((row) => [row.id, row]));

    return {
      comments: rows.map((row) => {
        const noteIds = noteIdsByCommentId.get(row.id) ?? [];
        const rowNotes: Note[] = noteIds
          .map((noteId) => noteById.get(noteId))
          .filter((note): note is Note => note !== undefined)
          .map((note) => ({ ...note, tasks: [], tags: [], commentCount: 0 }));

        return { ...row, notes: rowNotes };
      }),
    };
  });
