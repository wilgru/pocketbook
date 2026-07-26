import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { InferSelectModel } from "drizzle-orm/table";

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  content: text("content"),
  tint: text("tint"),
  isWaypoint: integer("is_waypoint", { mode: "boolean" })
    .notNull()
    .default(false),
  pocketbook: text("pocketbook").references(() => pocketbooks.id),
  user: text("user"),
  created: text("created").notNull(),
  updated: text("updated").notNull(),
});
export type CommentSchema = InferSelectModel<typeof comments>;

export const commentNotes = sqliteTable("comment_notes", {
  commentId: text("comment_id")
    .notNull()
    .references(() => comments.id),
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
});
