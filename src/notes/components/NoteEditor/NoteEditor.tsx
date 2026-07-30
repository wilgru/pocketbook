import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { CommentEditor } from "src/comments/components/CommentEditor/CommentEditor";
import { useGetComments } from "src/comments/hooks/useGetComments";
import {
  defaultNoteToolbarAtom,
  NoteToolbarAtom,
} from "src/common/atoms/noteToolbarStateAtom";
import { Button } from "src/common/components/Button/Button";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { LinksPopover } from "src/common/components/LinksPopover/LinksPopover";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useDeleteNote } from "src/notes/hooks/useDeleteNote";
import { useUpdateNote } from "src/notes/hooks/useUpdateNote";
import { TagSelect } from "src/tags/components/TagSelect/TagSelect";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDebouncedCallback } from "use-debounce";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";

type NoteEditorProps = {
  note: Note;
  colour?: Colour;
  onSave?: () => void;
};

const NoteEditor = ({
  note,
  colour = colours.orange,
  onSave,
}: NoteEditorProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { createNote } = useCreateNote();
  const { createTask } = useCreateTask();
  const { updateNote } = useUpdateNote();
  const { deleteNote } = useDeleteNote();
  const { comments } = useGetComments({ noteId: note.id });

  const [noteToolbarAtom, setNoteToolbarAtom] = useAtom(NoteToolbarAtom);

  const [editedNote, setEditedNote] = useState<Note>(note); // TODO: maybe use key prop when using NoteEditor to force reset instead of having to manage this state and useEffects to reset when the note prop changes.
  const [showNewComment, setShowNewComment] = useState(false);
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);

  const newCommentRef = useRef<HTMLDivElement>(null);
  const titleRef = useAutoResize(editedNote.title);

  const debouncedSave = useDebouncedCallback(() => {
    if (editedNote.id) {
      updateNote({ noteId: editedNote.id, updateNoteData: editedNote });
    } else {
      createNote({ createNoteData: editedNote });
    }
    onSave?.();
  }, 500);

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
    debouncedSave.cancel();
    await deleteNote({ noteId: editedNote.id });

    navigate({
      to: location.pathname,
      search: {
        noteId: null,
      },
    });
  };

  // Flush any pending debounced save when the component unmounts (navigation).
  useEffect(() => {
    return () => {
      debouncedSave.flush();
      setNoteToolbarAtom(defaultNoteToolbarAtom);
    };
  }, [debouncedSave, setNoteToolbarAtom]);

  // Scroll to the new comment editor when it appears.
  useEffect(() => {
    if (showNewComment) {
      newCommentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [showNewComment]);

  return (
    <div className="flex flex-col items-center gap-4 min-h-full w-full max-w-250">
      <div className="w-full flex flex-col gap-1 justify-between border-b border-slate-200 pb-3">
        <textarea
          ref={titleRef}
          rows={1}
          name="title"
          value={editedNote.title ?? ""}
          placeholder="No Title"
          onChange={(e) => onUpdateNote({ title: e.target.value })}
          className="text-4xl font-title tracking-tight overflow-y-hidden bg-white placeholder-slate-400 select-none resize-none outline-hidden"
        />

        <div className="flex flex-row flex-wrap gap-1.5 items-center">
          <TagSelect
            key={editedNote.id}
            initialTags={editedNote.tags}
            colour={colour}
            onChange={(tags) => onUpdateNote({ tags })}
          />

          <LinksPopover
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
            onClick={() => setShowNewComment(true)}
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
              className={cn(
                "ml-0.5 h-fit w-fit flex items-center gap-2 rounded-full transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 text-slate-500 p-0.5",
                colour.secondary.textHovered,
                colour.secondary.backgroundHovered,
              )}
              aria-label="Open note actions"
            >
              <Icon iconName="dotsThreeOutline" size="xs" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="w-40 flex flex-col gap-2 bg-white border border-slate-200 rounded-2xl p-2 drop-shadow-sm"
                side="bottom"
                align="start"
                sideOffset={6}
              >
                <DropdownMenu.Item
                  onSelect={() => void onDeleteNote()}
                  className="leading-none text-sm p-2 outline-hidden rounded-xl cursor-pointer transition-colors hover:bg-red-100"
                >
                  Delete
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {editedNote.links.length > 0 && (
          <div className="flex flex-row flex-wrap gap-3 items-center pl-1 pt-1">
            {editedNote.links.map((link) => (
              <LinkPill key={link.id} link={link} colour={colour} />
            ))}
          </div>
        )}
      </div>

      {note.tasks && note.tasks.length > 0 && (
        <div className="w-full flex flex-col gap-1 justify-between border-dashed border-b border-slate-300 pb-4">
          {note.tasks.map((task) => (
            <TaskEditor
              key={task.id}
              task={task}
              tasksForSorting={note.tasks}
              colour={colour}
              onCreateNextTask={() => onCreateTask(task.sortOrder)}
              autoFocusTitle={task.id === newTaskFocusId}
              onAutoFocusComplete={() => setNewTaskFocusId(null)}
            />
          ))}
        </div>
      )}

      <div className={cn("flex flex-col gap-5 w-full")}>
        <RichTextEditor
          className="w-full px-1"
          size="lg"
          value={editedNote.content}
          colour={colour}
          onChange={(content) => onUpdateNote({ content: content })}
          onSelectedFormattingChange={(selectionFormatting) => {
            setNoteToolbarAtom((current) => ({
              ...current,
              toolbarFormatting: selectionFormatting,
            }));
          }}
          onFocus={() =>
            setNoteToolbarAtom((current) => ({
              ...current,
              isVisible: true,
            }))
          }
          onBlur={(e) => {
            e.preventDefault();

            if (noteToolbarAtom.isToolbarBusy) {
              return;
            }

            setNoteToolbarAtom((current) => ({
              ...current,
              isVisible: false,
            }));

            e.target.blur();
          }}
          onEditorContextReady={(editorContext) =>
            setNoteToolbarAtom((current) => ({
              ...current,
              colour: colour,
              editorContext,
            }))
          }
        />
      </div>

      {(comments.length > 0 || showNewComment) && (
        <div className="w-full flex flex-col border-t border-slate-200">
          {showNewComment && (
            <div ref={newCommentRef}>
              <CommentEditor
                comment={{ notes: [editedNote], tint: null }}
                colour={colour}
                showNotes={false}
                autoFocus={true}
                onCancel={() => setShowNewComment(false)}
                onCreated={() => setShowNewComment(false)}
              />
            </div>
          )}

          {comments.length > 0 &&
            [...comments]
              .reverse()
              .map((comment) => (
                <CommentEditor
                  key={comment.id}
                  comment={comment}
                  colour={colour}
                  showNotes={false}
                  hideBottomLine={comment === comments[0]}
                />
              ))}
        </div>
      )}

      <div aria-hidden="true" className="h-40 w-full shrink-0" />
    </div>
  );
};

export default NoteEditor;
