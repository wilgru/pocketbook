import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { Icon } from "src/icons/components/Icon/Icon";
import { TaskProgressCircle } from "src/tasks/components/TaskProgressCircle/TaskProgressCircle";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/notes.schema";

type NoteListItemProps = {
  note: Note;
  colour?: Colour;
  to?: string;
};

export const NoteListItem = ({
  note,
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
        className: cn(colour.primary.text, colour.primary.background),
      }}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
        isHovered && colour.primary.text,
        isHovered && colour.primary.background,
      )}
    >
      {({ isActive }: { isActive: boolean }) => (
        <div key={note.id} className="flex w-full flex-col p-0.5">
          <p className="truncate font-normal">
            {note.title === "" ? "Untitled Note" : note.title}
          </p>

          <div className="flex items-center">
            <p
              className={cn(
                "pt-0.5 pr-1 text-xs text-slate-400",
                (isHovered || isActive) && colour.primary.text,
              )}
            >
              {getRelativeDateTitle(note.created, false)}
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
                    isHovered || isActive ? tag.colour.primary.text : undefined
                  }
                />
              ))}

            {note.tasks.length > 0 && (
              <TaskProgressCircle
                cancelled={
                  note.tasks.filter((task) => task.cancelledDate).length
                }
                completed={
                  note.tasks.filter((task) => task.completedDate).length
                }
                total={note.tasks.length}
                size={12}
                colour={colour}
              />
            )}

            {note.isBookmarked && (
              <Icon
                iconName="bookmark"
                className="ml-1 fill-red-400"
                weight="fill"
                size="xs"
              />
            )}
          </div>
        </div>
      )}
    </Link>
  );
};
