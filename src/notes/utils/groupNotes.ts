import dayjs from "dayjs";
import type { Note, NotesGroup } from "src/notes/Note.type";
import type { Tag } from "src/tags/Tag.type";

const getGroup = (
  note: Note,
  groupBy: "created" | "tag",
  defaultGroupTitle: string | undefined = undefined,
  tagsToGroupBy?: Tag[],
): {
  title: string | null;
  relevantNoteData: Partial<Note>;
  sortOrder?: number;
}[] => {
  const getCreatedGroupSortOrder = (
    note: Note,
  ): {
    title: string;
    sortOrder: number;
  } => {
    const now = dayjs();
    let title: string;
    let sortOrder: number;

    if (note.created.isSame(now, "day")) {
      title = "Today";
      sortOrder = note.created.startOf("day").valueOf();
    } else if (note.created.add(1, "day").isSame(now, "day")) {
      title = "Yesterday";
      sortOrder = note.created.startOf("day").valueOf();
    } else if (note.created.isSame(now, "year")) {
      title = note.created.format("MMMM");
      sortOrder = note.created.startOf("month").valueOf();
    } else {
      title = note.created.format("YYYY");
      sortOrder = note.created.startOf("year").valueOf();
    }

    return { title, sortOrder };
  };

  const getTagGroupSortOrder = (title: string | null): number => {
    if (title === null) {
      return 1;
    }

    return 0; // when all groups have a sortOrder of 0, they will be sorted alphabetically
  };

  switch (groupBy) {
    case "created": {
      const { title, sortOrder } = getCreatedGroupSortOrder(note);

      return [
        {
          title,
          relevantNoteData: {},
          sortOrder,
        },
      ];
    }
    case "tag": {
      const relevantTags = tagsToGroupBy
        ? note.tags.filter((tag) =>
            tagsToGroupBy.some((groupTag) => groupTag.id === tag.id),
          )
        : note.tags;

      if (
        relevantTags.length === 1 &&
        relevantTags.at(0)?.name === defaultGroupTitle
      ) {
        const defaultTag = relevantTags.find(
          (tag) => tag.name === defaultGroupTitle,
        );

        return [
          {
            title: null,
            relevantNoteData: {
              tags: defaultTag ? [defaultTag] : [],
            },
            sortOrder: getTagGroupSortOrder(null),
          },
        ];
      }

      const resultingGroups = relevantTags.reduce(
        (
          acc: {
            title: string;
            relevantNoteData: Partial<Note>;
            sortOrder?: number;
          }[],
          tag,
        ) => {
          if (tag.name === defaultGroupTitle) {
            return acc;
          }

          return [
            ...acc,
            {
              title: tag.name,
              relevantNoteData: {
                tags: [tag],
              },
              sortOrder: getTagGroupSortOrder(tag.name),
            },
          ];
        },
        [],
      );

      if (tagsToGroupBy && resultingGroups.length === 0) {
        return [
          {
            title: null,
            relevantNoteData: {},
            sortOrder: getTagGroupSortOrder(null),
          },
        ];
      }

      return resultingGroups;
    }

    default:
      return [];
  }
};

const mergeTagArrays = (tagsArray1: Tag[] = [], tagsArray2: Tag[] = []) => {
  const map = new Map();

  [...tagsArray1, ...tagsArray2].forEach((tag: Tag) => {
    map.set(tag.id, tag);
  });

  return Array.from(map.values());
};

export function groupNotes(
  notes: Note[],
  groupBy: "created" | "tag",
  defaultGroupTitle: string | undefined = undefined,
  relevantNoteData: Partial<Note>, // TODO: might not need this anymore?
  sortDirection: "asc" | "desc" = "desc",
  tagsToGroupBy?: Tag[],
): NotesGroup[] {
  const groupedNotes = notes.reduce((acc: NotesGroup[], note: Note) => {
    const groups = getGroup(note, groupBy, defaultGroupTitle, tagsToGroupBy);

    for (const group of groups) {
      const existingGroup = acc.find(
        (accGroup) => accGroup.title === group.title,
      );

      if (existingGroup) {
        existingGroup.notes.push(note);
      } else {
        const newGroup: NotesGroup = {
          title: group.title,
          notes: [note],
          relevantNoteData: {
            tags: mergeTagArrays(
              relevantNoteData?.tags ?? [],
              group.relevantNoteData.tags,
            ),
          },
          sortOrder: group.sortOrder,
        };

        acc.push(newGroup);
      }
    }

    return acc;
  }, []);

  groupedNotes.sort((a, b) => {
    // When grouping by tag, always pin the "no tags" group to the top
    if (groupBy === "tag") {
      if (a.title === null) return -1;
      if (b.title === null) return 1;
    }

    const aOrder = a.sortOrder ?? 0;
    const bOrder = b.sortOrder ?? 0;

    if (aOrder !== bOrder) {
      return sortDirection === "desc" ? bOrder - aOrder : aOrder - bOrder;
    }

    const aTitle = a.title ?? "";
    const bTitle = b.title ?? "";

    if (sortDirection === "desc") {
      return bTitle.localeCompare(aTitle);
    }

    return aTitle.localeCompare(bTitle);
  });

  return groupedNotes;
}
