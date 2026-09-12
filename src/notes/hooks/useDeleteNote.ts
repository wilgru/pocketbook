import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNoteServerFn } from "src/notes/serverFunctions/deleteNote";
import { getTagServerFn } from "src/tags/serverFunctions/getTag";
import { getNotesServerFn } from "../serverFunctions/getNotes";
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

  const mutationFn = async ({
    noteId,
  }: DeleteNoteProps): Promise<string | undefined> => {
    await deleteNoteServerFn({ data: { noteId } });

    // TODO: refetch tags after deleting a note
    // if (noteToDelete.tags.length) await refetchTags();

    return noteId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: [getNotesServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getTagServerFn.url] });
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
