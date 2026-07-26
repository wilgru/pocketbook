import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    const response = await window.api.deleteComment({ commentId });
    if (!response.success) throw new Error(response.error);
    return commentId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({
      queryKey: ["comments.list"],
    });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["comments.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteComment: mutateAsync };
};
