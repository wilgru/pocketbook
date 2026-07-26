import type { CommentSchema } from "./comments.schema";
import type { Dayjs } from "dayjs";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/Note.type";

export type CommentTint = "red" | "yellow" | "green" | "blue";

export type Comment = Prettify<
  Omit<
    CommentSchema,
    "content" | "tint" | "pocketbook" | "user" | "created" | "updated"
  > & {
    content: string;
    tint: CommentTint | null;
    notes: Note[];
    created: Dayjs;
    updated: Dayjs;
  }
>;
