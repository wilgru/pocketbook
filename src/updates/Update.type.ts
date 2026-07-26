import type { Dayjs } from "dayjs";
import type { Comment } from "src/comments/Comment.type";
import type { Note } from "src/notes/Note.type";
import type { Task } from "src/tasks/Task.type";

interface CommentUpdate {
  id: string;
  type: "comment";
  action: "created";
  date: Dayjs;
  data: Comment;
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

export type Update = CommentUpdate | TaskUpdate | NoteUpdate;

export type UpdateGroup = {
  date: Dayjs;
  updates: Update[];
};
