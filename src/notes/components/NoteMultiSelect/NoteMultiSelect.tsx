import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteMultiSelectProps = {
  selectedNotes: Note[];
  colour?: Colour;
  onChange: (notes: Note[]) => void;
};

export const NoteMultiSelect = ({
  selectedNotes,
  colour = colours.orange,
  onChange,
}: NoteMultiSelectProps) => {
  const { notes } = useGetNotes({});
  const [search, setSearch] = useState("");

  const filteredNotes = notes.filter(
    (note) =>
      (note.title ?? "Untitled Note")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !selectedNotes.some((selected) => selected.id === note.id),
  );

  const handleSelectNote = (note: Note) => {
    const newNotes = [...selectedNotes, note];
    onChange(newNotes);
    setSearch("");
  };

  const handleRemoveNote = (noteId: string) => {
    const newNotes = selectedNotes.filter((note) => note.id !== noteId);
    onChange(newNotes);
  };

  return (
    <div className="flex flex-row flex-wrap gap-2 items-center">
      {selectedNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => handleRemoveNote(note.id)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors",
            colour.backgroundPill,
            colour.textPill,
            colour.backgroundPillInverted,
          )}
        >
          <span className="max-w-[120px] truncate">
            {note.title ?? "Untitled Note"}
          </span>
          <span className="text-xs leading-none">×</span>
        </button>
      ))}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div>
            <Button variant="ghost" size="sm" colour={colour} iconName="plus">
              {selectedNotes.length === 0 ? <>Add note</> : undefined}
            </Button>
          </div>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="flex flex-col gap-2 bg-white border border-slate-200 text-sm rounded-2xl p-2 w-48 drop-shadow z-50"
            sideOffset={2}
            align="start"
          >
            <input
              type="text"
              className="rounded-lg px-2 py-1 text-xs border border-slate-300 focus:outline-none focus:border-orange-400"
              placeholder="search for a note"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {filteredNotes.length === 0 && (
              <p className="text-xs text-slate-400 px-2 py-1">No notes found</p>
            )}

            {filteredNotes.map((note) => (
              <DropdownMenu.Item
                key={note.id}
                className="rounded-lg px-2 py-1 cursor-pointer hover:bg-slate-100 text-sm truncate"
                onClick={() => handleSelectNote(note)}
              >
                {note.title ?? "Untitled Note"}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
