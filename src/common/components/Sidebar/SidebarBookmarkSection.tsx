import { colours } from "src/colours/colours.constant";
import { NavItem } from "src/common/components/NavItem/NavItem";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";

export const SidebarBookmarkSection = () => {
  const { pocketbookId } = useCurrentPocketbookId();
  const { notes } = useGetNotes({ isBookmarked: true });

  if (!pocketbookId || notes.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-px">
      <h1 className="font-title text-slate-400 text-md">Bookmarks</h1>

      {notes.map((note) => (
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
