import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { noteEditorStateAtom } from "src/common/atoms/noteEditorStateAtom";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { FloatingToolbar } from "src/common/components/FloatingToolbar/FloatingToolbar";
import { FormattingToolbar } from "src/common/components/FormattingToolbar/FormattingToolbar";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { ListSection } from "src/common/components/ListSection/ListSection";
import { TwoPaneLayout } from "src/common/components/TwoPaneLayout/TwoPaneLayout";
import NoteEditor from "src/notes/components/NoteEditor/NoteEditor";
import { groupNotes } from "src/notes/utils/groupNotes";
import { isNoteContentEmpty } from "src/notes/utils/isNoteContentEmpty";
import { TaskFloatingToolbar } from "src/tasks/components/TaskFloatingToolbar/TaskFloatingToolbar";
import { NoteListItem } from "../NoteListItem/NoteListItem";
import { StickyNoteListItem } from "../NoteListItem/StickyNoteListItem";
import type { Colour } from "src/colours/Colour.type";
import type { Note, NotesGroup } from "src/notes/Note.type";
import type { TagLink } from "src/tags/Tag.type";

type NotesLayoutProps = {
  title: string;
  colour?: Colour;
  notes: Note[];
  selectedNote: Note | null;
  description: string | null;
  links?: TagLink[];
  prefillNewNoteData?: Partial<Note>;
  groupNotesBy?: "created" | "tag";
  groupSortDirection?: "asc" | "desc";
  onCreateNote?: () => void;
};

export const NotesLayout = ({
  title,
  colour = colours.orange,
  notes,
  selectedNote,
  description,
  links,
  prefillNewNoteData,
  groupNotesBy,
  groupSortDirection = "desc",
  onCreateNote,
}: NotesLayoutProps) => {
  const {
    isEditorFocused,
    editor,
    toolbarFormatting,
    colour: editorColour,
    onLinkPopoverOpenChange,
  } = useAtomValue(noteEditorStateAtom);
  const { isTaskFocused } = useAtomValue(taskEditorStateAtom);

  const activeToolbarContent = isTaskFocused ? (
    <TaskFloatingToolbar />
  ) : isEditorFocused ? (
    <FormattingToolbar
      toolbarFormatting={toolbarFormatting}
      editor={editor}
      colour={editorColour ?? colour}
      isEditorFocused={isEditorFocused}
      onLinkPopoverOpenChange={onLinkPopoverOpenChange ?? undefined}
    />
  ) : null;

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

    return groupNotes(
      notes,
      groupNotesBy,
      title,
      prefillNewNoteData ?? {},
      groupSortDirection,
    );
  }, [notes, groupNotesBy, title, prefillNewNoteData, groupSortDirection]);

  return (
    <TwoPaneLayout
      sidebarTopContent={
        (description || (links && links.length > 0)) && (
          <div className="bg-slate-50 p-4 rounded-xl flex flex-col gap-2">
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
      floatingToolbar={
        <FloatingToolbar visible={isTaskFocused || isEditorFocused}>
          {activeToolbarContent}
        </FloatingToolbar>
      }
      content={
        <>
          {selectedNote ? (
            <NoteEditor
              key={selectedNote.id}
              note={selectedNote}
              colour={colour}
            />
          ) : (
            <div className="h-full w-full flex flex-col justify-center items-center text-center">
              <h1 className="text-gray-400 text-lg">No note selected</h1>
            </div>
          )}
        </>
      }
    />
  );
};
