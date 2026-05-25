import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { mapUpdate } from "src/updates/utils/mapUpdate";
import { syncUpdateLists } from "src/updates/utils/syncUpdateLists";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Update } from "src/updates/Update.type";

type CreateUpdateProps = {
  createUpdateData: Omit<Update, "id" | "created" | "updated">;
};

type UseCreateUpdateResponse = {
  createUpdate: UseMutateAsyncFunction<
    Update | undefined,
    Error,
    CreateUpdateProps,
    unknown
  >;
};

export const useCreateUpdate = (): UseCreateUpdateResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutationFn = async ({
    createUpdateData,
  }: CreateUpdateProps): Promise<Update | undefined> => {
    const response = await window.api.createUpdate({
      content: createUpdateData.content ?? null,
      tint: createUpdateData.tint,
      isWaypoint: createUpdateData.isWaypoint ?? false,
      noteIds: createUpdateData.notes.map((n) => n.id),
      pocketbookId: pocketbookId ?? null,
      userId: user?.id ?? null,
    });
    if (!response.success) throw new Error(response.error);

    const createdUpdate = mapUpdate(response.data, {
      notes: createUpdateData.notes,
    });

    syncUpdateLists(queryClient, createdUpdate, {
      notes: createUpdateData.notes,
    });

    return createdUpdate;
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: ["updates.list"],
    });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["updates.create"],
    mutationFn,
    onSuccess,
  });

  return { createUpdate: mutateAsync };
};
