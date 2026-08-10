import { useQuery } from "@tanstack/react-query";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";

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

const getDateKey = (dateString: string | null | undefined): string | null => {
  if (!dateString) {
    return null;
  }

  const dateKey = dateString.split("T")[0];
  return dateKey || null;
};

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

      const [
        notesResponse,
        bookmarkedResponse,
        tasksResponse,
        commentsResponse,
      ] = await Promise.all([
        window.api.getNotes({ pocketbookId }),
        window.api.getNotes({ pocketbookId, isBookmarked: true }),
        window.api.getTasks({ pocketbookId }),
        window.api.getComments({ pocketbookId }),
      ]);

      if (!notesResponse.success) throw new Error(notesResponse.error);
      if (!bookmarkedResponse.success)
        throw new Error(bookmarkedResponse.error);
      if (!tasksResponse.success) throw new Error(tasksResponse.error);
      if (!commentsResponse.success) throw new Error(commentsResponse.error);

      const updateDateKeys = new Set<string>();

      for (const note of notesResponse.data.notes) {
        const dateKey = getDateKey(note.created);
        if (dateKey) {
          updateDateKeys.add(dateKey);
        }
      }

      for (const task of tasksResponse.data.tasks) {
        for (const taskDate of [task.completedDate, task.cancelledDate]) {
          const dateKey = getDateKey(taskDate);
          if (dateKey) {
            updateDateKeys.add(dateKey);
          }
        }
      }

      for (const comment of commentsResponse.data.comments) {
        const dateKey = getDateKey(comment.created);
        if (dateKey) {
          updateDateKeys.add(dateKey);
        }
      }

      return {
        noteCount: notesResponse.data.notes.length,
        bookmarkedCount: bookmarkedResponse.data.notes.length,
        taskCount: tasksResponse.data.tasks.filter(
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

    return {
      counts: data,
      isFetching,
    };
  };
