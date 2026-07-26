import { useQuery } from "@tanstack/react-query";
import { mapDateWithNotes } from "src/notes/utils/mapDateWithNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { DateWithNotes } from "src/notes/Note.type";

type UseGetDatesWithCommentsResponse = {
  datesWithComments: DateWithNotes[];
  refetchDatesWithComments: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<DateWithNotes[], Error>>;
};

export const useGetDatesWithComments = (): UseGetDatesWithCommentsResponse => {
  const { pocketbookId: routePocketbookId } = useCurrentPocketbookId();
  const pocketbookId = routePocketbookId;

  const queryFn = async (): Promise<DateWithNotes[]> => {
    if (!pocketbookId) {
      return [];
    }

    const response = await window.api.getComments({ pocketbookId });
    if (!response.success) throw new Error(response.error);

    const uniqueDates = new Map<string, string>();
    for (const comment of response.data.comments) {
      const dateStr = comment.created.split("T")[0];
      if (!uniqueDates.has(dateStr)) {
        uniqueDates.set(dateStr, comment.created);
      }
    }

    const dates = Array.from(uniqueDates.entries()).map(([id, created]) => ({
      id,
      created,
      hasBookmarked: false,
    }));

    return dates.map(mapDateWithNotes);
  };

  const { data, refetch } = useQuery({
    queryKey: ["datesWithComments.list", pocketbookId],
    queryFn,
    enabled: Boolean(pocketbookId),
  });

  return { datesWithComments: data ?? [], refetchDatesWithComments: refetch };
};
