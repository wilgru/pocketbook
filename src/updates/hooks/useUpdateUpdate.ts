import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapUpdate } from "src/updates/utils/mapUpdate";
import { syncUpdateLists } from "src/updates/utils/syncUpdateLists";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Update } from "src/updates/Update.type";

type UpdateUpdateProps = {
  updateId: string;
  updateData: Partial<Omit<Update, "id" | "created" | "updated">>;
};

type UseUpdateUpdateResponse = {
  updateUpdate: UseMutateAsyncFunction<
    Update | undefined,
    Error,
    UpdateUpdateProps,
    unknown
  >;
};

export const useUpdateUpdate = (): UseUpdateUpdateResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    updateId,
    updateData,
  }: UpdateUpdateProps): Promise<Update | undefined> => {
    const response = await window.api.updateUpdate({
      updateId,
      content: updateData.content ?? null,
      tint: updateData.tint ?? null,
      isWaypoint: updateData.isWaypoint ?? false,
      noteIds: updateData.notes?.map((n) => n.id) ?? [],
    });
    if (!response.success) throw new Error(response.error);

    const updatedUpdate = mapUpdate(response.data, {
      notes: updateData.notes ?? [],
    });

    syncUpdateLists(queryClient, updatedUpdate, {
      notes: updateData.notes ?? [],
    });

    return updatedUpdate;
  };

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: ["updates.list"],
    });
  };

  const { mutateAsync } = useMutation({
    mutationKey: ["updates.update"],
    mutationFn,
    onSuccess,
  });

  return { updateUpdate: mutateAsync };
};
