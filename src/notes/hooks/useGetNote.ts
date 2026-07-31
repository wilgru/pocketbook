import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGetTags } from "src/tags/hooks/useGetTags";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { Note } from "src/notes/Note.type";

type UseGetNoteResponse = {
  note: Note | undefined;
  refetchNote: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<Note, Error>>;
};

export const useGetNote = ({
  noteId,
}: {
  noteId: string | null;
}): UseGetNoteResponse => {
  const { tags: allTags } = useGetTags();
  const { tasks: allTasks } = useGetTasks({});

  const queryFn = async (): Promise<Note> => {
    const response = await window.api.getNote({ noteId: noteId ?? "" });
    if (!response.success) throw new Error(response.error);

    return response.data;
  };

  const { data, refetch } = useQuery({
    queryKey: ["notes.get", noteId],
    queryFn,
    enabled: !!noteId,
  });

  const note = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const tags = allTags.filter((tag) => data.tagIds.includes(tag.id));
    const tasks = allTasks.filter((task) => task.note?.id === data.id);

    return {
      ...data,
      tags,
      tasks,
    };
  }, [allTags, allTasks, data]);

  return {
    note,
    refetchNote: refetch,
  };
};
