import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePocketbookServerFn } from "src/pocketbooks/serverFunctions/updatePocketbook";
import { mapPocketbook } from "src/pocketbooks/utils/mapPocketbook";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";

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
    const data = await updatePocketbookServerFn({
      data: {
        pocketbookId,
        title: updatePocketbookData.title,
        icon: updatePocketbookData.icon,
        colour: updatePocketbookData.colour.name,
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

    return mapPocketbook(data);
  };

  const onSuccess = (data: Pocketbook | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: ["pocketbooks.list"] });
    queryClient.refetchQueries({ queryKey: ["pocketbooks.get"] });
  };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["pocketbooks.update"],
    mutationFn,
    onSuccess,
  });

  return { updatePocketbook: mutateAsync, isUpdatingPocketbook: isPending };
};
