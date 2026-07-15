import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { normalizeLexicalContent } from "src/common/utils/lexicalContent";
import type { NoteLink, Note } from "src/notes/Note.type";
import type { NoteSchema } from "src/notes/notes.schema";
import type { Tag } from "src/tags/Tag.type";
import type { Task } from "src/tasks/Task.type";

dayjs.extend(utc);

type MapNoteOptions = {
  tags?: Tag[];
  tasks?: Task[];
};

export const mapNote = (
  note: NoteSchema,
  options: MapNoteOptions = {},
): Note => {
  const links: NoteLink[] = note.links ? JSON.parse(note.links) : [];

  return {
    id: note.id,
    title: note.title,
    tasks: options.tasks ?? [],
    content: normalizeLexicalContent(note.content),
    isBookmarked: note.isBookmarked,
    tags: options.tags ?? [],
    links,
    updateCount: 0,
    deleted: note.deleted ? dayjs.utc(note.deleted).local() : null,
    created: dayjs.utc(note.created).local(),
    updated: dayjs.utc(note.updated).local(),
  };
};
