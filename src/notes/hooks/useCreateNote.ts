import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { useCurrentPocketbookId } from "../../pocketbooks/hooks/useCurrentPocketbookId";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Note } from "src/notes/Note.type";

type CreateNoteProps = {
  createNoteData: Omit<
    Note,
    "id" | "created" | "updated" | "deleted" | "tasks" | "commentCount"
  >;
};

type UseCreateNoteResponse = {
  createNote: UseMutateAsyncFunction<
    Note | undefined,
    Error,
    CreateNoteProps,
    unknown
  >;
};

export const useCreateNote = (): UseCreateNoteResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutationFn = async ({
    createNoteData,
  }: CreateNoteProps): Promise<Note | undefined> => {
    const response = await window.api.createNote({
      title: createNoteData.title,
      content: createNoteData.content,
      isBookmarked: createNoteData.isBookmarked,
      tags: createNoteData.tags,
      links: createNoteData.links,
      pocketbookId: pocketbookId ?? null,
      userId: user?.id ?? null,
    });

    if (!response.success) throw new Error(response.error);

    return response.data;
  };

  const onSuccess = (data: Note | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: ["notes.list"] });
    queryClient.refetchQueries({ queryKey: ["tags.get"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["notes.create"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { createNote: mutateAsync };
};
