import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTagGroupServerFn } from "src/tags/serverFunctions/deleteTagGroup";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type UseDeleteTagGroupResponse = {
  deleteTagGroup: UseMutateAsyncFunction<
    string | undefined,
    Error,
    string,
    unknown
  >;
};

export const useDeleteTagGroup = (): UseDeleteTagGroupResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async (tagGroupId: string): Promise<string | undefined> => {
    await deleteTagGroupServerFn({ data: { tagGroupId } });
    return tagGroupId;
  };

  const onSuccess = (data: string | undefined) => {
    if (!data) return;
    queryClient.refetchQueries({ queryKey: ["tagGroups.list"] });
    queryClient.refetchQueries({ queryKey: ["tags.list"] });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["tagGroups.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteTagGroup: mutateAsync };
};
