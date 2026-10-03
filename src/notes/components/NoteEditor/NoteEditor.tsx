import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useForm, useSelector } from "@tanstack/react-form-start";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
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

type NoteFormValues = Pick<
  Note,
  "title" | "content" | "isBookmarked" | "links" | "tags"
>;

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

  const form = useForm({
    defaultValues: {
      title: note.title,
      content: note.content,
      isBookmarked: note.isBookmarked,
      links: note.links,
      tags: note.tags,
    } satisfies NoteFormValues,
    onSubmit: async ({ value }) => {
      const editedNote = { ...note, ...value, updated: dayjs() };

      if (editedNote.id) {
        await updateNote({
          noteId: editedNote.id,
          updateNoteData: editedNote,
        });
      } else {
        await createNote({ createNoteData: editedNote });
      }
    },
  });
  const formValues = useSelector(form.store, (state) => state.values);
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
  const titleRef = useAutoResize(formValues.title);

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
    void form.handleSubmit();
    onSave?.();
  }, 500);

  const onCreateTask = async (insertAfterSortOrder?: number) => {
    const createdTask = await createTask({
      createTaskData: {
        note,
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

  const onDeleteNote = async () => {
    debouncedSave.cancel();
    await deleteNote({ noteId: note.id });

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
      <div className="flex min-h-full flex-col gap-4">
        <div className="flex w-full flex-col justify-between gap-1 border-b border-slate-200 pb-3">
          <form.Field name="title">
            {(field) => (
              <textarea
                ref={titleRef}
                rows={1}
                name="title"
                value={field.state.value ?? ""}
                placeholder="No Title"
                onChange={(e) => {
                  field.handleChange(e.target.value);
                  debouncedSave();
                }}
                className="resize-none overflow-y-hidden bg-white font-title text-4xl tracking-tight placeholder-slate-400 outline-hidden select-none"
              />
            )}
          </form.Field>

          <div className="flex flex-row flex-wrap items-center gap-1.5">
            <form.Field name="tags">
              {(field) => (
                <TagSelect
                  key={note.id}
                  initialTags={field.state.value}
                  colour={colour}
                  onChange={(tags) => {
                    field.handleChange(tags);
                    debouncedSave();
                  }}
                />
              )}
            </form.Field>

            <form.Field name="links">
              {(field) => (
                <LinksPopover
                  links={field.state.value}
                  colour={colour}
                  onChange={(links) => {
                    field.handleChange(links);
                    debouncedSave();
                  }}
                />
              )}
            </form.Field>

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

            <form.Field name="isBookmarked">
              {(field) => (
                <Toggle
                  isToggled={field.state.value}
                  size="sm"
                  colour={colours.red}
                  onClick={() => {
                    field.handleChange(!field.state.value);
                    debouncedSave();
                  }}
                  iconName="bookmark"
                />
              )}
            </form.Field>

            <p className="text-xs text-slate-500">
              {note.created.format("D MMMM YYYY, hh:mm a")}
            </p>

            <DropdownMenu.Root onOpenChange={setIsActionsDropdownOpen}>
              <DropdownMenu.Trigger
                className={cn(
                  "ml-0.5 flex h-fit w-fit items-center gap-2 rounded-full p-0.5 text-slate-500 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 focus-visible:outline-solid",
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

          {formValues.links.length > 0 && (
            <div className="flex flex-row flex-wrap items-center gap-3 pt-1 pl-1">
              {formValues.links.map((link) => (
                <LinkPill key={link.id} link={link} colour={colour} />
              ))}
            </div>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="flex w-full flex-col justify-between gap-1 border-b border-dashed border-slate-300 pb-3">
            <div className="flex flex-row items-center justify-between gap-2">
              <h3 className="text-sm text-slate-400">Tasks</h3>

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

        <div className="min-h-0 w-full flex-1">
          <form.Field name="content">
            {(field) => (
              <RichTextEditor
                className="h-full w-full px-1"
                size="lg"
                value={field.state.value}
                colour={colour}
                fillHeight
                onChange={(content) => {
                  field.handleChange(content);
                  debouncedSave();
                }}
                onSelectedFormattingChange={setToolbarFormatting}
                onEditorContextReady={setEditorContext}
              />
            )}
          </form.Field>
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
        <div className="flex w-full flex-col border-t border-slate-200 pb-24">
          {showNewComment && (
            <CommentEditor
              ref={newCommentRef}
              comment={{ notes: [note], colour: null }}
              colour={colour}
              thisNoteId={note.id}
              autoFocus={true}
              onCancel={() => setShowNewComment(false)}
              onCreated={() => setShowNewComment(false)}
            />
          )}

          {comments.length > 0 &&
            [...comments]
              .reverse()
              .map((comment) => (
                <CommentEditor
                  key={comment.id}
                  comment={comment}
                  colour={colour}
                  thisNoteId={note.id}
                  hideBottomLine={comment === comments[0]}
                />
              ))}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
