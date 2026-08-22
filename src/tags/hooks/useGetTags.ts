import { useQuery } from "@tanstack/react-query";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
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
    if (!pocketbookId) {
      return [];
    }

    const [tagsResponse, notesResponse] = await Promise.all([
      bindings.getTags({ pocketbookId }),
      bindings.getNotes({ pocketbookId }),
    ]);

    if (!tagsResponse.success) throw new Error(tagsResponse.error);
    if (!notesResponse.success) throw new Error(notesResponse.error);

    const noteCountByTag = new Map<string, number>();
    for (const note of notesResponse.data.notes) {
      for (const tagId of note.tagIds) {
        noteCountByTag.set(tagId, (noteCountByTag.get(tagId) ?? 0) + 1);
      }
    }

    return tagsResponse.data.tags.map((tag) =>
      mapTag(tag, { noteCount: noteCountByTag.get(tag.id) ?? 0 }),
    );
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tags.list", pocketbookId],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return { tags: data ?? [], refetchTags: refetch };
};
