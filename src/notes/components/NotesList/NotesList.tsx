import { isNoteContentEmpty } from "src/notes/utils/isNoteContentEmpty";
import { NoteListItem } from "./NoteListItem";
import { StickyNoteListItem } from "./StickyNoteListItem";
import type { Colour } from "src/colours/Colour.type";
import type { NotesGroup } from "src/notes/Note.type";

type NotesListProps = {
  noteGroup: NotesGroup;
  createdDateFormat?: string;
  colour: Colour;
};

export const NotesList = ({
  noteGroup,
  createdDateFormat,
  colour,
}: NotesListProps) => {
  return (
    <section>
      <div className="flex flex-col gap-0.5 items-start">
        {noteGroup.title && (
          <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold px-2 pb-1 pt-2">
            {noteGroup.title}
          </h3>
        )}

        {noteGroup.notes.map((note) => {
          const hasNoTitle = !note.title || note.title.trim() === "";
          const hasContent = !isNoteContentEmpty(note.content);

          if (hasNoTitle && hasContent) {
            return (
              <StickyNoteListItem
                key={note.id}
                note={note}
                createdDateFormat={createdDateFormat}
                colour={colour}
              />
            );
          }

          return (
            <NoteListItem
              key={note.id}
              note={note}
              createdDateFormat={createdDateFormat}
              colour={colour}
            />
          );
        })}
      </div>
    </section>
  );
};
