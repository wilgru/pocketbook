import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNoteServerFn } from "src/notes/serverFunctions/updateNote";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Note } from "src/notes/notes.schema";

type UpdateNoteProps = {
  noteId: string;
  updateNoteData: Note;
};

type UseUpdateNoteResponse = {
  updateNote: UseMutateAsyncFunction<
    Note | undefined,
    Error,
    UpdateNoteProps,
    unknown
  >;
};

export const useUpdateNote = (): UseUpdateNoteResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    noteId,
    updateNoteData,
  }: UpdateNoteProps): Promise<Note | undefined> => {
    const data = await updateNoteServerFn({
      data: {
        noteId,
        title: updateNoteData.title,
        content: updateNoteData.content,
        isBookmarked: updateNoteData.isBookmarked,
        tagIds: updateNoteData.tags.map((tag) => tag.id),
        links: updateNoteData.links,
      },
    });

    return data;
  };

  const onSuccess = (data: Note | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: ["notes.list"] });
    queryClient.refetchQueries({ queryKey: ["notes.get", data.id] });
    queryClient.refetchQueries({ queryKey: ["tags.get"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["notes.update"],
    mutationFn,
    onSuccess,
  });

  return { updateNote: mutateAsync };
};
