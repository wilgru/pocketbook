import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type UseDeleteTagResponse = {
  deleteTag: UseMutateAsyncFunction<string | undefined, Error, string, unknown>;
};

export const useDeleteTag = (): UseDeleteTagResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async (tagId: string): Promise<string | undefined> => {
    const response = await bindings.deleteTag({ tagId });
    if (!response.success) throw new Error(response.error);
    return tagId;
  };

  const onSuccess = async (data: string | undefined) => {
    if (!data) {
      return;
    }

    queryClient.removeQueries({
      queryKey: ["tags.get", data],
    });

    await Promise.all([
      queryClient.refetchQueries({
        queryKey: ["tags.list"],
      }),
      queryClient.refetchQueries({
        queryKey: ["tagGroups.list"],
      }),
      queryClient.refetchQueries({
        queryKey: ["notes.list"],
      }),
      queryClient.refetchQueries({
        queryKey: ["notes.get"],
      }),
    ]);
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tags.delete"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { deleteTag: mutateAsync };
};
