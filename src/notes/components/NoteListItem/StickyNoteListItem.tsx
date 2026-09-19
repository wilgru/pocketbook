import { Bookmark, ChatCenteredText } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/notes.schema";

type StickyNoteListItemProps = {
  note: Note;
  colour?: Colour;
  to?: string;
  hideDate?: boolean;
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
  colour = colours.orange,
  to,
  hideDate = false,
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
      className="my-1 w-full transform-[rotate(var(--sticky-rotate,0deg))] text-sm transition-colors motion-reduce:transform-none"
    >
      {({ isActive }: { isActive: boolean }) => {
        const stickyMetaColourClass =
          isActive || isHovered ? colour.primary.text : "text-yellow-600";

        return (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-xs px-3 py-2 shadow-sm",
              isActive || isHovered
                ? cn(colour.primary.text, colour.primary.background)
                : "bg-yellow-200",
            )}
          >
            <div className="pointer-events-none max-h-28 overflow-hidden">
              <RichTextEditor readOnly size="sm" value={note.content} />
            </div>

            <div className="flex items-center">
              {!hideDate && (
                <p className={cn("pt-0.5 pr-1 text-xs", stickyMetaColourClass)}>
                  {getRelativeDateTitle(note.created, false)}
                </p>
              )}

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
                        ? tag.colour.primary.text
                        : "text-yellow-600"
                    }
                  />
                ))}

              {note.isBookmarked && (
                <Bookmark
                  className="my-1 fill-red-400"
                  weight="fill"
                  size={14}
                />
              )}

              {note.commentCount > 0 && (
                <div
                  className="my-1 flex items-center gap-1 text-xs"
                  style={{ color: "inherit" }}
                >
                  <ChatCenteredText size={14} />
                  <span>{note.commentCount}</span>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Link>
  );
};
