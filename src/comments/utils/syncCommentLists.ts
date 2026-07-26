import type { QueryClient } from "@tanstack/react-query";
import type { Comment } from "src/comments/Comment.type";
import type { Note } from "src/notes/Note.type";

type SyncCommentListsOptions = {
  notes: Note[];
};

// TODO: could make this generic somehow?
export const syncCommentLists = (
  queryClient: QueryClient,
  comment: Comment,
  { notes }: SyncCommentListsOptions,
) => {
  const noteIds = new Set(notes.map((note) => note.id));

  queryClient
    .getQueryCache()
    .findAll({ queryKey: ["comments.list"] })
    .forEach((query) => {
      const noteId = (query.queryKey as Array<string | undefined>)[2];
      const shouldInclude = !noteId || noteIds.has(noteId);

      queryClient.setQueryData<Comment[]>(query.queryKey, (current) => {
        if (!current) return current;

        const index = current.findIndex((item) => item.id === comment.id);

        if (!shouldInclude) {
          return index === -1
            ? current
            : current.filter((item) => item.id !== comment.id);
        }

        if (index === -1) {
          return [...current, comment];
        }

        return current.map((item) => (item.id === comment.id ? comment : item));
      });
    });
};
