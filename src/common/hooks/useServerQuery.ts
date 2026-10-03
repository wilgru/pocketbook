import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export function useServerQuery<TIn extends object, TOut>(
  serverFn: ((opts: { data: TIn }) => Promise<TOut>) & { url: string },
  input: TIn,
  options?: { enabled?: boolean },
) {
  const serverFunction = useServerFn(serverFn);

  return useQuery({
    queryKey: [serverFn.url, ...Object.values(input)],
    queryFn: () => serverFunction({ data: input }),
    enabled: options?.enabled ?? true,
  });
}
