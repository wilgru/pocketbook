import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { BlankLayout } from "src/common/components/BlankLayout/BlankLayout";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { ListSection } from "src/common/components/ListSection/ListSection";
import { TwoPaneLayout } from "src/common/components/TwoPaneLayout/TwoPaneLayout";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import NoteEditor from "src/notes/components/NoteEditor/NoteEditor";
import { NoteEditorModal } from "src/notes/components/NoteEditorModal/NoteEditorModal";
import { NoteTableSection } from "src/notes/components/NoteTableSection/NoteTableSection";
import { groupNotes } from "src/notes/utils/groupNotes";
import { isNoteContentEmpty } from "src/notes/utils/isNoteContentEmpty";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { getTagGroupsServerFn } from "src/tags/serverFunctions/getTagGroups";
import { NoteListItem } from "../NoteListItem/NoteListItem";
import { StickyNoteListItem } from "../NoteListItem/StickyNoteListItem";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Note, NotesGroup } from "src/notes/notes.schema";
import type { TagGroup } from "src/tags/tags.schema";

type StickyNotesGridProps = {
  notes: Note[];
  colour: Colour;
};

const StickyNotesGrid = ({ notes, colour }: StickyNotesGridProps) => {
  const stickyNotes = notes.filter((note) => {
    const hasNoTitle = !note.title || note.title.trim() === "";
    const hasContent = !isNoteContentEmpty(note.content);
    return hasNoTitle && hasContent;
  });

  if (stickyNotes.length === 0) {
    return;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 pb-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {stickyNotes.map((note) => (
        <StickyNoteListItem key={note.id} note={note} colour={colour} />
      ))}
    </div>
  );
};

type NotesLayoutProps = {
  title: string;
  colour?: Colour;
  layout?: "list" | "table";
  notes: Note[];
  selectedNote: Note | null;
  description: string | null;
  links?: Link[];
  prefillNewNoteData?: Partial<Note>;
  groupNotesBy?: "created" | "tag" | "tagGroup";
  groupByTagGroupId?: string | null;
  groupSortDirection?: "asc" | "desc";
  onCreateNote?: () => void;
};

