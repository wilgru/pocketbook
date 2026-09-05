import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { colourColumn } from "src/db/colourColumn";
import { dayjsColumn } from "src/db/dayjsColumn";
import type { InferSelectModel } from "drizzle-orm/table";
import type { Prettify } from "src/common/types/Prettify.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

export const pocketbooks = sqliteTable("pocketbooks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").$type<CustomisationIconName>(),
  colour: colourColumn("colour").notNull(),
  notesLayout: text("notes_layout")
    .notNull()
    .default("list")
    .$type<"list" | "table">(),
  notesSortBy: text("notes_sort_by")
    .notNull()
    .default("created")
    .$type<"alphabetical" | "created">(),
  notesSortDirection: text("notes_sort_direction")
    .notNull()
    .default("desc")
    .$type<"asc" | "desc">(),
  notesGroupBy: text("notes_group_by").$type<"created" | "tag" | "tagGroup">(),
  notesGroupByTagGroupId: text("notes_group_by_tag_group_id"),
  bookmarkedLayout: text("bookmarked_layout")
    .notNull()
    .default("list")
    .$type<"list" | "table">(),
  bookmarkedSortBy: text("bookmarked_sort_by")
    .notNull()
    .default("created")
    .$type<"alphabetical" | "created">(),
  bookmarkedSortDirection: text("bookmarked_sort_direction")
    .notNull()
    .default("desc")
    .$type<"asc" | "desc">(),
  bookmarkedGroupBy: text("bookmarked_group_by").$type<
    "created" | "tag" | "tagGroup"
  >(),
  bookmarkedGroupByTagGroupId: text("bookmarked_group_by_tag_group_id"),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export type Pocketbook = Prettify<
  InferSelectModel<typeof pocketbooks> & {
    noteCount: number;
    taskCount: number;
  }
>;
