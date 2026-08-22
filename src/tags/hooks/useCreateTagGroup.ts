import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { mapTagGroup } from "src/tags/utils/mapTagGroup";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { TagGroup } from "src/tags/Tag.type";

type CreateTagGroupProps = {
  createTagGroupData: Omit<
    TagGroup,
    | "id"
    | "tags"
    | "pocketbookId"
    | "groupBy"
    | "user"
    | "noteCount"
    | "created"
    | "updated"
  >;
};

type UseCreateTagGroupResponse = {
  createTagGroup: UseMutateAsyncFunction<
    TagGroup,
    Error,
    CreateTagGroupProps,
    unknown
  >;
};

export const useCreateTagGroup = (): UseCreateTagGroupResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutationFn = async ({
    createTagGroupData,
  }: CreateTagGroupProps): Promise<TagGroup> => {
    const response = await bindings.createTagGroup({
      title: createTagGroupData.title,
      pocketbookId: pocketbookId ?? null,
      userId: user?.id ?? null,
    });
    if (!response.success) throw new Error(response.error);

    return mapTagGroup(response.data);
  };

  const onSuccess = () => {
    queryClient.refetchQueries({
      queryKey: ["tagGroups.list"],
    });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tags.create"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { createTagGroup: mutateAsync };
};
