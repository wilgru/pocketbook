import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { deleteTagServerFn } from "src/tags/serverFunctions/deleteTag";
import { getTagServerFn } from "../serverFunctions/getTag";
import { getTagGroupsServerFn } from "../serverFunctions/getTagGroups";
import { getTagsServerFn } from "../serverFunctions/getTags";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";

type UseDeleteTagResponse = {
  deleteTag: UseMutateAsyncFunction<string | undefined, Error, string, unknown>;
};

export const useDeleteTag = (): UseDeleteTagResponse => {
  const queryClient = useQueryClient();

  const mutationFn = async (tagId: string): Promise<string | undefined> => {
    await deleteTagServerFn({ data: { tagId } });
    return tagId;
  };

  const onSuccess = async (data: string | undefined) => {
    if (!data) return;

    queryClient.removeQueries({ queryKey: [getTagServerFn.url, data] });

    await Promise.all([
      queryClient.refetchQueries({ queryKey: [getTagsServerFn.url] }),
      queryClient.refetchQueries({ queryKey: [getTagGroupsServerFn.url] }),
      queryClient.refetchQueries({ queryKey: [getNotesServerFn.url] }),
      queryClient.refetchQueries({ queryKey: [getNoteServerFn.url] }),
    ]);
  };

  // TODO: consider time caching for better performance
  const { mutateAsync } = useMutation({
    mutationKey: ["tags.delete"],
    mutationFn,
    onSuccess,
  });

  return { deleteTag: mutateAsync };
};
