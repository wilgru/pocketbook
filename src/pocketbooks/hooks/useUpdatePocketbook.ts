import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePocketbookServerFn } from "src/pocketbooks/serverFunctions/updatePocketbook";
import { getPocketbookServerFn } from "../serverFunctions/getPocketbook";
import { getPocketbooksServerFn } from "../serverFunctions/getPocketbooks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

type UpdatePocketbookProps = {
  pocketbookId: string;
  updatePocketbookData: Pick<
    Pocketbook,
    | "title"
    | "icon"
    | "colour"
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
  >;
};

type UseUpdatePocketbookResponse = {
  updatePocketbook: UseMutateAsyncFunction<
    Pocketbook | undefined,
    Error,
    UpdatePocketbookProps,
    unknown
  >;
  isUpdatingPocketbook: boolean;
};

export const useUpdatePocketbook = (): UseUpdatePocketbookResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    pocketbookId,
    updatePocketbookData,
  }: UpdatePocketbookProps): Promise<Pocketbook | undefined> => {
    const pocketbook = await updatePocketbookServerFn({
      data: {
        pocketbookId,
        title: updatePocketbookData.title,
        icon: updatePocketbookData.icon,
        colour: updatePocketbookData.colour,
        notesLayout: updatePocketbookData.notesLayout ?? "list",
        notesSortBy: updatePocketbookData.notesSortBy ?? "created",
        notesSortDirection: updatePocketbookData.notesSortDirection ?? "desc",
        notesGroupBy: updatePocketbookData.notesGroupBy ?? null,
        notesGroupByTagGroupId:
          updatePocketbookData.notesGroupByTagGroupId ?? null,
        bookmarkedLayout: updatePocketbookData.bookmarkedLayout ?? "list",
        bookmarkedSortBy: updatePocketbookData.bookmarkedSortBy ?? "created",
        bookmarkedSortDirection:
          updatePocketbookData.bookmarkedSortDirection ?? "desc",
        bookmarkedGroupBy: updatePocketbookData.bookmarkedGroupBy ?? null,
        bookmarkedGroupByTagGroupId:
          updatePocketbookData.bookmarkedGroupByTagGroupId ?? null,
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
    mutationKey: ["pocketbooks.update"],
    mutationFn,
    onSuccess,
  });

  return { updatePocketbook: mutateAsync, isUpdatingPocketbook: isPending };
};
