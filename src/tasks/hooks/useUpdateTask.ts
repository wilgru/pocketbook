import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapTask } from "src/tasks/utils/mapTask";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Task } from "src/tasks/Task.type";

type UpdateTaskProps = {
  taskId: string;
  updateTaskData: Task;
  includeSortOrder?: boolean;
};

type UseUpdateTaskResponse = {
  updateTask: UseMutateAsyncFunction<
    Task | undefined,
    Error,
    UpdateTaskProps,
    unknown
  >;
};

export const useUpdateTask = (): UseUpdateTaskResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    taskId,
    updateTaskData,
    includeSortOrder = true,
  }: UpdateTaskProps): Promise<Task | undefined> => {
    const response = await window.api.updateTask({
      taskId,
      title: updateTaskData.title,
      description: updateTaskData.description,
      link: updateTaskData.link,
      links: JSON.stringify(updateTaskData.links),
      isImportant: updateTaskData.isImportant,
      noteId: updateTaskData.note?.id ?? null,
      dueDate: updateTaskData.dueDate?.toISOString() ?? null,
      completedDate: updateTaskData.completedDate?.toISOString() ?? null,
      cancelledDate: updateTaskData.cancelledDate?.toISOString() ?? null,
      sortOrder: includeSortOrder ? updateTaskData.sortOrder : undefined,
    });
    if (!response.success) throw new Error(response.error);

    return mapTask(response.data, { note: updateTaskData.note ?? null });
  };

  const onSuccess = (data: Task | undefined) => {
    if (!data) {
      return;
    }

    queryClient.refetchQueries({
      queryKey: ["tasks.list"],
    });

    queryClient.refetchQueries({
      queryKey: ["tags.get"],
    });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tasks.update"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { updateTask: mutateAsync };
};
