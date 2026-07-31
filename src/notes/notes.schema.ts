import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { dayjsTimestamp, lexicalText, linksJson } from "src/db/customTypes";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { Dayjs } from "dayjs";
import type { Task } from "electron";
import type { InferFromModelAndExtend } from "src/common/types/InferFromModelAndExtend.type";
import type { Tag } from "src/tags/Tag.type";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: lexicalText("content").notNull().default(EMPTY_LEXICAL_CONTENT),
  isBookmarked: integer("is_bookmarked", { mode: "boolean" })
    .notNull()
    .default(false),
  pocketbook: text("pocketbook").references(() => pocketbooks.id),
  user: text("user"),
  links: linksJson("links").notNull().default([]),
  deleted: dayjsTimestamp("deleted"),
  created: dayjsTimestamp("created").notNull(),
  updated: dayjsTimestamp("updated").notNull(),
});

export const noteTags = sqliteTable("note_tags", {
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  tagId: text("tag_id").notNull(),
});

export type Note = InferFromModelAndExtend<
  typeof notes,
  {
    tasks: Task[];
    tags: Tag[];
    commentCount: number; // TODO: make calculated column
  }
>;

export type NotesGroup = {
  title: string | null;
  notes: Note[];
  relevantNoteData: Partial<Note>;
  sortOrder?: number;
};

export type DateWithNotes = {
  id: string;
  created: Dayjs;
  hasBookmarked: boolean;
};
