import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useLocation, useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { CommentEditor } from "src/comments/components/CommentEditor/CommentEditor";
import { getCommentsServerFn } from "src/comments/serverFunctions/getComments";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownItem,
} from "src/common/components/Dropdown/Dropdown";
import { LinkPill } from "src/common/components/LinkPill/LinkPill";
import { LinksPopover } from "src/common/components/LinksPopover/LinksPopover";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { useAutoResize } from "src/common/hooks/useAutoResize";
import { useServerQuery } from "src/common/hooks/useServerQuery";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { NoteToolbar } from "src/notes/components/NoteToolbar/NoteToolbar";
import { useCreateNote } from "src/notes/hooks/useCreateNote";
import { useDeleteNote } from "src/notes/hooks/useDeleteNote";
import { useUpdateNote } from "src/notes/hooks/useUpdateNote";
import { useCurrentPocketbookId } from "src/pocketbooks/hooks/useCurrentPocketbookId";
import { TagSelect } from "src/tags/components/TagSelect/TagSelect";
import { TaskEditor } from "src/tasks/components/TaskEditor/TaskEditor";
import { TaskProgressBar } from "src/tasks/components/TaskProgressBar/TaskProgressBar";
import { useCreateTask } from "src/tasks/hooks/useCreateTask";
import { useDebouncedCallback } from "use-debounce";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";
import type { Note } from "src/notes/notes.schema";

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

  const { pocketbookId } = useCurrentPocketbookId();
  const { createNote } = useCreateNote();
  const { createTask } = useCreateTask();
  const { updateNote } = useUpdateNote();
  const { deleteNote } = useDeleteNote();
  const { data: commentsData } = useServerQuery(
    getCommentsServerFn,
    { pocketbookId, noteId: note.id },
    { enabled: !!note.id },
  );
  const comments = commentsData?.comments ?? [];

  const [editedNote, setEditedNote] = useState<Note>(note); // TODO: maybe use key prop when using NoteEditor to force reset instead of having to manage this state and useEffects to reset when the note prop changes.
  const [showNewComment, setShowNewComment] = useState(false);
  const [newTaskFocusId, setNewTaskFocusId] = useState<string | null>(null);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false);
  const [editorContext, setEditorContext] = useState<LexicalEditor | null>(
    null,
  );
  const [toolbarFormatting, setToolbarFormatting] =
    useState<LexicalToolbarFormatting>();
  const [isToolbarBusy, setIsToolbarBusy] = useState(false);

  const newCommentRef = useRef<HTMLDivElement>(null);
  const titleRef = useAutoResize(editedNote.title);

  const tasks = note.tasks ?? [];
  const completedTaskCount = tasks.filter((task) => task.completedDate).length;
  const cancelledTaskCount = tasks.filter((task) => task.cancelledDate).length;
  const activeTasks = tasks.filter(
    (task) => !task.completedDate && !task.cancelledDate,
  );
  const completedOrCancelledTasks = tasks.filter(
    (task) => task.completedDate || task.cancelledDate,
  );

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
        blockedComment: null,
        blockedDate: null,
        noteId: note.id,
        pocketbookId,
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
    };
  }, [debouncedSave]);

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
    <div className="min-h-full w-full max-w-250">
      <div className="flex flex-col gap-4 min-h-full">
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

            <DropdownMenu.Root onOpenChange={setIsActionsDropdownOpen}>
              <DropdownMenu.Trigger
                className={cn(
                  "ml-0.5 h-fit w-fit flex items-center gap-2 rounded-full transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 text-slate-500 p-0.5",
                  colour.secondary.textHovered,
                  colour.secondary.backgroundHovered,
                  isActionsDropdownOpen &&
                    colour.secondary.textHovered.replace("hover:", ""),
                  isActionsDropdownOpen &&
                    colour.secondary.backgroundHovered.replace("hover:", ""),
                )}
                aria-label="Open note actions"
              >
                <Icon
                  iconName="dotsThree"
                  size="xs"
                  className={cn(isActionsDropdownOpen && colour.primary.text)}
                  weight={isActionsDropdownOpen ? "fill" : "regular"}
                />
              </DropdownMenu.Trigger>
              <Dropdown
                className="w-40"
                side="bottom"
                align="start"
                sideOffset={6}
              >
                <DropdownItem
                  onSelect={() => void onDeleteNote()}
                  colour={colours.red}
                >
                  Delete
                </DropdownItem>
              </Dropdown>
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

        {tasks.length > 0 && (
          <div className="w-full flex flex-col gap-1 justify-between border-dashed border-b border-slate-300 pb-3">
            <div className="flex flex-row items-center justify-between gap-2">
              <h3 className="text-slate-400 text-sm">Tasks</h3>

              <TaskProgressBar
                cancelled={cancelledTaskCount}
                completed={completedTaskCount}
                total={tasks.length}
                colour={colour}
              />
            </div>

            {activeTasks.map((task) => (
              <TaskEditor
                key={task.id}
                task={task}
                tasksForSorting={tasks}
                colour={colour}
                onCreateNextTask={() => onCreateTask(task.sortOrder)}
                autoFocusTitle={task.id === newTaskFocusId}
                onAutoFocusComplete={() => setNewTaskFocusId(null)}
              />
            ))}

            {(completedTaskCount > 0 || cancelledTaskCount > 0) && (
              <Button
                variant="ghost"
                size="xs"
                colour={colours.grey}
                iconName={showCompletedTasks ? "caretUp" : "caretDown"}
                onClick={() => setShowCompletedTasks((current) => !current)}
              >
                {showCompletedTasks ? "Hide completed " : "Show completed "}
                {`(${completedTaskCount + cancelledTaskCount})`}
              </Button>
            )}

            {showCompletedTasks &&
              completedOrCancelledTasks.map((task) => (
                <TaskEditor
                  key={task.id}
                  task={task}
                  tasksForSorting={tasks}
                  colour={colour}
                  onCreateNextTask={() => onCreateTask(task.sortOrder)}
                  autoFocusTitle={task.id === newTaskFocusId}
                  onAutoFocusComplete={() => setNewTaskFocusId(null)}
                />
              ))}
          </div>
        )}

        <div className="flex-1 min-h-0 w-full">
          <RichTextEditor
            className="h-full w-full px-1"
            size="lg"
            value={editedNote.content}
            colour={colour}
            fillHeight
            onChange={(content) => onUpdateNote({ content: content })}
            onSelectedFormattingChange={setToolbarFormatting}
            onEditorContextReady={setEditorContext}
          />
        </div>

        <NoteToolbar
          editorContext={editorContext}
          toolbarFormatting={toolbarFormatting}
          colour={colour}
          isToolbarBusy={isToolbarBusy}
          onToolbarBusyChange={setIsToolbarBusy}
        />
      </div>

      {(comments.length > 0 || showNewComment) && (
        <div className="w-full flex flex-col border-t border-slate-200 pb-24">
          {showNewComment && (
            <div ref={newCommentRef}>
              <CommentEditor
                comment={{ notes: [editedNote], colour: null }}
                colour={colour}
                thisNoteId={editedNote.id}
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
                  thisNoteId={editedNote.id}
                  hideBottomLine={comment === comments[0]}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
