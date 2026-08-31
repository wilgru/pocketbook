import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "src/Users/hooks/useUser";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { createTaskServerFn } from "src/tasks/serverFunctions/createTask";
import { mapTask } from "src/tasks/utils/mapTask";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Task } from "src/tasks/Task.type";

type CreateTaskProps = {
  createTaskData: Omit<Task, "id" | "created" | "updated" | "sortOrder">;
  insertAfterSortOrder?: number;
};

type UseCreateTaskResponse = {
  createTask: UseMutateAsyncFunction<
    Task | undefined,
    Error,
    CreateTaskProps,
    unknown
  >;
};

export const useCreateTask = (): UseCreateTaskResponse => {
  const { pocketbookId } = useCurrentPocketbookId();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const mutationFn = async ({
    createTaskData,
    insertAfterSortOrder,
  }: CreateTaskProps): Promise<Task | undefined> => {
    const data = await createTaskServerFn({
      data: {
        title: createTaskData.title,
        description: createTaskData.description,
        link: createTaskData.link,
        links: JSON.stringify(createTaskData.links),
        isImportant: createTaskData.isImportant,
        noteId: createTaskData.note?.id ?? null,
        dueDate: createTaskData.dueDate?.toISOString() ?? null,
        pocketbookId: pocketbookId ?? null,
        userId: user?.id ?? null,
        insertAfterSortOrder: insertAfterSortOrder ?? null,
      },
    });

    return mapTask(data, { note: createTaskData.note ?? null });
  };

  const onSuccess = (data: Task | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: ["tasks.list"] });
    queryClient.refetchQueries({ queryKey: ["notes.get", data.note?.id] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tasks.create"],
    mutationFn,
    onSuccess,
  });

  return { createTask: mutateAsync };
};
