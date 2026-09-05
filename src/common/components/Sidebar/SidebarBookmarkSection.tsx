import { colours } from "src/colours/colours.constant";
import { NavItem } from "src/common/components/NavItem/NavItem";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";

export const SidebarBookmarkSection = () => {
  const { pocketbookId } = useCurrentPocketbookId();
  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
    isBookmarked: true,
  });

  if (!pocketbookId || notesData?.notes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-px py-2 border-t border-b border-slate-200">
      <h1 className="font-title text-slate-400 text-sm">Bookmarks</h1>

      {notesData?.notes.map((note) => (
        <NavItem
          key={note.id}
          size="sm"
          iconName="bookmark"
          colour={colours.red}
          title={note.title || "Untitled Note"}
          to="/$pocketbookId/bookmarked"
          params={{ pocketbookId }}
          search={{ noteId: note.id }}
          activeOptions={{ exact: true, includeSearch: true }}
        />
      ))}
    </section>
  );
};
