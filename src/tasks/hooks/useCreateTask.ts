import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { createTaskServerFn } from "src/tasks/serverFunctions/createTask";
import { getTasksServerFn } from "../serverFunctions/getTasks";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import type { Task } from "src/tasks/tasks.schema";

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

  const mutationFn = async ({
    createTaskData,
    insertAfterSortOrder,
  }: CreateTaskProps): Promise<Task | undefined> => {
    const data = await createTaskServerFn({
      data: {
        title: createTaskData.title,
        description: createTaskData.description,
        link: "",
        links: createTaskData.links,
        isImportant: createTaskData.isImportant,
        noteId: createTaskData.noteId ?? null,
        dueDate: createTaskData.dueDate ?? null,
        pocketbookId: pocketbookId,
        insertAfterSortOrder: insertAfterSortOrder ?? null,
      },
    });

    return data;
  };

  const onSuccess = (data: Task | undefined) => {
    if (!data) return;

    console.log(getNoteServerFn.url, data.noteId);
    queryClient.refetchQueries({ queryKey: [getTasksServerFn.url] });
    queryClient.refetchQueries({
      queryKey: [getNoteServerFn.url, data.noteId],
    });
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
