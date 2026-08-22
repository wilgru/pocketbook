import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    const response = await bindings.updateTagGroup({
      tagGroupId,
      title: updateTagGroupData.title,
    });
    if (!response.success) throw new Error(response.error);

    return mapTagGroup(response.data);
  };

  const onSuccess = (data: TagGroup | undefined) => {
    if (!data) {
      return;
    }

    queryClient.refetchQueries({
      queryKey: ["tagGroups.list"],
    });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["tagGroups.update"],
    mutationFn,
    onSuccess,
  });

  return { updateTagGroup: mutateAsync };
};
