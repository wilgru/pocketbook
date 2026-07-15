import type { NoteSchema } from "./notes.schema";
import type { Dayjs } from "dayjs";
import type { Link } from "src/common/types/Link.type";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Tag } from "src/tags/Tag.type";
import type { Task } from "src/tasks/Task.type";

export type NoteLink = Link;

export type Note = Prettify<
  Omit<
    NoteSchema,
    | "content"
    | "created"
    | "updated"
    | "deleted"
    | "pocketbook"
    | "user"
    | "links"
  > & {
    content: string;
    deleted: Dayjs | null;
    created: Dayjs;
    updated: Dayjs;
    tasks: Task[];
    tags: Tag[];
    links: NoteLink[];
    updateCount: number;
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
