import { useQuery } from "@tanstack/react-query";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";

type PocketbookContentCounts = {
  noteCount: number;
  bookmarkedCount: number;
  taskCount: number;
  commentCount: number;
};

type UseGetPocketbookContentCountsResponse = {
  counts: PocketbookContentCounts | undefined;
  isFetching: boolean;
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
          commentCount: 0,
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

      return {
        noteCount: notesResponse.data.notes.length,
        bookmarkedCount: bookmarkedResponse.data.notes.length,
        taskCount: tasksResponse.data.tasks.length,
        commentCount: commentsResponse.data.comments.length,
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
