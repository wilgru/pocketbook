import type { Note } from "src/notes/notes.schema";

export type NoteSortBy = "created" | "alphabetical";
export type SortDirection = "asc" | "desc";

export const sortNotes = (
  notes: Note[],
  sortBy: NoteSortBy = "created",
  sortDirection: SortDirection = "desc",
): Note[] => {
  return [...notes].sort((a, b) => {
    let compareVal = 0;

    if (sortBy === "alphabetical") {
      const titleA = a.title ?? "";
      const titleB = b.title ?? "";
      compareVal = titleA.localeCompare(titleB, undefined, {
        sensitivity: "base",
        numeric: true,
      });
    } else {
      compareVal = a.created.valueOf() - b.created.valueOf();
    }

    if (sortDirection === "desc") {
      compareVal = -compareVal;
    }

    return compareVal;
  });
};
