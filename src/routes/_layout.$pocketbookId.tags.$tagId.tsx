import { Check } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import Delta from "quill-delta";
import { useMemo, useState } from "react";
import requireClientAuth from "src/Users/utils/requireClientAuth";
import { Button } from "src/common/components/Button/Button";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { cn } from "src/common/utils/cn";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useGetNote } from "src/notes/hooks/useGetNote";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { EditTagModal } from "src/tags/components/EditTagModal/EditTagModal";
import { useGetTag } from "src/tags/hooks/useGetTag";
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
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);

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
        content: new Delta(),
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  colour={tag.colour}
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
                  value={tag.groupBy || "null"}
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
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                  <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
                    Sort by
                  </DropdownMenu.Label>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                  <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
                    Sort direction
                  </DropdownMenu.Label>

                  <DropdownMenu.RadioItem
                    className={cn(
                      "leading-none text-sm p-2 flex justify-between items-center outline-none rounded-xl cursor-pointer transition-colors",
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
                      `data-[highlighted]:${tag.colour.backgroundPill}`,
                      `data-[highlighted]:${tag.colour.textPill}`,
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
            colour={tag.colour}
            iconName="plus"
            onClick={onCreateNote}
          />
        </>
      </Toolbar>

      <NotesLayout
        title={tag.name}
        description={tag.description}
        links={tag.links}
        colour={tag.colour}
        notes={sortedNotes}
        selectedNote={note || null}
        prefillNewNoteData={{ tags: [tag] }}
        groupNotesBy={tag.groupBy ?? undefined}
        groupSortDirection={sortDirection}
        onCreateNote={onCreateNote}
      />
    </div>
  );
}
