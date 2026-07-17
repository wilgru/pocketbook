import { MagnifyingGlass, X } from "@phosphor-icons/react";
import debounce from "debounce";
import { matchSorter } from "match-sorter";
import { useEffect, useMemo, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { getPlainTextFromLexicalContent } from "src/common/utils/lexicalContent";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { NoteListItem } from "../NoteListItem/NoteListItem";
import type { Note } from "src/notes/Note.type";

export const NoteSearchBar = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { pocketbookId, currentPocketbook } = useCurrentPocketbook();
  const colour = currentPocketbook?.colour ?? colours.orange;

  const { notes } = useGetNotes({});

  const noteTextMap = useMemo(
    () =>
      new Map(
        notes.map((note) => [
          note.id,
          getPlainTextFromLexicalContent(note.content),
        ]),
      ),
    [notes],
  );

  const debouncedSearch = useRef(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
  );

  useEffect(() => {
    const debounced = debouncedSearch.current;
    return () => {
      debounced.clear();
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSearch.current(value);
    setIsOpen(value.length > 0);
  };

  const searchResults: Note[] =
    searchQuery.length > 0
      ? matchSorter(notes, searchQuery, {
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
          "flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-slate-200 bg-slate-100 text-sm transition-colors",
          isOpen && "border-slate-300",
        )}
      >
        <MagnifyingGlass size={14} className="text-slate-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes..."
          className="w-56 outline-none text-sm placeholder:text-slate-500 bg-transparent"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && searchQuery.length > 0 && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchResults.length > 0 ? (
            searchResults.map((note) => (
              <div key={note.id} onClick={handleNoteSelect}>
                <NoteListItem note={note} colour={colour} to={notesPath} />
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 p-2 text-center">
              No notes found
            </p>
          )}
        </div>
      )}
    </div>
  );
};
