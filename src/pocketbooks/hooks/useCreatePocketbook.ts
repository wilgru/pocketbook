import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { mapPocketbook } from "src/pocketbooks/utils/mapPocketbook";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";

type CreatePocketbookProps = {
  createPocketbookData: Omit<Pocketbook, "id" | "created" | "updated">;
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
  const { user } = useUser();

  const mutationFn = async ({
    createPocketbookData,
  }: CreatePocketbookProps): Promise<Pocketbook | undefined> => {
    const response = await bindings.createPocketbook({
      title: createPocketbookData.title,
      icon: createPocketbookData.icon,
      colour: createPocketbookData.colour.name,
      userId: user?.id ?? null,
    });
    if (!response.success) throw new Error(response.error);

    return mapPocketbook(response.data);
  };

  const onSuccess = (data: Pocketbook | undefined) => {
    if (!data) {
      return;
    }

    queryClient.refetchQueries({
      queryKey: ["pocketbooks.list"],
    });

    queryClient.refetchQueries({
      queryKey: ["pocketbooks.get"],
    });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["pocketbooks.create"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { createPocketbook: mutateAsync, isCreatingPocketbook: isPending };
};
