import { cn } from "cn";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/notes.schema";

type NoteSelectProps = {
  selectedNotes: Note[];
  colour?: Colour;
  mode?: "single" | "multi";
  onChange: (notes: Note[]) => void;
  onOpenChange?: (open: boolean) => void;
};

export const NoteSelect = ({
  selectedNotes,
  colour = colours.orange,
  mode = "multi",
  onChange,
  onOpenChange,
}: NoteSelectProps) => {
  const { pocketbookId } = useCurrentPocketbook();
  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
  });
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedSingleNote = mode === "single" ? selectedNotes[0] : null;

  const filteredNotes =
    notesData?.notes.filter(
      (note) =>
        (note.title ?? "Untitled Note")
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        !selectedNotes.some((selected) => selected.id === note.id),
    ) ?? [];

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleSelectNote = (note: Note) => {
    const newNotes = mode === "single" ? [note] : [...selectedNotes, note];
    setSearch("");
    onChange(newNotes);
  };

  const handleRemoveNote = (noteId: string) => {
    const newNotes = selectedNotes.filter((note) => note.id !== noteId);
    onChange(newNotes);
  };

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {mode === "multi" &&
        selectedNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => handleRemoveNote(note.id)}
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
              colour.primary.background,
              colour.primary.text,
              colour.primary.backgroundHovered,
            )}
          >
            <span className="max-w-30 truncate">
              {note.title ?? "Untitled Note"}
            </span>
            <span className="text-xs leading-none">×</span>
          </button>
        ))}

      <ControlPopover
        open={isOpen}
        onOpenChange={handleOpenChange}
        onCloseAutoFocus={(event) => event.preventDefault()}
        trigger={
          mode === "single" && selectedSingleNote ? (
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors",
                colour.primary.background,
                colour.primary.text,
                colour.primary.backgroundHovered,
              )}
            >
              <span className="max-w-30 truncate">
                {selectedSingleNote.title ?? "Untitled Note"}
              </span>
            </button>
          ) : (
            <div>
              <Button
                variant="ghost"
                size="xs"
                colour={colour}
                iconName="pencil"
              />
            </div>
          )
        }
        className="flex w-48 flex-col px-3 pt-3 text-sm"
        clearActionLabel={
          mode === "single" && selectedSingleNote ? "Clear note" : undefined
        }
        onClearAction={
          mode === "single" && selectedSingleNote
            ? () => onChange([])
            : undefined
        }
      >
        <input
          type="text"
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-orange-400 focus:outline-hidden"
          placeholder="search for a note"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />

        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto py-2">
          {filteredNotes.length === 0 && (
            <p className="px-2 py-1 text-xs text-slate-400">No notes found</p>
          )}

          {filteredNotes.map((note) => (
            <button
              key={note.id}
              className={cn(
                "flex cursor-pointer items-center rounded-lg px-2 py-1 text-sm",
                colour.secondary.backgroundHovered,
                colour.secondary.textHovered,
              )}
              onClick={() => handleSelectNote(note)}
            >
              {note.title ?? "Untitled Note"}
            </button>
          ))}
        </div>
      </ControlPopover>
    </div>
  );
};
