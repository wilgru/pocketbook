import { Bookmark } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteTableItemProps = {
  note: Note;
  colour?: Colour;
  to?: string;
};

export const NoteTableItem = ({
  note,
  colour = colours.orange,
  to,
}: NoteTableItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const openNote = () => {
    navigate({
      to: to ?? location.pathname,
      search: (old) => ({ ...old, noteId: note.id }),
    });
  };

  return (
    <tr
      onClick={openNote}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openNote();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={0}
      className={cn(
        "cursor-pointer border-b border-slate-300 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-inset",
        isHovered && colour.backgroundPill,
      )}
    >
      <td className={cn("px-3 py-1.5", isHovered && colour.textPill)}>
        <p className="truncate font-normal">
          {note.title === "" ? "Untitled Note" : note.title}
        </p>
      </td>

      <td className="px-3 py-1.5">
        <div className="flex gap-1 items-center flex-wrap">
          {note.tags.length > 0 &&
            note.tags.map((tag) => (
              <TagPill
                key={tag.id}
                tag={tag}
                size="xs"
                closable={false}
                collapsed={false}
                iconClassName={isHovered ? tag.colour.textPill : undefined}
              />
            ))}

          {note.isBookmarked && (
            <Bookmark className="fill-red-400 m-1" weight="fill" size={14} />
          )}
        </div>
      </td>

      <td
        className={cn(
          "px-3 py-1.5 text-xs text-slate-400 text-right whitespace-nowrap",
          isHovered && colour.textPill,
        )}
      >
        {getRelativeDateTitle(note.created, false)}
      </td>
    </tr>
  );
};
