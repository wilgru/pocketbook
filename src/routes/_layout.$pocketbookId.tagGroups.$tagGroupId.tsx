import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownLabel,
  DropdownRadioGroup,
  DropdownRadioItem,
} from "src/common/components/Dropdown/Dropdown";
import { Toolbar } from "src/common/components/Toolbar/Toolbar";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { sortNotes } from "src/common/utils/sortNotes";
import { NotesLayout } from "src/notes/components/NotesLayout/NotesLayout";
import { getNoteServerFn } from "src/notes/serverFunctions/getNote";
import { getNotesServerFn } from "src/notes/serverFunctions/getNotes";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { EditTagGroupModal } from "src/tags/components/EditTagGroupModal/EditTagGroupModal";
import { useUpdateTagGroup } from "src/tags/hooks/useUpdateTagGroup";
import { getTagGroupsServerFn } from "src/tags/serverFunctions/getTagGroups";

export const Route = createFileRoute(
  "/_layout/$pocketbookId/tagGroups/$tagGroupId",
)({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { noteId: string | null } => {
    return {
      noteId: typeof search.noteId === "string" ? search.noteId : null,
    };
  },
});

function RouteComponent() {
  const { pocketbookId, tagGroupId } = Route.useParams();
  const { noteId } = Route.useSearch();
  const { currentPocketbook } = useCurrentPocketbook();
  const { updateTagGroup } = useUpdateTagGroup();

  const { data: tagGroupsData } = useServerQuery(getTagGroupsServerFn, {
    pocketbookId,
  });
  const tagGroup = tagGroupsData?.tagGroups.find(
    (group) => group.id === tagGroupId,
  );

  const tagIds = useMemo(
    () => tagGroup?.tags.map((tag) => tag.id) ?? [],
    [tagGroup],
  );

  const { data: notesData } = useServerQuery(
    getNotesServerFn,
    { pocketbookId, tagIds },
    { enabled: !!tagGroup },
  );
  const { data: note } = useServerQuery(
    getNoteServerFn,
    { noteId: noteId ?? "" },
    { enabled: !!noteId },
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortBy = tagGroup?.sortBy ?? "created";
  const sortDirection = tagGroup?.sortDirection ?? "desc";

  const sortedNotes = useMemo(
    () => sortNotes(notesData?.notes ?? [], sortBy, sortDirection),
    [notesData, sortBy, sortDirection],
  );

  if (!tagGroup || !currentPocketbook) {
    return null;
  }

  const colour = currentPocketbook.colour;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center overflow-hidden">
      <Toolbar title={tagGroup.title} colour={colour} pocketbookColour={colour}>
        <>
          <div>
            <Dialog.Root
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
            >
              <Dialog.Trigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  colour={colour}
                  iconName="slidersHorizontal"
                />
              </Dialog.Trigger>

              <EditTagGroupModal tagGroup={tagGroup} />
            </Dialog.Root>
          </div>

          <DropdownMenu.Root onOpenChange={setIsSortDropdownOpen}>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="ghost"
                size="sm"
                colour={colour}
                iconName="arrowsDownUp"
                active={isSortDropdownOpen}
              />
            </DropdownMenu.Trigger>

            <Dropdown className="w-40" sideOffset={2} align="start">
              <DropdownRadioGroup
                value={tagGroup.groupBy || "null"}
                onValueChange={(value) => {
                  if (
                    value === "null" ||
                    value === "created" ||
                    value === "tag"
                  ) {
                    updateTagGroup({
                      tagGroupId: tagGroup.id,
                      updateTagGroupData: {
                        groupBy: value === "null" ? null : value,
                      },
                    });
                  }
                }}
              >
                <DropdownLabel>Group by</DropdownLabel>

                <DropdownRadioItem colour={colour} value="null">
                  None
                </DropdownRadioItem>

                <DropdownRadioItem colour={colour} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem colour={colour} value="tag">
                  Tag
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={tagGroup.sortBy}
                onValueChange={(value) => {
                  if (value === "created" || value === "alphabetical") {
                    updateTagGroup({
                      tagGroupId: tagGroup.id,
                      updateTagGroupData: { sortBy: value },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort by</DropdownLabel>

                <DropdownRadioItem colour={colour} value="created">
                  Created
                </DropdownRadioItem>

                <DropdownRadioItem colour={colour} value="alphabetical">
                  Alphabetical
                </DropdownRadioItem>
              </DropdownRadioGroup>

              <DropdownRadioGroup
                value={tagGroup.sortDirection}
                onValueChange={(value) => {
                  if (value === "asc" || value === "desc") {
                    updateTagGroup({
                      tagGroupId: tagGroup.id,
                      updateTagGroupData: { sortDirection: value },
                    });
                  }
                }}
              >
                <DropdownLabel>Sort direction</DropdownLabel>

                <DropdownRadioItem colour={colour} value="asc">
                  Ascending
                </DropdownRadioItem>

                <DropdownRadioItem colour={colour} value="desc">
                  Descending
                </DropdownRadioItem>
              </DropdownRadioGroup>
            </Dropdown>
          </DropdownMenu.Root>
        </>
      </Toolbar>

      <NotesLayout
        title={tagGroup.title}
        description={null}
        layout={tagGroup.layout ?? "list"}
        colour={colour}
        notes={sortedNotes}
        selectedNote={note || null}
        groupNotesBy={
          tagGroup.groupBy === "tag"
            ? "tagGroup"
            : (tagGroup.groupBy ?? undefined)
        }
        groupByTagGroupId={tagGroup.id}
        groupSortDirection={sortDirection}
      />
    </div>
  );
}
