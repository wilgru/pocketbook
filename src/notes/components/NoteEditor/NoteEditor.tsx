import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import debounce from "debounce";
import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { quillEditorStateAtom } from "src/common/atoms/quillEditorStateAtom";
import { Button } from "src/common/components/Button/Button";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { QuillEditor } from "src/common/components/QuillEditor/QuillEditor";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteLinksPopover } from "src/notes/components/NoteLinksPopover/NoteLinksPopover";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useDeleteNote } from "src/notes/hooks/useDeleteNote";
import { useUpdateNote } from "src/notes/hooks/useUpdateNote";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useTaskReorder } from "src/tasks/hooks/useTaskReorder";
import { UpdateEditor } from "src/updates/components/UpdateEditor/UpdateEditor";
import { useGetUpdates } from "src/updates/hooks/useGetUpdates";
import { TagSelect } from "../../../tags/components/TagSelect/TagSelect";
import { TaskEditor } from "../../../tasks/components/TaskEditor/TaskEditor";
import type { Colour } from "src/colours/Colour.type";
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
  const { getMoveCallbacks } = useTaskReorder();
  const { updateNote } = useUpdateNote();
  const { deleteNote } = useDeleteNote();
  const { updates } = useGetUpdates({ noteId: note.id });

  const location = useLocation();
  const navigate = useNavigate();

  const setQuillEditorState = useSetAtom(quillEditorStateAtom);

  const [editedNote, setEditedNote] = useState<Note>(note); // TODO: maybe use key prop when using NoteEditor to force reset instead of having to manage this state and useEffects to reset when the note prop changes.
  const [showNewUpdate, setShowNewUpdate] = useState(false);
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);

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
    setNewTaskFocusId(null);
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

  const onCreateTask = async (insertAfterSortOrder?: number) => {
    const createdTask = await createTask({
      createTaskData: {
        note: editedNote,
        title: "",
        isImportant: false,
        link: null,
        links: [],
        description: "",
        dueDate: null,
        completedDate: null,
        cancelledDate: null,
      },
      insertAfterSortOrder,
    });
    if (createdTask?.id) {
      setNewTaskFocusId(createdTask.id);
    }
  };
  const onUpdateNote = (updateNoteData: Partial<Note>) => {
    setEditedNote((currentEditedNote) => ({
      ...currentEditedNote,
      ...updateNoteData,
      updated: dayjs(),
    }));
    debouncedSave();
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
    <div className="flex flex-col items-center gap-4 min-h-full w-full max-w-[1000px] px-8 pt-8">
      <div className="w-full flex flex-col gap-2 justify-between border-b border-slate-200 pb-2">
        <textarea
          ref={titleRef}
          rows={1}
          name="title"
          value={editedNote.title ?? ""}
          placeholder="No Title"
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          className="text-5xl font-title tracking-tight overflow-y-hidden bg-white placeholder-slate-400 select-none resize-none outline-none"
        />

        <div className="flex flex-row flex-wrap gap-1.5 items-center">
          <TagSelect
            key={editedNote.id}
            initialTags={editedNote.tags}
            colour={colour}
            onChange={(tags) => onUpdateNote({ tags })}
          />

          <NoteLinksPopover
            links={editedNote.links}
            colour={colour}
            onChange={(links) => onUpdateNote({ links })}
          />

          <Button
            size="sm"
            variant="ghost"
            colour={colour}
            onClick={() => void onCreateTask()}
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

          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className={`ml-0.5 h-fit w-fit flex items-center gap-2 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 text-slate-500 p-0.5 hover:${colour.textPill} hover:${colour.backgroundPill}`}
              aria-label="Open note actions"
            >
              <Icon iconName="dotsThreeOutline" size="xs" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="w-40 flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2 drop-shadow"
                side="bottom"
                align="start"
                sideOffset={6}
              >
                <DropdownMenu.Item
                  onSelect={() => void onDeleteNote()}
                  className="leading-none text-sm p-2 outline-none rounded-xl cursor-pointer transition-colors hover:bg-red-100"
                >
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {editedNote.links.length > 0 && (
          <div className="flex flex-row flex-wrap gap-2 items-center pl-1">
            {editedNote.links.map((link) => (
              <LinkPill key={link.id} link={link} colour={colour} />
            ))}
          </div>
        )}
      </div>

      {note.tasks && note.tasks.length > 0 && (
        <div className="w-full flex flex-col justify-between border-dashed border-b border-slate-300 pb-4">
          {note.tasks.map((task, index) => (
            <TaskEditor
              key={task.id}
              task={task}
              colour={colour}
              onCreateNextTask={() => onCreateTask(task.sortOrder)}
              autoFocusTitle={task.id === newTaskFocusId}
              onAutoFocusComplete={() => setNewTaskFocusId(null)}
              {...getMoveCallbacks(index, note.tasks)}
            />
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
        <div className="w-full flex flex-col border-dashed border-t border-slate-300 pt-4 px-1">
          {showNewUpdate && (
            <div ref={newUpdateRef} className="pb-4">
              <UpdateEditor
                update={{ notes: [editedNote], tint: null }}
                colour={colour}
                showNotes={false}
                autoFocus={true}
                onCancel={() => setShowNewUpdate(false)}
                onCreated={() => setShowNewUpdate(false)}
              />
            </div>
          )}

          {updates.length > 0 && (
            <div className="flex flex-col relative gap-4">
              {[...updates].reverse().map((upd) => (
                <UpdateEditor
                  key={upd.id}
                  update={upd}
                  colour={colour}
                  showNotes={false}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div aria-hidden="true" className="h-40 w-full shrink-0" />
    </div>
  );
};

export default NoteEditor;
