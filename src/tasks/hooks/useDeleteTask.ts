import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getTagServerFn } from "src/tags/serverFunctions/getTag";
import { deleteTaskServerFn } from "src/tasks/serverFunctions/deleteTask";
import { getTasksServerFn } from "../serverFunctions/getTasks";
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

  const mutationFn = async ({
    taskId,
  }: DeleteTaskProps): Promise<string | undefined> => {
    await deleteTaskServerFn({ data: { taskId } });

    return taskId;
  };

  const onSuccess = () => {
    queryClient.refetchQueries({ queryKey: [getTasksServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getTagServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getNoteServerFn.url] });
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
