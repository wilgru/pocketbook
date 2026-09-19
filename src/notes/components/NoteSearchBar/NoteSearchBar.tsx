import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { cn } from "cn";
import { matchSorter } from "match-sorter";
import { useEffect, useMemo, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getPlainTextFromLexicalContent } from "src/common/utils/lexicalContent";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useDebouncedCallback } from "use-debounce";
import { NoteListItem } from "../NoteListItem/NoteListItem";
import type { Note } from "src/notes/notes.schema";

export const NoteSearchBar = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { pocketbookId, currentPocketbook } = useCurrentPocketbook();
  const colour = currentPocketbook?.colour ?? colours.orange;

  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
  });

  const noteTextMap = useMemo(
    () =>
      new Map(
        notesData?.notes.map((note) => [
          note.id,
          getPlainTextFromLexicalContent(note.content),
        ]),
      ),
    [notesData],
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
  }, 300);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch(value);
    setIsOpen(value.length > 0);
  };

  const searchResults: Note[] =
    searchQuery.length > 0 && notesData
      ? matchSorter(notesData.notes, searchQuery, {
          keys: ["title", (note: Note) => noteTextMap.get(note.id) ?? ""],
        }).slice(0, 10)
      : [];

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleNoteSelect = () => {
    setIsOpen(false);
    setInputValue("");
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const notesPath = pocketbookId ? `/${pocketbookId}/notes` : undefined;

  if (!pocketbookId) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-2 py-1.5 text-sm transition-colors",
          isOpen && "border-slate-300",
        )}
      >
        <MagnifyingGlass size={14} className="shrink-0 text-slate-500" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes..."
          className="w-56 bg-transparent text-sm outline-hidden placeholder:text-slate-500"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && searchQuery.length > 0 && (
        <div className="absolute top-full right-0 z-50 mt-1 max-h-80 w-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          {searchResults.length > 0 ? (
            searchResults.map((note) => (
              <div key={note.id} onClick={handleNoteSelect}>
                <NoteListItem note={note} colour={colour} to={notesPath} />
              </div>
            ))
          ) : (
            <p className="p-2 text-center text-sm text-slate-400">
              No notes found
            </p>
          )}
        </div>
      )}
    </div>
  );
};
