import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { mapNote } from "src/notes/utils/mapNote";
import { useGetTasks } from "src/tasks/hooks/useGetTasks";
import { mapTag } from "src/tags/utils/mapTag";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { Note } from "src/notes/Note.type";
import type { Tag } from "src/tags/Tag.type";

type RawTagData = {
  tag: Tag;
  notes: { note: Note; rawNote: { id: string; tagIds: string[] } }[];
};

type UseTagResponse = {
  tag: Tag | undefined;
  notes: Note[];
  refetchTag: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<RawTagData, Error>>;
};

export const useGetTag = (tagId: string): UseTagResponse => {
  const { tasks: allTasks } = useGetTasks({});

  const queryFn = async (): Promise<RawTagData> => {
    const tagResponse = await window.api.getTag({ tagId });
    if (!tagResponse.success) throw new Error(tagResponse.error);

    const pocketbookId = tagResponse.data.pocketbook;
    const [notesResponse, tagsResponse] = pocketbookId
      ? await Promise.all([
          window.api.getNotes({ pocketbookId }),
          window.api.getTags({ pocketbookId }),
        ])
      : [
          { success: true, data: { notes: [] } },
          { success: true, data: { tags: [], tagGroups: [] } },
        ];

    if (!notesResponse.success) throw new Error(notesResponse.error);
    if (!tagsResponse.success) throw new Error(tagsResponse.error);

    const allTags = tagsResponse.data.tags.map((t) => mapTag(t));
    const tagById = new Map<string, Tag>(allTags.map((t) => [t.id, t]));

    const noteRows = notesResponse.data.notes.filter((note) =>
      note.tagIds.includes(tagId),
    );

    const notes = noteRows.map((note) => {
      const noteTags = note.tagIds
        .map((id) => tagById.get(id))
        .filter((t): t is Tag => t !== undefined);
      return {
        note: mapNote(note, { tags: noteTags }),
        rawNote: { id: note.id, tagIds: note.tagIds },
      };
    });

    const tag = mapTag(tagResponse.data, { noteCount: notes.length });

    return { tag, notes };
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tags.get", tagId],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  const notes = useMemo(
    () =>
      (data?.notes ?? []).map(({ note, rawNote }) => {
        const tasks = allTasks.filter((task) => task.note?.id === rawNote.id);
        return { ...note, tasks };
      }),
    [data, allTasks],
  );

  return {
    tag: data?.tag,
    notes,
    refetchTag: refetch,
  };
};
