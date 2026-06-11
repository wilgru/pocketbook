import { Bookmark } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { TagPill } from "src/tags/components/TagPill/TagPill";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import type { Note } from "src/notes/Note.type";

type NoteLinkProps = {
  note: Pick<Note, "id" | "title" | "tags" | "isBookmarked">;
};

export const NoteLink = ({ note }: NoteLinkProps) => {
  const navigate = useNavigate();
  const { pocketbookId } = useCurrentPocketbook();

  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        navigate({
          to: `/${pocketbookId ?? ""}/notes`,
          search: { noteId: note.id },
        });
      }}
      className="flex items-center gap-1.5 px-2 py-1 text-xs rounded border border-slate-200 shadow-sm bg-white text-slate-600 transition-colors hover:bg-slate-50"
    >
      <span>{note.title ?? "Untitled Note"}</span>

      {note.tags.map((tag) => (
        <TagPill
          key={tag.id}
          tag={tag}
          size="xs"
          variant="ghost"
          closable={false}
          collapsed={true}
        />
      ))}

      {note.isBookmarked && (
        <Bookmark className="fill-red-400 shrink-0" weight="fill" size={12} />
      )}
    </button>
  );
};
