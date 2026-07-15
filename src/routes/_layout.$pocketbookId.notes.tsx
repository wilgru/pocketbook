import { Check } from "@phosphor-icons/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { cn } from "src/common/utils/cn";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useGetNote } from "src/notes/hooks/useGetNote";
import { useGetNotes } from "src/notes/hooks/useGetNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useUpdatePocketbook } from "src/pocketbooks/hooks/useUpdatePocketbook";

export const Route = createFileRoute("/_layout/$pocketbookId/notes")({
  component: NotesComponent,
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

function NotesComponent() {
  const { pocketbookId } = Route.useParams();
  const { currentPocketbook } = useCurrentPocketbook();
  const { createNote } = useCreateNote();
  const navigate = useNavigate();

  const { notes } = useGetNotes({
    createdDateString: undefined,
    isBookmarked: undefined,
  });
  const { noteId } = Route.useSearch(); // TODO: use in loaders?
  const { note } = useGetNote({ noteId });
  const { updatePocketbook } = useUpdatePocketbook();

  const sortBy = currentPocketbook?.notesSortBy ?? "created";
  const sortDirection = currentPocketbook?.notesSortDirection ?? "desc";
  const groupBy = currentPocketbook?.notesGroupBy ?? null;

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
        isBookmarked: false,
        links: [],
      },
    });

    if (!newNote) {
      return;
    }

    navigate({
      to: "/$pocketbookId/notes",
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
        iconName="pencil"
        title={"Notes"}
        colour={currentPocketbook?.colour}
      >
        <>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  colour={currentPocketbook?.colour}
                  iconName="arrowsDownUp"
                />
              </div>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2 w-40 drop-shadow"
                sideOffset={2}
                align="start"
              >
                <DropdownMenu.RadioGroup
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
                          notesGroupBy: value === "null" ? null : value,
                        },
                      });
                    }
                  }}
                >
                  <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
                    Group by
                  </DropdownMenu.Label>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="null"
                  >
                    None
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="created"
                  >
                    Created
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="tag"
                  >
                    Tag
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>

                <DropdownMenu.RadioGroup
                  value={sortBy}
                  onValueChange={(value) => {
                    if (value === "created" || value === "alphabetical") {
                      updatePocketbook({
                        pocketbookId: currentPocketbook.id,
                        updatePocketbookData: {
                          ...currentPocketbook,
                          notesSortBy: value,
                        },
                      });
                    }
                  }}
                >
                  <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
                    Sort by
                  </DropdownMenu.Label>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="created"
                  >
                    Created
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="alphabetical"
                  >
                    Alphabetical
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>

                <DropdownMenu.RadioGroup
                  value={sortDirection}
                  onValueChange={(value) => {
                    if (value === "asc" || value === "desc") {
                      updatePocketbook({
                        pocketbookId: currentPocketbook.id,
                        updatePocketbookData: {
                          ...currentPocketbook,
                          notesSortDirection: value,
                        },
                      });
                    }
                  }}
                >
                  <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
                    Sort direction
                  </DropdownMenu.Label>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="asc"
                  >
                    Ascending
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${currentPocketbook?.colour.backgroundPill}`,
                      `data-[highlighted]:${currentPocketbook?.colour.textPill}`,
                    )}
                    value="desc"
                  >
                    Descending
                    <DropdownMenu.ItemIndicator>
                      <Check />
                    </DropdownMenu.ItemIndicator>
                  </DropdownMenu.RadioItem>
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <Button
            variant="ghost"
            size="sm"
            colour={currentPocketbook?.colour}
            iconName="plus"
            onClick={onCreateNote}
          />
        </>
      </Toolbar>

      <NotesLayout
        title={"Notes"}
        notes={sortedNotes}
        colour={currentPocketbook?.colour}
        selectedNote={note || null}
        description={null}
        groupNotesBy={groupBy ?? undefined}
        groupSortDirection={sortDirection}
        onCreateNote={onCreateNote}
      />
    </div>
  );
}
