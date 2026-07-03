import { isNoteContentEmpty } from "src/notes/utils/isNoteContentEmpty";
import { NoteListItem } from "./NoteListItem";
import { StickyNoteListItem } from "./StickyNoteListItem";
import type { Colour } from "src/colours/Colour.type";
import type { NotesGroup } from "src/notes/Note.type";

type NotesListProps = {
  noteGroup: NotesGroup;
  colour: Colour;
};

export const NotesList = ({ noteGroup, colour }: NotesListProps) => {
  return (
    <section>
      <div className="flex flex-col gap-0.5 items-start">
        {noteGroup.title && (
          <h3 className="text-slate-500 text-xs w-full tracking-wider font-medium px-2 pb-1 pt-2 border-dashed border-b border-slate-300">
            {noteGroup.title}
          </h3>
        )}

        {noteGroup.notes.map((note) => {
          const hasNoTitle = !note.title || note.title.trim() === "";
          const hasContent = !isNoteContentEmpty(note.content);

          if (hasNoTitle && hasContent) {
            return (
              <StickyNoteListItem key={note.id} note={note} colour={colour} />
            );
          }

          return <NoteListItem key={note.id} note={note} colour={colour} />;
        })}
      </div>
    </section>
  );
};
