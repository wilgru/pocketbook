import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { useMemo } from "react";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { mapNote } from "src/notes/utils/mapNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { useGetTags } from "src/tags/hooks/useGetTags";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";
import type { Note } from "src/notes/Note.type";
import type { GetNotesInput } from "src/notes/serverFunctions/getNotes";

type GetNotesResult = Awaited<ReturnType<typeof getNotesServerFn>>;

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
  const { tasks: allTasks } = useGetTasks({});

  const queryFn = async (): Promise<GetNotesResult> => {
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

    const input: GetNotesInput = {
      pocketbookId: pocketbookId ?? "",
      isBookmarked,
      createdAfter,
      createdBefore,
    };

    return getNotesServerFn({ data: input });
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
      (data?.notes ?? []).map((row) => {
        const tags = allTags.filter((tag) => row.tagIds.includes(tag.id));
        const tasks = allTasks.filter((task) => task.note?.id === row.id);
        return mapNote(row, { tags, tasks });
      }),
    [allTags, allTasks, data],
  );

  return { notes };
};
