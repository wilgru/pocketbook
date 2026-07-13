import type { UpdateSchema } from "./updates.schema";
import type { Dayjs } from "dayjs";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";

export type UpdateTint = "red" | "yellow" | "green" | "blue";

export type Update = Prettify<
  Omit<
    UpdateSchema,
    "content" | "tint" | "pocketbook" | "user" | "created" | "updated"
  > & {
    content: string;
    tint: UpdateTint | null;
    notes: Note[];
    created: Dayjs;
    updated: Dayjs;
  }
>;

interface CommentUpdate {
  id: string;
  type: "comment";
  action: "created";
  date: Dayjs;
  data: Update;
}

interface TaskUpdate {
  id: string;
  type: "task";
  action: "completed" | "cancelled";
  date: Dayjs;
  data: Task;
}

interface NoteUpdate {
  id: string;
  type: "note";
  action: "created";
  date: Dayjs;
  data: Note;
}

export type UpdateProper = CommentUpdate | TaskUpdate | NoteUpdate;

export type UpdateGroup = {
  date: Dayjs;
  updates: UpdateProper[];
};
