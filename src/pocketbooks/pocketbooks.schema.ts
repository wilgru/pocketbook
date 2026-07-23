import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { InferSelectModel } from "drizzle-orm/table";
import type { ColourName } from "src/colours/Colour.type";

export const pocketbooks = sqliteTable("pocketbooks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  icon: text("icon").notNull().default(""),
  colour: text("colour").notNull().$type<ColourName>(),
  notesLayout: text("notes_layout").notNull().default("list"),
  notesSortBy: text("notes_sort_by").notNull().default("created"),
  notesSortDirection: text("notes_sort_direction").notNull().default("desc"),
  notesGroupBy: text("notes_group_by"),
  bookmarkedLayout: text("bookmarked_layout").notNull().default("list"),
  bookmarkedSortBy: text("bookmarked_sort_by").notNull().default("created"),
  bookmarkedSortDirection: text("bookmarked_sort_direction")
    .notNull()
    .default("desc"),
  bookmarkedGroupBy: text("bookmarked_group_by"),
  user: text("user"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});
export type PocketbookSchema = InferSelectModel<typeof pocketbooks>;
