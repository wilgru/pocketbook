import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { EMPTY_LEXICAL_CONTENT } from "src/common/utils/lexicalContent";
import { dayjsColumn } from "src/db/dayjsColumn";
import { linksColumn } from "src/db/linksColumn";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { Dayjs } from "dayjs";
import type { InferSelectModel } from "drizzle-orm/table";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Tag } from "src/tags/tags.schema";
import type { Task } from "src/tasks/tasks.schema";

// TODO: rename to notesTable?
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title"),
  content: text("content").notNull().default(EMPTY_LEXICAL_CONTENT), // TODO: create lexicalColumn
  isBookmarked: integer("is_bookmarked", { mode: "boolean" })
    .notNull()
    .default(false),
  pocketbookId: text("pocketbook")
    .references(() => pocketbooks.id)
    .notNull(), // TODO rename to pocketbook id?
  deleted: dayjsColumn("deleted"),
  links: linksColumn("links").notNull().default([]),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export const noteTags = sqliteTable("note_tags", {
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  tagId: text("tag_id").notNull(),
});

export type Note = Prettify<
  InferSelectModel<typeof notes> & {
    tasks: Task[];
    tags: Tag[];
    commentCount: number;
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
