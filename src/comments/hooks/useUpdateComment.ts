import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { updateCommentServerFn } from "src/comments/serverFunctions/updateComment";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Comment } from "src/comments/comments.schema";

type UpdateCommentProps = {
  commentId: string;
  commentData: Partial<
    Omit<Comment, "id" | "created" | "updated" | "pocketbookId">
  >;
};

type UseUpdateCommentResponse = {
  updateComment: UseMutateAsyncFunction<
    Comment | undefined,
    Error,
    UpdateCommentProps,
    unknown
  >;
};

export const useUpdateComment = (): UseUpdateCommentResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    commentId,
    commentData,
  }: UpdateCommentProps): Promise<Comment | undefined> => {
    const data = await updateCommentServerFn({
      data: {
        commentId,
        content: commentData.content ?? null,
        colour: commentData.colour ?? null,
        isWaypoint: commentData.isWaypoint ?? false,
        noteIds: commentData.notes?.map((n) => n.id) ?? [],
      },
    });

    return data;
  };

  const onSuccess = (data: Comment | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: [getCommentsServerFn.url] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["comments.update"],
    mutationFn,
    onSuccess,
  });

  return { updateComment: mutateAsync };
};
