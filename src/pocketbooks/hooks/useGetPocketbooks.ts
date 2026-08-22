import { useQuery } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { mapPocketbook } from "src/pocketbooks/utils/mapPocketbook";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";

type UseGetPocketbooksResponse = {
  pocketbooks: Pocketbook[];
  isFetching: boolean;
};

export const useGetPocketbooks = (): UseGetPocketbooksResponse => {
  const { user } = useUser();

  const queryFn = async (): Promise<{
    pocketbooks: Pocketbook[];
  }> => {
    const response = await bindings.getPocketbooks({
      userId: user?.id ?? null,
    });
    if (!response.success) throw new Error(response.error);

    const pocketbooks = response.data.pocketbooks.map((pocketbook) =>
      mapPocketbook(pocketbook),
    );

    return { pocketbooks };
  };

  // TODO: consider time caching for better performance
  const { data, isPending } = useQuery({
    queryKey: ["pocketbooks.list"],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return {
    pocketbooks: data?.pocketbooks ?? [],
    // Only treat the very first load as blocking; background refetches should not blank UI.
    isFetching: isPending,
  };
};
