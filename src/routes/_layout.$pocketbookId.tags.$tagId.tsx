import * as Dialog from "@radix-ui/react-dialog";
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
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useGetNote } from "src/notes/hooks/useGetNote";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { EditTagModal } from "src/tags/components/EditTagModal/EditTagModal";
import { useGetTag } from "src/tags/hooks/useGetTag";
import { useGetTagGroups } from "src/tags/hooks/useGetTagGroups";
import { useUpdateTag } from "src/tags/hooks/useUpdateTag";

export const Route = createFileRoute("/_layout/$pocketbookId/tags/$tagId")({
  component: TagComponent,
  // loader: ({ params }) => fetch(params.tagId),
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

export default function TagComponent() {
  const { pocketbookId, tagId } = Route.useParams();
  const { noteId } = Route.useSearch(); // TODO: use in loaders?
  const navigate = useNavigate();
  const { tag, notes } = useGetTag(tagId ?? "");
  const { note } = useGetNote({ noteId });
  const { createNote } = useCreateNote();
  const { updateTag } = useUpdateTag();
  const { currentPocketbook } = useCurrentPocketbook();
  const { tagGroups } = useGetTagGroups();
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortBy = tag?.sortBy ?? "created";
  const sortDirection = tag?.sortDirection ?? "desc";

  const sortedNotes = useMemo(
    () => sortNotes(notes, sortBy, sortDirection),
    [notes, sortBy, sortDirection],
  );

  if (!tag) {
    return null;
  }

  const onCreateNote = async () => {
    const newNote = await createNote({
      createNoteData: {
        title: "",
        content: createEmptyLexicalContent(),
        tags: [tag],
        isBookmarked: false,
        links: [],
      },
    });

    if (!newNote) {
      return;
    }

    navigate({
      to: "/$pocketbookId/tags/$tagId",
      params: {
        pocketbookId,
        tagId,
      },
      search: {
        noteId: newNote.id,
      },
    });
  };

  const onDeleteTag = async () => {
    setIsEditTagModalOpen(false);

    navigate({
      to: "/$pocketbookId/notes",
      params: {
        pocketbookId,
      },
      search: {
        noteId: null,
      },
    });
  };

  return (
    <div className="h-full w-full min-h-0 flex flex-col items-center overflow-hidden">
      <Toolbar
        iconName={tag.icon}
        title={tag.name}
        colour={tag.colour}
        pocketbookColour={currentPocketbook?.colour}
      >
        <>
          <div>
            <Dialog.Root
              open={isEditTagModalOpen}
              onOpenChange={setIsEditTagModalOpen}
            >
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  colour={tag.colour}
                  iconName="slidersHorizontal"
                />
              </Dialog.Trigger>

              <EditTagModal tag={tag} onDeleted={onDeleteTag} />
            </Dialog.Root>
          </div>
          <DropdownMenu.Root onOpenChange={setIsSortDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                colour={tag.colour}
                iconName="arrowsDownUp"
                active={isSortDropdownOpen}
              />
            </DropdownMenu.Trigger>

            <Dropdown className="w-40" sideOffset={2} align="start">
              <DropdownRadioGroup
                value={
                  tag.groupBy === "tagGroup"
                    ? `tagGroup:${tag.groupByTagGroupId}`
                    : tag.groupBy || "null"
                }
                onValueChange={(value) => {
                  if (
                    value === "null" ||
                    value === "created" ||
                    value === "tag"
                  ) {
                    updateTag({
                      tagId: tag.id,
                      updateTagData: {
                        ...tag,
                        groupBy: value === "null" ? null : value,
                        groupByTagGroupId: null,
                      },
                    });
                  } else if (value.startsWith("tagGroup:")) {
                    const tagGroupId = value.slice("tagGroup:".length);
                    updateTag({
                      tagId: tag.id,
                      updateTagData: {
                        ...tag,
                        groupBy: "tagGroup",
                        groupByTagGroupId: tagGroupId,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Group by</DropdownLabel>

                <DropdownRadioItem colour={tag.colour} value="null">
                  None
                </DropdownRadioItem>

                <DropdownRadioItem colour={tag.colour} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownSub>
                  <DropdownSubTrigger
                    colour={tag.colour}
                    subText={
                      tag.groupBy === "tagGroup"
                        ? tagGroups.find(
                            (tg) => tg.id === tag.groupByTagGroupId,
                          )?.title
                        : undefined
                    }
                  >
                    Tag Group
                  </DropdownSubTrigger>
                  <DropdownSubContent className="w-40">
                    {tagGroups.map((tagGroup) => (
                      <DropdownRadioItem
                        key={tagGroup.id}
                        colour={tag.colour}
                        value={`tagGroup:${tagGroup.id}`}
                      >
                        {tagGroup.title}
                      </DropdownRadioItem>
                    ))}
                    {tagGroups.length === 0 && (
                      <span className="text-xs text-slate-400 px-2 py-1">
                        No tag groups
                      </span>
                    )}
                  </DropdownSubContent>
                </DropdownSub>

                <DropdownRadioItem colour={tag.colour} value="tag">
                  All Tags
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={tag.sortBy}
                onValueChange={(value) => {
                  if (value === "created" || value === "alphabetical") {
                    updateTag({
                      tagId: tag.id,
                      updateTagData: {
                        ...tag,
                        sortBy: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort by</DropdownLabel>

                <DropdownRadioItem colour={tag.colour} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem colour={tag.colour} value="alphabetical">
                  Alphabetical
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={tag.sortDirection}
                onValueChange={(value) => {
                  if (value === "asc" || value === "desc") {
                    updateTag({
                      tagId: tag.id,
                      updateTagData: {
                        ...tag,
                        sortDirection: value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort direction</DropdownLabel>

                <DropdownRadioItem colour={tag.colour} value="asc">
                  Ascending
                </DropdownRadioItem>

                <DropdownRadioItem colour={tag.colour} value="desc">
                  Descending
                </DropdownRadioItem>
              </DropdownRadioGroup>
            </Dropdown>
          </DropdownMenu.Root>
          <Button
            variant="ghost"
            size="sm"
            colour={tag.colour}
            iconName="plus"
            onClick={onCreateNote}
          />
        </>
      </Toolbar>

      <NotesLayout
        title={tag.name}
        description={tag.description}
        layout={tag.layout ?? "list"}
        links={tag.links}
        colour={tag.colour}
        notes={sortedNotes}
        selectedNote={note || null}
        prefillNewNoteData={{ tags: [tag] }}
        groupNotesBy={tag.groupBy ?? undefined}
        groupByTagGroupId={tag.groupByTagGroupId ?? null}
        groupSortDirection={sortDirection}
        onCreateNote={onCreateNote}
      />
    </div>
  );
}
