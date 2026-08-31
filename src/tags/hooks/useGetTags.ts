import { useQuery } from "@tanstack/react-query";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
import { mapTag } from "src/tags/utils/mapTag";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { Tag } from "src/tags/Tag.type";

type UseGetTagsResponse = {
  tags: Tag[];
  refetchTags: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<Tag[], Error>>;
};

export const useGetTags = (): UseGetTagsResponse => {
  const { pocketbookId } = useCurrentPocketbookId();

  const queryFn = async (): Promise<Tag[]> => {
    if (!pocketbookId) return [];

    const [tagsData, notesData] = await Promise.all([
      getTagsServerFn({ data: { pocketbookId } }),
      getNotesServerFn({ data: { pocketbookId } }),
    ]);

    const noteCountByTag = new Map<string, number>();
    for (const note of notesData.notes) {
      for (const tagId of note.tagIds) {
        noteCountByTag.set(tagId, (noteCountByTag.get(tagId) ?? 0) + 1);
      }
    }

    return tagsData.tags.map((tag) =>
      mapTag(tag, { noteCount: noteCountByTag.get(tag.id) ?? 0 }),
    );
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tags.list", pocketbookId],
    queryFn,
  });

  return { tags: data ?? [], refetchTags: refetch };
};
