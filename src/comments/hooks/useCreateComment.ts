import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { mapComment } from "src/comments/utils/mapComment";
import { syncCommentLists } from "src/comments/utils/syncCommentLists";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Comment } from "src/comments/Comment.type";

type CreateCommentProps = {
  createCommentData: Omit<Comment, "id" | "created" | "updated">;
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
  const { user } = useUser();

  const mutationFn = async ({
    createCommentData,
  }: CreateCommentProps): Promise<Comment | undefined> => {
    const response = await bindings.createComment({
      content: createCommentData.content ?? null,
      tint: createCommentData.tint,
      isWaypoint: createCommentData.isWaypoint ?? false,
      noteIds: createCommentData.notes.map((n) => n.id),
      pocketbookId: pocketbookId ?? null,
      userId: user?.id ?? null,
    });
    if (!response.success) throw new Error(response.error);

    const createdComment = mapComment(response.data, {
      notes: createCommentData.notes,
    });

    syncCommentLists(queryClient, createdComment, {
      notes: createCommentData.notes,
    });

    return createdComment;
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: ["comments.list"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["pocketbookContentCounts"],
    });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["comments.create"],
    mutationFn,
    onSuccess,
  });

  return { createComment: mutateAsync };
};
