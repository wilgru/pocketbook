import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { dayjsColumn } from "src/db/dayjsColumn";
import { linksColumn } from "src/db/linksColumn";
import { notes } from "src/notes/notes.schema";
import { pocketbooks } from "src/pocketbooks/pocketbooks.schema";
import type { InferSelectModel } from "drizzle-orm/table";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/notes.schema";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  link: text("link"), // TODO: delete?
  links: linksColumn("links").notNull().default([]),
  isImportant: integer("is_important", { mode: "boolean" })
    .notNull()
    .default(false),
  noteId: text("noteId").references(() => notes.id),
  blockedComment: text("blocked_comment"),
  dueDate: dayjsColumn("due_date"),
  completedDate: dayjsColumn("completed_date"),
  cancelledDate: dayjsColumn("cancelled_date"),
  blockedDate: dayjsColumn("blocked_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  pocketbookId: text("pocketbook")
    .references(() => pocketbooks.id)
    .notNull(),
  created: dayjsColumn("created").notNull(),
  updated: dayjsColumn("updated").notNull(),
});

export type Task = Prettify<InferSelectModel<typeof tasks> & { note?: Note }>;

export type TasksGroup = {
  title: string;
  tasks: Task[];
  relevantTaskData: Partial<Task>;
};
