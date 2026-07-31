import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapNote } from "src/notes/utils/mapNote";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Note } from "src/notes/Note.type";

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
    const tagIds = updateNoteData.tags.map((tag) => tag.id);
    const response = await window.api.updateNote({
      noteId,
      title: updateNoteData.title,
      content: updateNoteData.content,
      isBookmarked: updateNoteData.isBookmarked,
      tagIds,
      links: JSON.stringify(updateNoteData.links),
    });

    if (!response.success) throw new Error(response.error);

    return mapNote(response.data, {
      tags: updateNoteData.tags,
      tasks: updateNoteData.tasks,
    });
  };

  const onSuccess = (data: Note | undefined) => {
    if (!data) {
      return;
    }

    queryClient.refetchQueries({
      queryKey: ["notes.list"],
    });

    queryClient.refetchQueries({
      queryKey: ["notes.get", data.id],
    });

    queryClient.refetchQueries({
      queryKey: ["tags.get"],
    });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["notes.update"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { updateNote: mutateAsync };
};
