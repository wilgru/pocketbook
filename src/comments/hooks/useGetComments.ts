import { useQuery } from "@tanstack/react-query";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { mapComment } from "src/comments/utils/mapComment";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
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

    const [commentsData, notesData] = await Promise.all([
      getCommentsServerFn({ data: { pocketbookId } }),
      getNotesServerFn({ data: { pocketbookId } }),
    ]);

    const filteredComments = noteId
      ? commentsData.comments.filter((comment) =>
          comment.noteIds.includes(noteId),
        )
      : commentsData.comments;

    const noteMap = new Map(
      notesData.notes.map((note) => [note.id, mapNote(note)]),
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
