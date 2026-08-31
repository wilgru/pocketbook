import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCommentServerFn } from "src/comments/serverFunctions/updateComment";
import { mapComment } from "src/comments/utils/mapComment";
import { syncCommentLists } from "src/comments/utils/syncCommentLists";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Comment } from "src/comments/Comment.type";

type UpdateCommentProps = {
  commentId: string;
  commentData: Partial<Omit<Comment, "id" | "created" | "updated">>;
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
        tint: commentData.tint ?? null,
        isWaypoint: commentData.isWaypoint ?? false,
        noteIds: commentData.notes?.map((n) => n.id) ?? [],
      },
    });

    const updatedComment = mapComment(data, { notes: commentData.notes ?? [] });

    syncCommentLists(queryClient, updatedComment, {
      notes: commentData.notes ?? [],
    });

    return updatedComment;
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: ["comments.list"] });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["comments.update"],
    mutationFn,
    onSuccess,
  });

  return { updateComment: mutateAsync };
};
