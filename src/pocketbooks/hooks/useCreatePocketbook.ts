import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { createPocketbookServerFn } from "src/pocketbooks/serverFunctions/createPocketbook";
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
    const data = await createPocketbookServerFn({
      data: {
        title: createPocketbookData.title,
        icon: createPocketbookData.icon,
        colour: createPocketbookData.colour.name,
        userId: user?.id ?? null,
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
    mutationKey: ["pocketbooks.create"],
    mutationFn,
    onSuccess,
  });

  return { createPocketbook: mutateAsync, isCreatingPocketbook: isPending };
};
