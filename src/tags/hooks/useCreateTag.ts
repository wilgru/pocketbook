import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { createTagServerFn } from "src/tags/serverFunctions/createTag";
import { updateTagServerFn } from "src/tags/serverFunctions/updateTag";
import { mapTag } from "src/tags/utils/mapTag";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Tag } from "src/tags/Tag.type";

type CreateTagProps = {
  createTagData: Omit<
    Tag,
    | "id"
    | "pocketbookId"
    | "groupBy"
    | "user"
    | "noteCount"
    | "created"
    | "updated"
  >;
};

type UseCreateTagResponse = {
  createTag: UseMutateAsyncFunction<Tag, Error, CreateTagProps, unknown>;
};

export const useCreateTag = (): UseCreateTagResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutationFn = async ({ createTagData }: CreateTagProps): Promise<Tag> => {
    const created = await createTagServerFn({
      data: {
        name: createTagData.name,
        colour: createTagData.colour.name,
        icon: createTagData.icon,
        description: createTagData.description,
        tagGroupId: createTagData.tagGroupId ?? null,
        pocketbookId: pocketbookId ?? null,
        userId: user?.id ?? null,
      },
    });

    const updated = await updateTagServerFn({
      data: {
        tagId: created.id,
        name: createTagData.name,
        colour: createTagData.colour.name,
        icon: createTagData.icon,
        description: createTagData.description,
        layout: createTagData.layout ?? "list",
        groupBy: null,
        groupByTagGroupId: createTagData.groupByTagGroupId ?? null,
        sortBy: createTagData.sortBy ?? "created",
        sortDirection: createTagData.sortDirection ?? "desc",
        links: JSON.stringify(createTagData.links),
        tagGroupId: createTagData.tagGroupId ?? null,
      },
    });

    return mapTag(updated, { noteCount: 0 });
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: ["tags.list"] });
    queryClient.refetchQueries({ queryKey: ["tagGroups.list"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tags.create"],
    mutationFn,
    onSuccess,
  });

  return { createTag: mutateAsync };
};
