import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetTasks } from "./useGetTasks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type deleteTaskProps = {
  taskId: string;
};

type UseDeleteTaskResponse = {
  deleteTask: UseMutateAsyncFunction<
    string | undefined,
    Error,
    deleteTaskProps,
    unknown
  >;
};

export const useDeleteTask = (): UseDeleteTaskResponse => {
  const queryClient = useQueryClient();
  const { tasks } = useGetTasks({});

  const mutationFn = async ({
    taskId,
  }: deleteTaskProps): Promise<string | undefined> => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (!taskToDelete) {
      return;
    }

    const response = await window.api.deleteTask({ taskId });
    if (!response.success) throw new Error(response.error);

    return taskId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({
      queryKey: ["tasks.list"],
    });

    queryClient.refetchQueries({
      queryKey: ["tags.get"],
    });

    queryClient.invalidateQueries({
      queryKey: ["pocketbookContentCounts"],
    });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tasks.delete"],
    mutationFn,
    onSuccess,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { deleteTask: mutateAsync };
};
