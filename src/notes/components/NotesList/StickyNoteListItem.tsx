import { Bookmark } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import QuillViewer from "src/common/components/QuillViewer/QuillViewer";
import { cn } from "src/common/utils/cn";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type StickyNoteListItemProps = {
  note: Note;

  createdDateFormat?: string;
  colour?: Colour;
  to?: string;
};

const getStickyNoteRotation = (noteId: string): number => {
  const charSum = noteId
    .split("")
    .reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
  // Map to range [-1.5, 1.5] degrees
  return ((charSum % 31) - 15) / 10;
};

export const StickyNoteListItem = ({
  note,
  createdDateFormat = "ddd MMM D, YYYY",
  colour = colours.orange,
  to,
}: StickyNoteListItemProps) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const rotation = getStickyNoteRotation(note.id);

  return (
    <Link
      to={to ?? location.pathname}
      search={(old) => ({ ...old, noteId: note.id })}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ "--sticky-rotate": `${rotation}deg` } as React.CSSProperties}
      className="w-full my-2 text-sm transition-colors [transform:rotate(var(--sticky-rotate,0deg))] motion-reduce:transform-none"
    >
      {({ isActive }: { isActive: boolean }) => {
        const stickyMetaColourClass =
          isActive || isHovered ? colour.textPill : "text-yellow-600";

        return (
          <div
            className={cn(
              "flex flex-col gap-2 px-3 py-2 rounded-sm shadow",
              isActive || isHovered
                ? cn(colour.textPill, colour.backgroundPill)
                : "bg-yellow-200",
            )}
          >
            <div className="max-h-28 overflow-hidden pointer-events-none">
              <QuillViewer smallViewer content={note.content} />
            </div>

            <div className="flex items-center gap-1">
              <p className={cn("text-xs", stickyMetaColourClass)}>
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
                      isActive || isHovered
                        ? tag.colour.textPill
                        : "text-yellow-600"
                    }
                  />
                ))}

              {note.isBookmarked && (
                <Bookmark
                  className="fill-red-400 m-1"
                  weight="fill"
                  size={14}
                />
              )}
            </div>
          </div>
        );
      }}
    </Link>
  );
};
