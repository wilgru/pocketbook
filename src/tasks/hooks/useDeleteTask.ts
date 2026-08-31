import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaskServerFn } from "src/tasks/serverFunctions/deleteTask";
import { useGetTasks } from "./useGetTasks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type DeleteTaskProps = {
  taskId: string;
};

type UseDeleteTaskResponse = {
  deleteTask: UseMutateAsyncFunction<
    string | undefined,
    Error,
    DeleteTaskProps,
    unknown
  >;
};

export const useDeleteTask = (): UseDeleteTaskResponse => {
  const queryClient = useQueryClient();
  const { tasks } = useGetTasks({});

  const mutationFn = async ({
    taskId,
  }: DeleteTaskProps): Promise<string | undefined> => {
    const taskToDelete = tasks.find((task) => task.id === taskId);
    if (!taskToDelete) return;

    await deleteTaskServerFn({ data: { taskId } });

    return taskId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: ["tasks.list"] });
    queryClient.refetchQueries({ queryKey: ["tags.get"] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tasks.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteTask: mutateAsync };
};
