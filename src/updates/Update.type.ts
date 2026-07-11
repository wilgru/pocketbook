import type { UpdateSchema } from "./updates.schema";
import type { Dayjs } from "dayjs";
import type Delta from "quill-delta";
import type { Prettify } from "src/common/types/Prettify.type";
import type { Note } from "src/notes/Note.type";

export type UpdateTint = "red" | "yellow" | "green" | "blue";

export type Update = Prettify<
  Omit<
    UpdateSchema,
    "content" | "tint" | "pocketbook" | "user" | "created" | "updated"
  > & {
    content: Delta;
    tint: UpdateTint | null;
    notes: Note[];
    created: Dayjs;
    updated: Dayjs;
  }
>;

export type NormalisedGroupItem =
  | {
      id: string;
      type: "journal";
      action: "created" | "updated";
      date: Dayjs;
      title: string;
    }
  | {
      id: string;
      type: "note";
      action: "created" | "updated";
      date: Dayjs;
      title: string;
    }
  | {
      id: string;
      type: "task";
      action: "completed" | "cancelled";
      date: Dayjs;
      title: string;
    };

export type UpdatesGroup = {
  title: string;
  updates: Update[];
  normalisedItems: NormalisedGroupItem[];
};
