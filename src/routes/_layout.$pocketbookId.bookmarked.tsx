import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
} from "src/common/components/Dropdown/Dropdown";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useGetNote } from "src/notes/hooks/useGetNote";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useUpdatePocketbook } from "src/pocketbooks/hooks/useUpdatePocketbook";

export const Route = createFileRoute("/_layout/$pocketbookId/bookmarked")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    requireClientAuth(location);
  },
  validateSearch: (
    search: Record<string, unknown>,
  ): { noteId: string | null } => {
    return {
      noteId: typeof search.noteId === "string" ? search.noteId : null,
    };
  },
});

function RouteComponent() {
  const { pocketbookId } = Route.useParams();
  const { currentPocketbook } = useCurrentPocketbook();
  const { createNote } = useCreateNote();
  const navigate = useNavigate();
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const { notes } = useGetNotes({
    isBookmarked: true,
  });
  const { noteId } = Route.useSearch(); // TODO: use in loaders?
  const { note } = useGetNote({ noteId });
  const { updatePocketbook } = useUpdatePocketbook();

  const sortBy = currentPocketbook?.bookmarkedSortBy ?? "created";
  const sortDirection = currentPocketbook?.bookmarkedSortDirection ?? "desc";
  const groupBy = currentPocketbook?.bookmarkedGroupBy ?? null;

  const sortedNotes = useMemo(
    () => sortNotes(notes, sortBy, sortDirection),
    [notes, sortBy, sortDirection],
  );

  if (!currentPocketbook) {
    return null;
  }

  const onCreateNote = async () => {
    const newNote = await createNote({
      createNoteData: {
        title: "",
        content: createEmptyLexicalContent(),
        tags: [],
        isBookmarked: true,
        links: [],
      },
    });

    if (!newNote) {
      return;
    }

    navigate({
      to: "/$pocketbookId/bookmarked",
      params: {
        pocketbookId,
      },
      search: {
        noteId: newNote.id,
      },
    });
  };

  return (
    <div className="h-full w-full min-h-0 flex flex-col items-center overflow-hidden">
      <Toolbar
        iconName="bookmark"
        colour={colours.red}
        pocketbookColour={currentPocketbook?.colour}
        title={"Bookmarked"}
      >
        <>
          <DropdownMenu.Root onOpenChange={setIsSortDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                colour={colours.red}
                iconName="arrowsDownUp"
                active={isSortDropdownOpen}
              />
            </DropdownMenu.Trigger>

            <Dropdown className="w-40" sideOffset={2} align="start">
              <DropdownRadioGroup
                value={groupBy || "null"}
                onValueChange={(value) => {
                  if (
                    value === "null" ||
                    value === "created" ||
                    value === "tag"
                  ) {
                    updatePocketbook({
                      pocketbookId: currentPocketbook.id,
                      updatePocketbookData: {
                        ...currentPocketbook,
                        bookmarkedGroupBy: value === "null" ? null : value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Group by</DropdownLabel>

                <DropdownRadioItem colour={colours.red} value="null">
                  None
                </DropdownRadioItem>

                <DropdownRadioItem colour={colours.red} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem colour={colours.red} value="tag">
                  Tag
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={sortBy}
                onValueChange={(value) => {
                  if (value === "created" || value === "alphabetical") {
                    updatePocketbook({
                      pocketbookId: currentPocketbook.id,
                      updatePocketbookData: {
                        ...currentPocketbook,
                        bookmarkedSortBy: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort by</DropdownLabel>

                <DropdownRadioItem colour={colours.red} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem colour={colours.red} value="alphabetical">
                  Alphabetical
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={sortDirection}
                onValueChange={(value) => {
                  if (value === "asc" || value === "desc") {
                    updatePocketbook({
                      pocketbookId: currentPocketbook.id,
                      updatePocketbookData: {
                        ...currentPocketbook,
                        bookmarkedSortDirection: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort direction</DropdownLabel>

                <DropdownRadioItem colour={colours.red} value="asc">
                  Ascending
                </DropdownRadioItem>

                <DropdownRadioItem colour={colours.red} value="desc">
                  Descending
                </DropdownRadioItem>
              </DropdownRadioGroup>
            </Dropdown>
          </DropdownMenu.Root>
          <Button
            variant="ghost"
            size="sm"
            colour={colours.red}
            iconName="plus"
            onClick={onCreateNote}
          />
        </>
      </Toolbar>

      <NotesLayout
        title="Bookmarked"
        colour={colours.red}
        notes={sortedNotes}
        prefillNewNoteData={{ isBookmarked: true }}
        selectedNote={note || null}
        description={null}
        groupNotesBy={groupBy ?? undefined}
        groupSortDirection={sortDirection}
        onCreateNote={onCreateNote}
      />
    </div>
  );
}
