import { useQuery } from "@tanstack/react-query";
import { mapComment } from "src/comments/utils/mapComment";
import { mapNote } from "src/notes/utils/mapNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import type { Comment } from "src/comments/Comment.type";
import type { Note } from "src/notes/Note.type";

type UseGetCommentsResponse = {
  comments: Comment[];
};

export const useGetComments = ({
  noteId,
}: {
  noteId?: string;
} = {}): UseGetCommentsResponse => {
  const { pocketbookId } = useCurrentPocketbookId();

  const queryFn = async (): Promise<Comment[]> => {
    if (!pocketbookId) return [];

    const [commentsResponse, notesResponse] = await Promise.all([
      window.api.getComments({ pocketbookId }),
      window.api.getNotes({ pocketbookId }),
    ]);

    if (!commentsResponse.success) throw new Error(commentsResponse.error);
    if (!notesResponse.success) throw new Error(notesResponse.error);

    const filteredComments = noteId
      ? commentsResponse.data.comments.filter((comment) =>
          comment.noteIds.includes(noteId),
        )
      : commentsResponse.data.comments;

    const noteMap = new Map(
      notesResponse.data.notes.map((note) => [note.id, mapNote(note)]),
    );

    return filteredComments.map((comment) => {
      const notes = comment.noteIds
        .map((id) => noteMap.get(id))
        .filter(Boolean) as Note[];
      return mapComment(comment, { notes });
    });
  };

  const { data } = useQuery({
    queryKey: ["comments.list", pocketbookId, noteId],
    queryFn,
  });

  return { comments: data ?? [] };
};
