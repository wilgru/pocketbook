import { useQuery } from "@tanstack/react-query";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { getTasksServerFn } from "src/tasks/serverFunctions/getTasks";
import type { Dayjs } from "dayjs";

type PocketbookContentCounts = {
  noteCount: number;
  bookmarkedCount: number;
  taskCount: number;
  updateDayCount: number;
};

type UseGetPocketbookContentCountsResponse = {
  counts: PocketbookContentCounts | undefined;
  isFetching: boolean;
};

const getDateKey = (date: Dayjs | null | undefined): string | null => {
  if (!date) return null;
  return date.format("DD-MM-YYY") || null;
};

// TODO: convert to a server function
export const useGetPocketbookContentCounts =
  (): UseGetPocketbookContentCountsResponse => {
    const { pocketbookId } = useCurrentPocketbookId();

    const queryFn = async (): Promise<PocketbookContentCounts> => {
      if (!pocketbookId) {
        return {
          noteCount: 0,
          bookmarkedCount: 0,
          taskCount: 0,
          updateDayCount: 0,
        };
      }

      const [notesData, bookmarkedData, tasksData, commentsData] =
        await Promise.all([
          getNotesServerFn({ data: { pocketbookId } }),
          getNotesServerFn({ data: { pocketbookId, isBookmarked: true } }),
          getTasksServerFn({ data: { pocketbookId } }),
          getCommentsServerFn({ data: { pocketbookId } }),
        ]);

      const updateDateKeys = new Set<string>();

      for (const note of notesData.notes) {
        const dateKey = getDateKey(note.created);
        if (dateKey) updateDateKeys.add(dateKey);
      }

      for (const task of tasksData.tasks) {
        for (const taskDate of [task.completedDate, task.cancelledDate]) {
          const dateKey = getDateKey(taskDate);
          if (dateKey) updateDateKeys.add(dateKey);
        }
      }

      for (const comment of commentsData.comments) {
        const dateKey = getDateKey(comment.created);
        if (dateKey) updateDateKeys.add(dateKey);
      }

      return {
        noteCount: notesData.notes.length,
        bookmarkedCount: bookmarkedData.notes.length,
        taskCount: tasksData.tasks.filter(
          (task) => !task.completedDate && !task.cancelledDate,
        ).length,
        updateDayCount: updateDateKeys.size,
      };
    };

    const { data, isFetching } = useQuery({
      queryKey: ["pocketbookContentCounts", pocketbookId],
      queryFn,
      enabled: !!pocketbookId,
    });

    return { counts: data, isFetching };
  };
