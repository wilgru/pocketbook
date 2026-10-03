import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { colourColumn } from "src/db/colourColumn";
import { dayjsColumn } from "src/db/dayjsColumn";
import { linksColumn } from "src/db/linksColumn";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { InferSelectModel } from "drizzle-orm/table";
import type { Prettify } from "src/common/types/Prettify.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

export const tagGroups = sqliteTable("tag_groups", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  pocketbookId: text("pocketbook").references(() => pocketbooks.id),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  colour: colourColumn("colour").notNull(),
  icon: text("icon").$type<CustomisationIconName>(),
  layout: text("layout").notNull().default("list").$type<"list" | "table">(),
  description: text("description"),
  groupBy: text("group_by").$type<"created" | "tag" | "tagGroup" | null>(),
  groupByTagGroupId: text("group_by_tag_group_id").references(
    () => tagGroups.id,
  ),
  sortBy: text("sort_by")
    .notNull()
    .default("created")
    .$type<"alphabetical" | "created">(),
  sortDirection: text("sort_direction")
    .notNull()
    .default("desc")
    .$type<"asc" | "desc">(),
  links: linksColumn("links").notNull().default([]),
  tagGroupId: text("tag_group").references(() => tagGroups.id),
  pocketbookId: text("pocketbook")
    .references(() => pocketbooks.id)
    .notNull(),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export type Tag = Prettify<
  InferSelectModel<typeof tags> & {
    noteCount: number;
  }
>;

export type TagGroup = Prettify<
  InferSelectModel<typeof tagGroups> & {
    tags: Tag[];
  }
>;
