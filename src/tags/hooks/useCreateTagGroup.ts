import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { createTagGroupServerFn } from "src/tags/serverFunctions/createTagGroup";
import { getTagGroupsServerFn } from "../serverFunctions/getTagGroups";
import type { TagGroup } from "../tags.schema";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

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

  const mutationFn = async ({
    createTagGroupData,
  }: CreateTagGroupProps): Promise<TagGroup> => {
    const data = await createTagGroupServerFn({
      data: {
        title: createTagGroupData.title,
        pocketbookId: pocketbookId ?? null,
      },
    });

    return data;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: [getTagGroupsServerFn.url] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tags.create"],
    mutationFn,
    onSuccess,
  });

  return { createTagGroup: mutateAsync };
};
