import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTagGroupServerFn } from "src/tags/serverFunctions/deleteTagGroup";
import { getTagGroupsServerFn } from "../serverFunctions/getTagGroups";
import { getTagsServerFn } from "../serverFunctions/getTags";
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

  const mutationFn = async (
    tagGroupId: string,
  ): Promise<string | undefined> => {
    await deleteTagGroupServerFn({ data: { tagGroupId } });
    return tagGroupId;
  };

  const onSuccess = (data: string | undefined) => {
    if (!data) return;
    queryClient.refetchQueries({ queryKey: [getTagGroupsServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getTagsServerFn.url] });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["tagGroups.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteTagGroup: mutateAsync };
};
