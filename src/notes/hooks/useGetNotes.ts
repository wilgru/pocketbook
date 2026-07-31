import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { useMemo } from "react";
import { useGetTags } from "src/tags/hooks/useGetTags";
import { useCurrentPocketbookId } from "../../pocketbooks/hooks/useCurrentPocketbookId";
import type { Note } from "src/notes/Note.type";

type UseGetNotesResponse = {
  notes: Note[];
};

dayjs.extend(utc);

export const useGetNotes = ({
  isBookmarked,
  createdDateString,
}: {
  isBookmarked?: boolean;
  createdDateString?: string;
}): UseGetNotesResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const { tags: allTags } = useGetTags();

  const queryFn = async (): Promise<Note[]> => {
    let createdAfter: string | undefined;
    let createdBefore: string | undefined;

    if (createdDateString) {
      const localCreatedDateMidday = dayjs(createdDateString)
        .hour(12)
        .minute(0)
        .second(0)
        .millisecond(0);

      createdAfter = localCreatedDateMidday
        .utc()
        .subtract(12, "hour")
        .toISOString();

      createdBefore = localCreatedDateMidday
        .utc()
        .add(12, "hour")
        .toISOString();
    }

    const response = await window.api.getNotes({
      pocketbookId: pocketbookId ?? "",
      isBookmarked,
      createdAfter,
      createdBefore,
    });

    if (!response.success) throw new Error(response.error);
    return response.data;
  };

  // TODO: consider time caching for better performance
  const { data } = useQuery({
    queryKey: ["notes.list", pocketbookId, isBookmarked, createdDateString],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  const notes = useMemo(
    () =>
      (data ?? []).map((row) => {
        const tags = allTags.filter((tag) => row.tagIds.includes(tag.id));
        return {
          ...row,
          tags,
        };
      }),
    [allTags, data],
  );

  return {
    notes,
  };
};
