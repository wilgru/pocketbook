import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
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
  showTaskColumn?: boolean;
  showLinksColumn?: boolean;
};

export const NoteTableItem = ({
  note,
  colour = colours.orange,
  to,
  tagGroupIds,
  showTaskColumn = false,
  showLinksColumn = false,
}: NoteTableItemProps) => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "border-b border-slate-300 text-sm transition-colors",
        isHovered && colour.primary.background,
      )}
    >
      <td
        className={cn(
          "align-top border-r border-slate-100 px-3 py-0.5",
          isHovered && colour.primary.text,
        )}
      >
        <Link
          to={to ?? location.pathname}
          search={(old) => ({ ...old, noteId: note.id })}
          className="flex items-center gap-1 w-full focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
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
        </Link>
      </td>

      {tagGroupIds.map((tagGroupId) => (
        <td
          key={tagGroupId}
          className="align-top border-r border-slate-100 px-3 py-1"
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

      {showTaskColumn && (
        <td className="align-top border-r border-slate-100 px-3 py-1">
          {note.tasks.length > 0 && (
            <TaskProgressBar
              cancelled={note.tasks.filter((task) => task.cancelledDate).length}
              completed={note.tasks.filter((task) => task.completedDate).length}
              total={note.tasks.length}
              colour={colour}
              fullWidth
            />
          )}
        </td>
      )}

      {showLinksColumn && (
        <td className="align-top border-r border-slate-100 px-3 py-1">
          <div className="flex gap-1 items-center flex-wrap">
            {note.links.map((link) => (
              <LinkPill key={link.id} link={link} colour={colour} />
            ))}
          </div>
        </td>
      )}

      <td
        className={cn(
          "align-top px-3 py-1 text-xs text-slate-400 text-right whitespace-nowrap",
          isHovered && colour.primary.text,
        )}
      >
        {getRelativeDateTitle(note.created, false)}
      </td>
    </tr>
  );
};
