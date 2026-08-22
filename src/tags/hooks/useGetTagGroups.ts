import { useQuery } from "@tanstack/react-query";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { mapTag } from "src/tags/utils/mapTag";
import { mapTagGroup } from "src/tags/utils/mapTagGroup";
import type {
  QueryObserverResult,
  RefetchOptions,
} from "@tanstack/react-query";
import type { Tag, TagGroup } from "src/tags/Tag.type";

type UseGetTagGroupsResponse = {
  ungroupedTags: Tag[];
  tagGroups: TagGroup[];
  refetchTagGroups: (options?: RefetchOptions | undefined) => Promise<
    QueryObserverResult<
      {
        ungroupedTags: Tag[];
        tagGroups: TagGroup[];
      },
      Error
    >
  >;
};

export const useGetTagGroups = (): UseGetTagGroupsResponse => {
  const { pocketbookId } = useCurrentPocketbookId();

  const queryFn = async (): Promise<{
    ungroupedTags: Tag[];
    tagGroups: TagGroup[];
  }> => {
    if (!pocketbookId) {
      return {
        ungroupedTags: [],
        tagGroups: [],
      };
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

    const mappedTagGroups = tagsResponse.data.tagGroups.map(mapTagGroup);
    const mappedTags = tagsResponse.data.tags.map((tag) =>
      mapTag(tag, { noteCount: noteCountByTag.get(tag.id) ?? 0 }),
    );

    const ungroupedTags: Tag[] = [];
    mappedTags.forEach((tag) => {
      if (tag.tagGroupId) {
        const tagGroup = mappedTagGroups.find(
          (group) => group.id === tag.tagGroupId,
        );
        if (tagGroup) {
          tagGroup.tags.push(tag);
        }
      } else {
        ungroupedTags.push(tag);
      }
    });

    return {
      ungroupedTags,
      tagGroups: mappedTagGroups,
    };
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tagGroups.list", pocketbookId],
    queryFn,
    // staleTime: 2 * 60 * 1000,
    // gcTime: 2 * 60 * 1000,
  });

  return {
    ungroupedTags: data?.ungroupedTags ?? [],
    tagGroups: data?.tagGroups ?? [],
    refetchTagGroups: refetch,
  };
};
