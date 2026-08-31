import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNoteServerFn } from "src/notes/serverFunctions/deleteNote";
import { useGetTags } from "src/tags/hooks/useGetTags";
import { useGetNotes } from "./useGetNotes";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type DeleteNoteProps = {
  noteId: string;
};

type UseDeleteNoteResponse = {
  deleteNote: UseMutateAsyncFunction<
    string | undefined,
    Error,
    DeleteNoteProps,
    unknown
  >;
};

export const useDeleteNote = (): UseDeleteNoteResponse => {
  const queryClient = useQueryClient();
  const { notes } = useGetNotes({ isBookmarked: undefined });
  const { refetchTags } = useGetTags();

  const mutationFn = async ({
    noteId,
  }: DeleteNoteProps): Promise<string | undefined> => {
    const noteToDelete = notes.find((note) => note.id === noteId);
    if (!noteToDelete) return;

    await deleteNoteServerFn({ data: { noteId } });

    if (noteToDelete.tags.length) await refetchTags();

    return noteId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: ["notes.list"] });
    queryClient.refetchQueries({ queryKey: ["tags.get"] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["notes.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteNote: mutateAsync };
};
