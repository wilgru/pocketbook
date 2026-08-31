import { useQuery } from "@tanstack/react-query";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { getTagsServerFn } from "src/tags/serverFunctions/getTags";
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
      { ungroupedTags: Tag[]; tagGroups: TagGroup[] },
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
    if (!pocketbookId) return { ungroupedTags: [], tagGroups: [] };

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

    const mappedTagGroups = tagsData.tagGroups.map(mapTagGroup);
    const mappedTags = tagsData.tags.map((tag) =>
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

    return { ungroupedTags, tagGroups: mappedTagGroups };
  };

  // TODO: consider time caching for better performance
  const { data, refetch } = useQuery({
    queryKey: ["tagGroups.list", pocketbookId],
    queryFn,
  });

  return {
    ungroupedTags: data?.ungroupedTags ?? [],
    tagGroups: data?.tagGroups ?? [],
    refetchTagGroups: refetch,
  };
};
