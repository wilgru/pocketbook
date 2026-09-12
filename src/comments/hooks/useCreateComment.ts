import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommentServerFn } from "src/comments/serverFunctions/createComment";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Comment } from "src/comments/comments.schema";

type CreateCommentProps = {
  createCommentData: Omit<
    Comment,
    "id" | "created" | "updated" | "pocketbookId"
  >;
};

type UseCreateCommentResponse = {
  createComment: UseMutateAsyncFunction<
    Comment | undefined,
    Error,
    CreateCommentProps,
    unknown
  >;
};

export const useCreateComment = (): UseCreateCommentResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();

  const mutationFn = async ({
    createCommentData,
  }: CreateCommentProps): Promise<Comment | undefined> => {
    const data = await createCommentServerFn({
      data: {
        content: createCommentData.content,
        colour: createCommentData.colour,
        isWaypoint: createCommentData.isWaypoint,
        noteIds: createCommentData.notes.map((n) => n.id),
        pocketbookId: pocketbookId ?? null,
      },
    });

    return data;
  };

  const onSuccess = (data: Comment | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: [getCommentsServerFn.url] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["comments.create"],
    mutationFn,
    onSuccess,
  });

  return { createComment: mutateAsync };
};