export const NotesLayout = ({
  title,
  colour = colours.orange,
  layout = "list",
  notes,
  selectedNote,
  description,
  links,
  prefillNewNoteData,
  groupNotesBy,
  groupByTagGroupId,
  groupSortDirection = "desc",
  onCreateNote,
}: NotesLayoutProps) => {
  const { pocketbookId } = useCurrentPocketbookId();

  const { data: tagGroupsData } = useServerQuery(getTagGroupsServerFn, {
    pocketbookId,
  });

  const effectiveNoteGroups = useMemo<NotesGroup[]>(() => {
    if (!notes || notes.length === 0) {
      return [];
    }

    if (!groupNotesBy) {
      return [
        {
          title: null,
          notes: notes,
          relevantNoteData: prefillNewNoteData ?? {},
        },
      ];
    }

    if (groupNotesBy === "tagGroup") {
      const tagGroup = tagGroupsData?.tagGroups.find(
        (tagGroup) => tagGroup.id === groupByTagGroupId,
      );

      return groupNotes(
        notes,
        "tag",
        title,
        prefillNewNoteData ?? {},
        groupSortDirection,
        tagGroup?.tags,
      );
    }

    return groupNotes(
      notes,
      groupNotesBy,
      title,
      prefillNewNoteData ?? {},
      groupSortDirection,
    );
  }, [
    notes,
    groupNotesBy,
    title,
    prefillNewNoteData,
    groupSortDirection,
    tagGroupsData,
    groupByTagGroupId,
  ]);

  // TODO: move the different layouts into their own components to reduce complexity and handle layout specific logic like this in their own components
  const tableTagGroups = useMemo<TagGroup[]>(() => {
    const tagGroupIds = new Set(
      notes.flatMap((note) =>
        note.tags
          .map((tag) => tag.tagGroupId)
          .filter((tagGroupId): tagGroupId is string => tagGroupId !== null),
      ),
    );

    return tagGroupsData
      ? tagGroupsData?.tagGroups.filter((tagGroup) =>
          tagGroupIds.has(tagGroup.id),
        )
      : [];
  }, [notes, tagGroupsData]);
  const showTaskColumn = useMemo(
    () => notes.some((note) => note.tasks.length > 0),
    [notes],
  );
  const showLinksColumn = useMemo(
    () => notes.some((note) => note.links.length > 0),
    [notes],
  );

  switch (layout) {
    case "list":
      return (
        <TwoPaneLayout
          sidebarTopContent={
            (description || (links && links.length > 0)) && (
              <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                {description && (
                  <p className="text-sm text-slate-500">{description}</p>
                )}

                {links &&
                  links.map((link, index) => (
                    <LinkPill key={index} link={link} colour={colour} />
                  ))}
              </div>
            )
          }
          sidebar={
            <>
              {effectiveNoteGroups.map((noteGroup) => (
                <ListSection
                  title={noteGroup.title}
                  key={noteGroup.title ?? "no-title"}
                >
                  {noteGroup.notes.map((note) => {
                    const hasNoTitle = !note.title || note.title.trim() === "";
                    const hasContent = !isNoteContentEmpty(note.content);

                    if (hasNoTitle && hasContent) {
                      return (
                        <StickyNoteListItem
                          key={note.id}
                          note={note}
                          colour={colour}
                        />
                      );
                    }

                    return (
                      <NoteListItem key={note.id} note={note} colour={colour} />
                    );
                  })}
                </ListSection>
              ))}

              {effectiveNoteGroups.length === 0 && (
                <EmptyState text="No notes yet" onAdd={onCreateNote} />
              )}
            </>
          }
          content={
            <div className="relative min-h-0 flex-1">
              <section className="flex h-full min-h-0 justify-center overflow-y-scroll px-8 pt-8">
                {selectedNote ? (
                  <NoteEditor
                    key={selectedNote.id}
                    note={selectedNote}
                    colour={colour}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-center">
                    <h1 className="text-lg text-gray-400">No note selected</h1>
                  </div>
                )}
              </section>
            </div>
          }
        />
      );
    case "table":
      return (
        <BlankLayout
          description={
            (description || (links && links.length > 0)) && (
              <>
                {description && (
                  <p className="text-sm text-slate-500">{description}</p>
                )}

                <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
                  {links &&
                    links.map((link, index) => (
                      <LinkPill key={index} link={link} colour={colour} />
                    ))}
                </div>
              </>
            )
          }
          content={
            <div className="flex flex-col gap-2">
              {effectiveNoteGroups.map((noteGroup) => (
                <NoteTableSection
                  title={noteGroup.title}
                  key={noteGroup.title ?? "no-title"}
                  topSection={
                    <StickyNotesGrid notes={noteGroup.notes} colour={colour} />
                  }
                  columns={[
                    { key: "title", label: "Title" },
                    { key: "tags", label: "Tags", tagGroupId: null },
                    ...tableTagGroups.map((tagGroup) => ({
                      key: tagGroup.id,
                      label: tagGroup.title,
                      tagGroupId: tagGroup.id,
                    })),
                    ...(showTaskColumn
                      ? [{ key: "tasks", label: "Tasks" }]
                      : []),
                    ...(showLinksColumn
                      ? [{ key: "links", label: "Links" }]
                      : []),
                    {
                      key: "created",
                      label: "Created",
                      className: "text-right",
                    },
                  ]}
                  notes={noteGroup.notes}
                  colour={colour}
                />
              ))}

              {selectedNote && (
                <NoteEditorModal
                  key={selectedNote.id}
                  note={selectedNote}
                  colour={colour}
                />
              )}
            </div>
          }
        />
      );
  }
};
