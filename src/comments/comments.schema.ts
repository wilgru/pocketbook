import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { colourColumn } from "src/db/colourColumn";
import { dayjsColumn } from "src/db/dayjsColumn";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { InferSelectModel } from "drizzle-orm/table";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/notes.schema";

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull().default(EMPTY_LEXICAL_CONTENT),
  colour: colourColumn("tint"),
  isWaypoint: integer("is_waypoint", { mode: "boolean" })
    .notNull()
    .default(false),
  pocketbookId: text("pocketbook").references(() => pocketbooks.id),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export const commentNotes = sqliteTable("comment_notes", {
  commentId: text("comment_id")
    .notNull()
    .references(() => comments.id),
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
});

export type Comment = Prettify<
  InferSelectModel<typeof comments> & {
    notes: Note[];
  }
>;
