import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { InferSelectModel } from "drizzle-orm/table";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content"),
  isBookmarked: integer("is_bookmarked", { mode: "boolean" })
    .notNull()
    .default(false),
  pocketbook: text("pocketbook").references(() => pocketbooks.id),
  user: text("user"),
  deleted: text("deleted"),
  links: text("links").notNull().default("[]"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});
export type NoteSchema = InferSelectModel<typeof notes>;

export const noteTags = sqliteTable("note_tags", {
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  tagId: text("tag_id").notNull(),
});
