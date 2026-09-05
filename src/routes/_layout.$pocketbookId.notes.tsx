import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
} from "src/common/components/Dropdown/Dropdown";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { useUpdatePocketbook } from "src/pocketbooks/hooks/useUpdatePocketbook";
import { getTagGroupsServerFn } from "src/tags/serverFunctions/getTagGroups";

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
  const { updatePocketbook } = useUpdatePocketbook();
  const { createNote } = useCreateNote();
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const { data: tagGroupsData } = useServerQuery(getTagGroupsServerFn, {
    pocketbookId,
  });
  const { noteId } = Route.useSearch(); // TODO: use in loaders?

  const { data: notesData } = useServerQuery(getNotesServerFn, {
    pocketbookId,
  });
  const { data: note } = useServerQuery(
    getNoteServerFn,
    { noteId: noteId ?? "" },
    { enabled: !!noteId },
  );

  const navigate = useNavigate();

  const sortBy = currentPocketbook?.notesSortBy ?? "created";
  const sortDirection = currentPocketbook?.notesSortDirection ?? "desc";
  const groupBy = currentPocketbook?.notesGroupBy ?? null;

  const sortedNotes = useMemo(
    () => sortNotes(notesData?.notes ?? [], sortBy, sortDirection),
    [notesData, sortBy, sortDirection],
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
          <DropdownMenu.Root onOpenChange={setIsSortDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                colour={currentPocketbook?.colour}
                iconName="arrowsDownUp"
                active={isSortDropdownOpen}
              />
            </DropdownMenu.Trigger>

            <Dropdown className="w-40" sideOffset={2} align="start">
              <DropdownRadioGroup
                value={
                  groupBy === "tagGroup"
                    ? `tagGroup:${currentPocketbook.notesGroupByTagGroupId}`
                    : groupBy || "null"
                }
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
                        notesGroupByTagGroupId: null,
                      },
                    });
                  } else if (value.startsWith("tagGroup:")) {
                    const tagGroupId = value.slice("tagGroup:".length);
                    updatePocketbook({
                      pocketbookId: currentPocketbook.id,
                      updatePocketbookData: {
                        ...currentPocketbook,
                        notesGroupBy: "tagGroup",
                        notesGroupByTagGroupId: tagGroupId,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Group by</DropdownLabel>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="null"
                >
                  None
                </DropdownRadioItem>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="created"
                >
                  Created
                </DropdownRadioItem>

                <DropdownSub>
                  <DropdownSubTrigger
                    colour={currentPocketbook?.colour}
                    subText={
                      groupBy === "tagGroup"
                        ? tagGroupsData?.tagGroups.find(
                            (tagGroup) =>
                              tagGroup.id ===
                              currentPocketbook.notesGroupByTagGroupId,
                          )?.title
                        : undefined
                    }
                  >
                    Tag Group
                  </DropdownSubTrigger>
                  <DropdownSubContent className="w-40">
                    {tagGroupsData?.tagGroups.map((tagGroup) => (
                      <DropdownRadioItem
                        key={tagGroup.id}
                        colour={currentPocketbook?.colour}
                        value={`tagGroup:${tagGroup.id}`}
                      >
                        {tagGroup.title}
                      </DropdownRadioItem>
                    ))}
                    {tagGroupsData?.tagGroups.length === 0 && (
                      <span className="text-xs text-slate-400 px-2 py-1">
                        No tag groups
                      </span>
                    )}
                  </DropdownSubContent>
                </DropdownSub>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="tag"
                >
                  All Tags
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
                        notesSortBy: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort by</DropdownLabel>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="created"
                >
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="alphabetical"
                >
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
                        notesSortDirection: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort direction</DropdownLabel>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="asc"
                >
                  Ascending
                </DropdownRadioItem>

                <DropdownRadioItem
                  colour={currentPocketbook?.colour}
                  value="desc"
                >
                  Descending
                </DropdownRadioItem>
              </DropdownRadioGroup>
            </Dropdown>
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
        groupByTagGroupId={currentPocketbook.notesGroupByTagGroupId ?? null}
        groupSortDirection={sortDirection}
        onCreateNote={onCreateNote}
      />
    </div>
  );
}
