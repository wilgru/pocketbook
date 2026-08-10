import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { cn } from "src/common/utils/cn";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

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
  const { notes } = useGetNotes({});
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const selectedSingleNote = mode === "single" ? selectedNotes[0] : null;

  const filteredNotes = notes.filter(
    (note) =>
      (note.title ?? "Untitled Note")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !selectedNotes.some((selected) => selected.id === note.id),
  );

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
    <div className="flex flex-row flex-wrap gap-2 items-center">
      {mode === "multi" &&
        selectedNotes.map((note) => (
          <button
            key={note.id}
            onClick={() => handleRemoveNote(note.id)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors",
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

      <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          {mode === "single" && selectedSingleNote ? (
            <button
              type="button"
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors",
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
                size="sm"
                colour={colour}
                iconName="pencil"
              />
            </div>
          )}
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50"
            sideOffset={6}
            align="center"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <ControlPopover
              className="flex flex-col gap-2 text-sm p-3 w-48"
              clearActionLabel={
                mode === "single" && selectedSingleNote
                  ? "Clear note"
                  : undefined
              }
              onClearAction={
                mode === "single" && selectedSingleNote
                  ? () => onChange([])
                  : undefined
              }
            >
              <input
                type="text"
                className="rounded-lg px-2 py-1 text-xs border border-slate-300 focus:outline-hidden focus:border-orange-400"
                placeholder="search for a note"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />

              {filteredNotes.length === 0 && (
                <p className="text-xs text-slate-400 px-2 py-1">
                  No notes found
                </p>
              )}

              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  className={cn(
                    "rounded-lg px-2 py-1 cursor-pointer text-sm text-start truncate",
                    colour.secondary.backgroundHovered,
                    colour.secondary.textHovered,
                  )}
                  onClick={() => handleSelectNote(note)}
                >
                  {note.title ?? "Untitled Note"}
                </button>
              ))}
            </ControlPopover>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};
