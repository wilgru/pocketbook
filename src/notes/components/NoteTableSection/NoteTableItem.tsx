import { useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { Icon } from "src/icons/components/Icon/Icon";
import { TaskProgressBar } from "src/tasks/components/TaskProgressBar/TaskProgressBar";
import { TagPill } from "../../../tags/components/TagPill/TagPill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteTableItemProps = {
  note: Note;
  colour?: Colour;
  to?: string;
  tagGroupIds: (string | null)[];
};

export const NoteTableItem = ({
  note,
  colour = colours.orange,
  to,
  tagGroupIds,
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
        "cursor-pointer border-b border-slate-300 text-sm transition-colors outline-hidden focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-inset",
        isHovered && colour.primary.background,
      )}
    >
      <td
        className={cn(
          "align-top border-r border-slate-100 px-3 pt-1.5 pb-1",
          isHovered && colour.primary.text,
        )}
      >
        <div className="flex items-center gap-1">
          <p className="truncate font-normal">
            {note.title === "" ? "Untitled Note" : note.title}
          </p>

          {note.isBookmarked && (
            <Icon
              iconName="bookmark"
              className="shrink-0 fill-red-400"
              weight="fill"
              size="xs"
            />
          )}
        </div>
      </td>

      {tagGroupIds.map((tagGroupId) => (
        <td
          key={tagGroupId}
          className="align-top border-r border-slate-100 px-3 pt-1.5"
        >
          <div className="flex gap-1 items-center flex-wrap">
            {note.tags
              .filter((tag) => tag.tagGroupId === tagGroupId)
              .map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  size="xs"
                  closable={false}
                  collapsed={false}
                  iconClassName={
                    isHovered ? tag.colour.primary.text : undefined
                  }
                />
              ))}
          </div>
        </td>
      ))}

      <td className="align-top border-r border-slate-100 px-3 pt-2">
        {note.tasks.length > 0 && (
          <TaskProgressBar
            cancelled={note.tasks.filter((task) => task.cancelledDate).length}
            completed={note.tasks.filter((task) => task.completedDate).length}
            total={note.tasks.length}
            showInfoPopover={false}
            colour={colour}
            className="w-full"
          />
        )}
      </td>

      <td
        className={cn(
          "align-top px-3 pt-2 text-xs text-slate-400 text-right whitespace-nowrap",
          isHovered && colour.primary.text,
        )}
      >
        {getRelativeDateTitle(note.created, false)}
      </td>
    </tr>
  );
};
