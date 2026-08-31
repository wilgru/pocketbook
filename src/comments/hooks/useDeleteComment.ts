import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCommentServerFn } from "src/comments/serverFunctions/deleteComment";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type DeleteCommentProps = {
  commentId: string;
};

type UseDeleteCommentResponse = {
  deleteComment: UseMutateAsyncFunction<
    string | undefined,
    Error,
    DeleteCommentProps,
    unknown
  >;
};

export const useDeleteComment = (): UseDeleteCommentResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    commentId,
  }: DeleteCommentProps): Promise<string | undefined> => {
    await deleteCommentServerFn({ data: { commentId } });
    return commentId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: ["comments.list"] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["comments.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteComment: mutateAsync };
};
