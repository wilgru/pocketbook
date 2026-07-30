import type { CommentSchema } from "./comments.schema";
import type { Dayjs } from "dayjs";
import type { ColourName } from "src/colours/Colour.type";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/Note.type";

export type Comment = Prettify<
  Omit<
    CommentSchema,
    "content" | "tint" | "pocketbook" | "user" | "created" | "updated"
  > & {
    content: string;
    tint: ColourName | null; // TODO: make Colour type instead and rename column to colour
    notes: Note[];
    created: Dayjs;
    updated: Dayjs;
  }
>;
