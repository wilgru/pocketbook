import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { createNoteServerFn } from "src/notes/serverFunctions/createNote";
import { mapNote } from "src/notes/utils/mapNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
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
    const data = await createNoteServerFn({
      data: {
        title: createNoteData.title,
        content: createNoteData.content,
        isBookmarked: createNoteData.isBookmarked,
        tagIds: createNoteData.tags.map((tag) => tag.id),
        links: JSON.stringify(createNoteData.links),
        pocketbookId: pocketbookId ?? null,
        userId: user?.id ?? null,
      },
    });

    return mapNote(data, { tags: createNoteData.tags });
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
