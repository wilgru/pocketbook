import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { normalizeLexicalContent } from "src/common/utils/lexicalContent";
import type { Note } from "src/notes/Note.type";
import type { Update, UpdateTint } from "src/updates/Update.type";
import type { UpdateSchema } from "src/updates/updates.schema";

dayjs.extend(utc);

type MapUpdateOptions = {
  notes?: Note[];
};

export const mapUpdate = (
  update: UpdateSchema,
  options: MapUpdateOptions = {},
): Update => {
  return {
    id: update.id,
    content: normalizeLexicalContent(update.content),
    tint: (update.tint as UpdateTint | null) ?? null,
    isWaypoint: update.isWaypoint,
    notes: options.notes ?? [],
    created: dayjs.utc(update.created).local(),
    updated: dayjs.utc(update.updated).local(),
  };
};
