import { Bookmark } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteListItemProps = {
  note: Note;

  createdDateFormat?: string;
  colour?: Colour;
  to?: string;
};

export const NoteListItem = ({
  note,
  createdDateFormat = "ddd MMM D, YYYY",
  colour = colours.orange,
  to,
}: NoteListItemProps) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to ?? location.pathname}
      search={(old) => ({ ...old, noteId: note.id })}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      activeProps={{
        className: cn(colour.textPill, colour.backgroundPill),
      }}
      className={cn(
        "w-full flex justify-between items-center gap-2 px-2 py-1 rounded-xl text-sm transition-colors",
        isHovered && colour.textPill,
        isHovered && colour.backgroundPill,
      )}
    >
      {({ isActive }: { isActive: boolean }) => (
        <div key={note.id} className="w-full flex flex-col gap-1 p-1">
          <p className="truncate">
            {note.title === "" ? "Untitled Note" : note.title}
          </p>

          <div className="flex items-center gap-1">
            <p
              className={cn(
                "text-xs text-slate-400",
                (isHovered || isActive) && colour.textPill,
              )}
            >
              {note.created.format(createdDateFormat)}
            </p>

            {note.tags.length > 0 &&
              note.tags.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  size="xs"
                  variant="ghost"
                  closable={false}
                  collapsed={true}
                  iconClassName={
                    isHovered || isActive ? tag.colour.textPill : undefined
                  }
                />
              ))}

            {note.isBookmarked && (
              <Bookmark className="fill-red-400 m-1" weight="fill" size={14} />
            )}
          </div>
        </div>
      )}
    </Link>
  );
};
