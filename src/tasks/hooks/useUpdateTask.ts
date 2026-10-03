import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { getTagServerFn } from "src/tags/serverFunctions/getTag";
import { updateTaskServerFn } from "src/tasks/serverFunctions/updateTask";
import { getTasksServerFn } from "../serverFunctions/getTasks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Task } from "src/tasks/tasks.schema";

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
    const data = await updateTaskServerFn({
      data: {
        taskId,
        title: updateTaskData.title,
        description: updateTaskData.description,
        link: updateTaskData.link,
        links: updateTaskData.links,
        isImportant: updateTaskData.isImportant,
        noteId: updateTaskData.noteId ?? null,
        dueDate: updateTaskData.dueDate ?? null,
        completedDate: updateTaskData.completedDate ?? null,
        cancelledDate: updateTaskData.cancelledDate ?? null,
        blockedComment: updateTaskData.blockedComment,
        blockedDate: updateTaskData.blockedDate ?? null,
        sortOrder: includeSortOrder ? updateTaskData.sortOrder : undefined,
      },
    });

    return data;
  };

  const onSuccess = (data: Task | undefined) => {
    if (!data) return;

    queryClient.refetchQueries({ queryKey: [getTasksServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getNotesServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getNoteServerFn.url] });
    queryClient.refetchQueries({ queryKey: [getTagServerFn.url] });
    queryClient.invalidateQueries({ queryKey: ["pocketbookContentCounts"] });
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tasks.update"],
    mutationFn,
    onSuccess,
  });

  return { updateTask: mutateAsync };
};
