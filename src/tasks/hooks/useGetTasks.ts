import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { mapNote } from "src/notes/utils/mapNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { mapTask } from "src/tasks/utils/mapTask";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { Task } from "src/tasks/Task.type";

type UseGetTacksResponse = {
  tasks: Task[];
  refetchTags: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<Task[], Error>>;
};

dayjs.extend(utc);

export const useGetTasks = ({
  isImportant,
  dateString,
}: {
  isImportant?: boolean;
  dateString?: string;
}): UseGetTacksResponse => {
  const { pocketbookId } = useCurrentPocketbookId();

  const queryFn = async (): Promise<Task[]> => {
    if (!pocketbookId) {
      return [];
    }

    let createdAfter: dayjs.Dayjs | undefined;
    let createdBefore: dayjs.Dayjs | undefined;

    if (dateString) {
      const localDateMidday = dayjs(dateString)
        .hour(12)
        .minute(0)
        .second(0)
        .millisecond(0);

      createdAfter = localDateMidday.utc().subtract(12, "hour");
      createdBefore = localDateMidday.utc().add(12, "hour");
    }

    const [tasksResponse, notesResponse] = await Promise.all([
      bindings.getTasks({ pocketbookId }),
      bindings.getNotes({ pocketbookId }),
    ]);

    if (!tasksResponse.success) throw new Error(tasksResponse.error);
    if (!notesResponse.success) throw new Error(notesResponse.error);

    const notesById = new Map(
      notesResponse.data.notes.map((row) => [row.id, mapNote(row)]),
    );

    let filteredTasks = tasksResponse.data.tasks;

    if (isImportant !== undefined) {
      filteredTasks = filteredTasks.filter(
        (task) => task.isImportant === isImportant,
      );
    }

    if (createdAfter && createdBefore) {
      filteredTasks = filteredTasks.filter((task) => {
        const created = dayjs.utc(task.created);
        return created.isAfter(createdAfter) && created.isBefore(createdBefore);
      });
    }

    return filteredTasks.map((task) => {
      const note = task.note ? (notesById.get(task.note) ?? null) : null;
      return mapTask(task, { note });
    });
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tasks.list", pocketbookId, isImportant, dateString],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { tasks: data ?? [], refetchTags: refetch };
};
