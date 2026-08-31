import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTagGroupServerFn } from "src/tags/serverFunctions/updateTagGroup";
import { mapTagGroup } from "src/tags/utils/mapTagGroup";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { TagGroup } from "src/tags/Tag.type";

type UpdateTagGroupProps = {
  tagGroupId: string;
  updateTagGroupData: Pick<TagGroup, "title">;
};

type UseUpdateTagGroupResponse = {
  updateTagGroup: UseMutateAsyncFunction<
    TagGroup | undefined,
    Error,
    UpdateTagGroupProps,
    unknown
  >;
};

export const useUpdateTagGroup = (): UseUpdateTagGroupResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    tagGroupId,
    updateTagGroupData,
  }: UpdateTagGroupProps): Promise<TagGroup | undefined> => {
    const data = await updateTagGroupServerFn({
      data: { tagGroupId, title: updateTagGroupData.title },
    });

    return mapTagGroup(data);
  };

  const onSuccess = (data: TagGroup | undefined) => {
    if (!data) return;
    queryClient.refetchQueries({ queryKey: ["tagGroups.list"] });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["tagGroups.update"],
    mutationFn,
    onSuccess,
  });

  return { updateTagGroup: mutateAsync };
};
