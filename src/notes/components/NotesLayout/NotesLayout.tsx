import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { colours } from "src/colours/colours.constant";
import { quillEditorStateAtom } from "src/common/atoms/quillEditorStateAtom";
import { taskEditorStateAtom } from "src/common/atoms/taskEditorStateAtom";
import { EmptyState } from "src/common/components/EmptyState/EmptyState";
import { FloatingToolbar } from "src/common/components/FloatingToolbar/FloatingToolbar";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { QuillFormattingToolbar } from "src/common/components/QuillFormattingToolbar/QuillFormattingToolbar";
import NoteEditor from "src/notes/components/NoteEditor/NoteEditor";
import { groupNotes } from "src/notes/utils/groupNotes";
import { TaskFloatingToolbar } from "src/tasks/components/TaskFloatingToolbar/TaskFloatingToolbar";
import { NotesList } from "../NotesList/NotesList";
import type { Colour } from "src/colours/Colour.type";
import type { Note, NotesGroup } from "src/notes/Note.type";
import type { TagLink } from "src/tags/Tag.type";

type NotesLayoutProps = {
  title: string;
  colour?: Colour;
  notes: Note[];
  selectedNote: Note | null;
  showNoteCreateTimeOnly?: boolean;
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
  showNoteCreateTimeOnly = false,
  description,
  links,
  prefillNewNoteData,
  groupNotesBy,
  groupSortDirection = "desc",
  onCreateNote,
}: NotesLayoutProps) => {
  const {
    isQuillFocused,
    toolbarFormatting,
    colour: quillColour,
  } = useAtomValue(quillEditorStateAtom);
  const { isTaskFocused } = useAtomValue(taskEditorStateAtom);

  const noteGroups = useMemo<NotesGroup[]>(() => {
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
    <div className="flex-1 min-h-0 w-full min-w-0 flex overflow-hidden">
      <div className="h-full w-64 px-3 flex flex-col gap-5 overflow-y-scroll border-dashed border-r border-slate-200">
        {(description || (links && links.length > 0)) && (
          <div className="bg-slate-50 p-4 rounded-xl flex flex-col gap-2">
            {description && (
              <p className="text-sm text-slate-500">{description}</p>
            )}

            {links &&
              links.map((link, index) => (
                <LinkPill key={index} link={link} colour={colour} />
              ))}
          </div>
        )}

        <div className="h-full flex flex-col gap-3 pt-3 pb-6">
          {noteGroups.map((noteGroup) => (
            <NotesList
              key={noteGroup.title ?? "no-title"}
              noteGroup={noteGroup}
              colour={colour}
              createdDateFormat={
                showNoteCreateTimeOnly || groupNotesBy === "created"
                  ? "h:mm a"
                  : undefined
              }
            />
          ))}

          {noteGroups.length === 0 && (
            <EmptyState text="No notes yet" onAdd={onCreateNote} />
          )}
        </div>
      </div>

      <div className="h-full flex-1 relative flex flex-col min-w-0">
        <div className="flex-1 min-h-0 overflow-y-scroll flex justify-center">
          {selectedNote ? (
            <NoteEditor note={selectedNote} colour={colour} />
          ) : (
            <div className="h-full w-full flex flex-col justify-center items-center text-center">
              <h1 className="text-gray-400 text-lg">No note selected</h1>
            </div>
          )}
        </div>

        {/* isTaskFocused and isQuillFocused are mutually exclusive so each toolbar is
            positioned at the same absolute location and only one is ever shown at a time. */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10">
          <FloatingToolbar visible={isTaskFocused}>
            <TaskFloatingToolbar />
          </FloatingToolbar>
        </div>
        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10">
          <FloatingToolbar visible={isQuillFocused}>
            <QuillFormattingToolbar
              toolbarId="toolbar"
              toolbarFormatting={toolbarFormatting}
              colour={quillColour ?? colour}
            />
          </FloatingToolbar>
        </div>
      </div>
    </div>
  );
};
