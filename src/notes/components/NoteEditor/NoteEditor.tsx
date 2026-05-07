import * as Dialog from "@radix-ui/react-dialog";
import { useLocation, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import debounce from "debounce";
import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { quillEditorStateAtom } from "src/common/atoms/quillEditorStateAtom";
import { Button } from "src/common/components/Button/Button";
import { NoteLinkPill } from "src/common/components/NoteLinkPill/NoteLinkPill";
import { QuillEditor } from "src/common/components/QuillEditor/QuillEditor";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { NoteLinksModal } from "src/notes/components/NoteLinksModal/NoteLinksModal";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useDeleteNote } from "src/notes/hooks/useDeleteNote";
import { useUpdateNote } from "src/notes/hooks/useUpdateNote";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { useGetUpdates } from "src/updates/hooks/useGetUpdates";
import { TagMultiSelect } from "../../../tags/components/TagMultiSelect/TagMultiSelect";
import { TaskEditor } from "../../../tasks/components/TaskEditor/TaskEditor";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";
import type { Note } from "src/notes/Note.type";

type NoteEditorProps = {
  note: Note;
  colour?: Colour;
  onSave?: () => void;
};

const QUILL_TOOLBAR_ID = "toolbar";

const NoteEditor = ({
  note,
  colour = colours.orange,
  onSave,
}: NoteEditorProps) => {
  const { createNote } = useCreateNote();
  const { createTask } = useCreateTask();
  const { updateNote } = useUpdateNote();
  const { deleteNote } = useDeleteNote();
  const { updates } = useGetUpdates({ noteId: note.id });

  const location = useLocation();
  const navigate = useNavigate();

  const setQuillEditorState = useSetAtom(quillEditorStateAtom);

  const [editedNote, setEditedNote] = useState<Note>(note); // TODO: maybe use key prop when using NoteEditor to force reset instead of having to manage this state and useEffects to reset when the note prop changes.
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [linksModalKey, setLinksModalKey] = useState(0);

  const newUpdateRef = useRef<HTMLDivElement>(null);
  const titleRef = useAutoResize(editedNote.title);

  // Ref that always points to the latest save implementation so the debounced
  // function never closes over stale state.
  const saveRef = useRef<() => void>();
  saveRef.current = () => {
    if (editedNote.id) {
      updateNote({ noteId: editedNote.id, updateNoteData: editedNote });
    } else {
      createNote({ createNoteData: editedNote });
    }
    onSave?.();
  };

  // Stable debounced save – created once and reused across renders.
  const debouncedSave = useRef(
    debounce(() => saveRef.current?.(), 500),
  ).current;

  // When the selected note changes (NoteEditor stays mounted while the note
  // prop switches), flush any pending save for the previous note first so
  // edits aren't lost, then reset state to the new note.
  useEffect(() => {
    debouncedSave.flush();
    setEditedNote(note);
    setShowNewUpdate(false);
    setQuillEditorState((s) => ({ ...s, isQuillFocused: false }));
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the colour in the toolbar atom in sync with the current note's colour.
  useEffect(() => {
    setQuillEditorState((s) => ({ ...s, colour }));
  }, [colour, setQuillEditorState]);

  // Flush any pending debounced save when the component unmounts (navigation).
  useEffect(() => {
    return () => {
      debouncedSave.flush();
      setQuillEditorState({
        isQuillFocused: false,
        toolbarFormatting: undefined,
        colour: undefined,
      });
    };
  }, [debouncedSave, setQuillEditorState]);

  // Scroll to the new update editor when it appears.
  useEffect(() => {
    if (showNewUpdate) {
      newUpdateRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [showNewUpdate]);

  const onCreateTask = async () => {
    await createTask({
      createTaskData: {
        note: editedNote,
        title: "New task",
        isFlagged: false,
        link: null,
        links: [],
        description: "",
        dueDate: null,
        completedDate: null,
        cancelledDate: null,
      },
    });
  };

  const onUpdateNote = (updateNoteData: Partial<Note>) => {
    setEditedNote((currentEditedNote) => ({
      ...currentEditedNote,
      ...updateNoteData,
      updated: dayjs(),
    }));
    debouncedSave();
  };

  const onSaveLinks = (links: Link[]) => {
    onUpdateNote({ links });
  };

  const onDeleteNote = async () => {
    debouncedSave.clear();
    await deleteNote({ noteId: editedNote.id });

    navigate({
      to: location.pathname,
      search: {
        noteId: null,
      },
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 h-fit w-full max-w-[1000px] px-12 pt-6 pb-28">
      <div className="w-full flex flex-col gap-2 justify-between border-b-2 border-slate-100 pb-4">
        <textarea
          ref={titleRef}
          rows={1}
          name="title"
          value={editedNote.title ?? ""}
          placeholder="No Title"
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          className="text-5xl font-title tracking-tight overflow-y-hidden bg-white placeholder-slate-400 select-none resize-none outline-none"
        />

        {editedNote.links.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2 items-center">
            {editedNote.links.map((link) => (
              <NoteLinkPill key={link.id} link={link} colour={colour} />
            ))}
          </div>
        )}

        <div className="flex flex-row flex-wrap items-center justify-between">
          <div className="flex flex-row flex-wrap gap-2 items-center">
            <TagMultiSelect
              key={editedNote.id}
              initialTags={editedNote.tags}
              colour={colour}
              onChange={(tags) => onUpdateNote({ tags })}
            />

            <Dialog.Root
              onOpenChange={(open) => {
                if (open) setLinksModalKey((k) => k + 1);
              }}
            >
              <Dialog.Trigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  colour={colour}
                  iconName="link"
                />
              </Dialog.Trigger>

              <NoteLinksModal
                key={linksModalKey}
                links={editedNote.links}
                colour={colour}
                onSave={onSaveLinks}
              />
            </Dialog.Root>

            <Button
              size="sm"
              variant="ghost"
              colour={colour}
              onClick={onCreateTask}
              iconName="checkCircle"
            />

            <Button
              size="sm"
              variant="ghost"
              colour={colour}
              onClick={() => setShowNewUpdate(true)}
              iconName="chatCenteredText"
            />

            <Toggle
              isToggled={editedNote.isBookmarked}
              size="sm"
              colour={colours.red}
              onClick={() =>
                onUpdateNote({ isBookmarked: !editedNote.isBookmarked })
              }
              iconName="bookmark"
            />

            <p className="text-slate-500 text-xs">
              {editedNote.created.format("D MMMM YYYY, hh:mm a")}
            </p>
          </div>

          <div className="flex flex-row flex-wrap gap-2 items-center">
            <Button
              size="sm"
              variant="ghost"
              colour={colours.red}
              onClick={onDeleteNote}
              iconName="trash"
            />
          </div>
        </div>
      </div>

      {note.tasks && note.tasks.length > 0 && (
        <div className="w-full flex flex-col gap-2 justify-between border-b-2 border-slate-100 pb-4">
          {note.tasks.map((task) => (
            <TaskEditor key={task.id} task={task} colour={colour} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-5 w-full">
        <QuillEditor
          toolbarId={QUILL_TOOLBAR_ID}
          value={editedNote.content}
          colour={colour}
          onChange={(delta) => onUpdateNote({ content: delta })}
          onSelectedFormattingChange={(selectionFormatting) => {
            setQuillEditorState((s) => ({
              ...s,
              toolbarFormatting: selectionFormatting,
            }));
          }}
          onFocus={() =>
            setQuillEditorState((s) => ({ ...s, isQuillFocused: true }))
          }
          onBlur={() =>
            setQuillEditorState((s) => ({ ...s, isQuillFocused: false }))
          }
        />
      </div>

      {(updates.length > 0 || showNewUpdate) && (
        <div className="w-full flex flex-col border-t-2 border-slate-100 pt-6">
          {showNewUpdate && (
            <div ref={newUpdateRef}>
              <UpdateEditor
                update={{ notes: [editedNote], tint: null }}
                colour={colour}
                showNotes={false}
                dateDisplay="date"
                autoFocus={true}
                onCancel={() => setShowNewUpdate(false)}
                onCreated={() => setShowNewUpdate(false)}
              />
            </div>
          )}

          {updates.length > 0 && (
            <div className="flex flex-col relative">
              {[...updates].reverse().map((upd) => (
                <UpdateEditor
                  key={upd.id}
                  update={upd}
                  colour={colour}
                  showNotes={false}
                  dateDisplay="date"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
