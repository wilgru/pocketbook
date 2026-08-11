import type { TaskSchema } from "./tasks.schema";
import type { Dayjs } from "dayjs";
import type { Link } from "src/common/types/Link.type";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/Note.type";

export type Task = Prettify<
  Omit<
    TaskSchema,
    | "note"
    | "dueDate"
    | "completedDate"
    | "cancelledDate"
    | "blockedDate"
    | "pocketbook"
    | "user"
    | "created"
    | "updated"
    | "links"
  > & {
    note: Note | null;
    dueDate: Dayjs | null;
    completedDate: Dayjs | null;
    cancelledDate: Dayjs | null;
    blockedDate: Dayjs | null;
    created: Dayjs;
    updated: Dayjs;
    links: Link[];
  }
>;

export type TasksGroup = {
  title: string;
  tasks: Task[];
  relevantTaskData: Partial<Task>;
};
