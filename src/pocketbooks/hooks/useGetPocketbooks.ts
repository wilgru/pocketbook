import { useQuery } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { getPocketbooksServerFn } from "src/pocketbooks/serverFunctions/getPocketbooks";
import { mapPocketbook } from "src/pocketbooks/utils/mapPocketbook";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";

type UseGetPocketbooksResponse = {
  pocketbooks: Pocketbook[];
  isFetching: boolean;
};

export const useGetPocketbooks = (): UseGetPocketbooksResponse => {
  const { user } = useUser();

  const queryFn = async (): Promise<{ pocketbooks: Pocketbook[] }> => {
    const data = await getPocketbooksServerFn({
      data: { userId: user?.id ?? null },
    });

    return { pocketbooks: data.pocketbooks.map(mapPocketbook) };
  };

  // TODO: consider time caching for better performance
  const { data, isLoading } = useQuery({
    queryKey: ["pocketbooks.list"],
    queryFn,
    retry: 1,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return {
    pocketbooks: data?.pocketbooks ?? [],
    isFetching: isLoading,
  };
};
