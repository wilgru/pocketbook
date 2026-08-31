import type { PocketbookSchema } from "./pocketbooks.schema";
import type { Dayjs } from "dayjs";
import type { Colour } from "src/colours/Colour.type";
import type { Prettify } from "src/common/types/Prettify.type";

export type Pocketbook = Prettify<
  Omit<
    PocketbookSchema,
    | "colour"
    | "notesSortBy"
    | "notesSortDirection"
    | "notesGroupBy"
    | "notesGroupByTagGroupId"
    | "notesLayout"
    | "bookmarkedSortBy"
    | "bookmarkedSortDirection"
    | "bookmarkedGroupBy"
    | "bookmarkedGroupByTagGroupId"
    | "bookmarkedLayout"
    | "user"
    | "created"
    | "updated"
  > & {
    colour: Colour;
    created: Dayjs;
    updated: Dayjs;
    noteCount?: number;
    taskCount?: number;
    notesSortBy?: "alphabetical" | "created";
    notesSortDirection?: "asc" | "desc";
    notesGroupBy?: "created" | "tag" | "tagGroup" | null;
    notesGroupByTagGroupId?: string | null;
    notesLayout?: "list" | "table";
    bookmarkedSortBy?: "alphabetical" | "created";
    bookmarkedSortDirection?: "asc" | "desc";
    bookmarkedGroupBy?: "created" | "tag" | "tagGroup" | null;
    bookmarkedGroupByTagGroupId?: string | null;
    bookmarkedLayout?: "list" | "table";
  }
>;
