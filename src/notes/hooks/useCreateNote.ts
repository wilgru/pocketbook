import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoteServerFn } from "src/notes/serverFunctions/createNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Note } from "src/notes/notes.schema";

type CreateNoteProps = {
  createNoteData: Omit<
    Note,
    | "id"
    | "created"
    | "updated"
    | "deleted"
    | "tasks"
    | "commentCount"
    | "pocketbookId"
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

  if (!pocketbookId) {
    throw Error("Need a pocketbook id!"); //TODO make pocketbook not null, grab from params somehow?
  }

  const mutationFn = async ({
    createNoteData,
  }: CreateNoteProps): Promise<Note | undefined> => {
    const note = await createNoteServerFn({
      data: {
        title: createNoteData.title,
        content: createNoteData.content,
        isBookmarked: createNoteData.isBookmarked,
        tagIds: createNoteData.tags.map((tag) => tag.id),
        links: createNoteData.links,
        pocketbookId: pocketbookId,
      },
    });

    return { ...note, tags: createNoteData.tags };
  };

  const onSuccess = (data: Note | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: ["notes.list"] });
    queryClient.refetchQueries({ queryKey: ["tags.get"] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["notes.create"],
    mutationFn,
    onSuccess,
  });

  return { createNote: mutateAsync };
};
