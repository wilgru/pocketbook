import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPocketbookServerFn } from "src/pocketbooks/serverFunctions/createPocketbook";
import { getPocketbookServerFn } from "../serverFunctions/getPocketbook";
import { getPocketbooksServerFn } from "../serverFunctions/getPocketbooks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

type CreatePocketbookProps = {
  createPocketbookData: Omit<
    Pocketbook,
    | "id"
    | "created"
    | "updated"
    | "notesLayout"
    | "notesSortBy"
    | "notesSortDirection"
    | "notesGroupBy"
    | "notesGroupByTagGroupId"
    | "bookmarkedLayout"
    | "bookmarkedSortBy"
    | "bookmarkedSortDirection"
    | "bookmarkedGroupBy"
    | "bookmarkedGroupByTagGroupId"
    | "taskCount"
    | "noteCount"
  >;
};

type UseCreatePocketbookResponse = {
  createPocketbook: UseMutateAsyncFunction<
    Pocketbook | undefined,
    Error,
    CreatePocketbookProps,
    unknown
  >;
  isCreatingPocketbook: boolean;
};

export const useCreatePocketbook = (): UseCreatePocketbookResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    createPocketbookData,
  }: CreatePocketbookProps): Promise<Pocketbook | undefined> => {
    const pocketbook = await createPocketbookServerFn({
      data: {
        title: createPocketbookData.title,
        icon: createPocketbookData.icon,
        colour: createPocketbookData.colour,
      },
    });

    return pocketbook;
  };

  const onSuccess = (data: Pocketbook | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: [getPocketbooksServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getPocketbookServerFn.url] });
  };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["pocketbooks.create"],
    mutationFn,
    onSuccess,
  });

  return { createPocketbook: mutateAsync, isCreatingPocketbook: isPending };
};
