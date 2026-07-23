import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { getColour } from "src/colours/utils/getColour";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";
import type { PocketbookSchema } from "src/pocketbooks/pocketbooks.schema";

dayjs.extend(utc);

export const mapPocketbook = (
  pocketbook: PocketbookSchema & { noteCount?: number; taskCount?: number },
): Pocketbook => {
  return {
    id: pocketbook.id,
    title: pocketbook.title,
    icon: pocketbook.icon,
    colour: getColour(pocketbook.colour),
    created: dayjs.utc(pocketbook.created).local(),
    updated: dayjs.utc(pocketbook.updated).local(),
    notesLayout: pocketbook.notesLayout ?? "list",
    notesSortBy:
      (pocketbook.notesSortBy as "alphabetical" | "created") ?? "created",
    notesSortDirection:
      (pocketbook.notesSortDirection as "asc" | "desc") ?? "desc",
    notesGroupBy: (pocketbook.notesGroupBy as "created" | "tag" | null) ?? null,
    bookmarkedLayout: pocketbook.bookmarkedLayout ?? "list",
    bookmarkedSortBy:
      (pocketbook.bookmarkedSortBy as "alphabetical" | "created") ?? "created",
    bookmarkedSortDirection:
      (pocketbook.bookmarkedSortDirection as "asc" | "desc") ?? "desc",
    bookmarkedGroupBy:
      (pocketbook.bookmarkedGroupBy as "created" | "tag" | null) ?? null,
    noteCount: pocketbook.noteCount,
    taskCount: pocketbook.taskCount,
  };
};
