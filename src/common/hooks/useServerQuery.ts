import { useQuery } from "@tanstack/react-query";

export function useServerQuery<TIn, TOut>(
  serverFn: (opts: { data: TIn }) => Promise<TOut>,
  input: TIn,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [serverFn.name, input],
    queryFn: () => serverFn({ data: input }),
    enabled: options?.enabled ?? true,
  });
}
