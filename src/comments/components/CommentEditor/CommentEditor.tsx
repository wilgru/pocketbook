import { Link } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { useCreateComment } from "src/comments/hooks/useCreateComment";
import { useDeleteComment } from "src/comments/hooks/useDeleteComment";
import { useUpdateComment } from "src/comments/hooks/useUpdateComment";
import { getTintClasses } from "src/comments/utils/getTintClasses";
import { NoteToolbarAtom } from "src/common/atoms/noteToolbarStateAtom";
import { Button } from "src/common/components/Button/Button";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { cn } from "src/common/utils/cn";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateTimelineItem } from "src/updates/components/UpdateTimelineItem/UpdateTimelineItem";
import type { Colour } from "src/colours/Colour.type";
import type { Comment, CommentTint } from "src/comments/Comment.type";
import type { Note } from "src/notes/Note.type";

type CommentEditorProps = {
  comment: Partial<Comment>;
  colour?: Colour;
  showNotes?: boolean;
  autoFocus?: boolean;
  showTimeOnly?: boolean;
  showBottomPadding?: boolean;
  hideBottomLine?: boolean;
  onCancel?: () => void;
  onCreated?: () => void;
};

const TINT_OPTIONS: Array<{ value: CommentTint; bg: string }> = [
  { value: "red", bg: "bg-red-400" },
  { value: "yellow", bg: "bg-yellow-400" },
  { value: "green", bg: "bg-green-400" },
  { value: "blue", bg: "bg-blue-400" },
];

const getInitialComment = (comment: Partial<Comment>): Partial<Comment> => ({
  id: comment.id ?? "",
  content: comment.content ?? createEmptyLexicalContent(),
  tint: comment.tint ?? null,
  isWaypoint: comment.isWaypoint ?? false,
  notes: comment.notes ?? [],
  created: comment.created,
  updated: comment.updated,
});

export const CommentEditor = ({
  comment,
  colour,
  showNotes = true,
  autoFocus = false,
  showBottomPadding = false,
  hideBottomLine = false,
  showTimeOnly = false,
  onCancel,
  onCreated,
}: CommentEditorProps) => {
  const { pocketbookId, currentPocketbook } = useCurrentPocketbook();

  const { createComment } = useCreateComment();
  const { updateComment } = useUpdateComment();
  const { deleteComment } = useDeleteComment();

  const setNoteToolbarAtom = useSetAtom(NoteToolbarAtom);

  const [editedComment, setEditedComment] = useState<Partial<Comment>>(
    getInitialComment(comment),
  );
  const [isEditing, setIsEditing] = useState(!comment.id);
  const tintClasses = getTintClasses(editedComment.tint);

  const onUpdateField = (fields: Partial<Comment>) => {
    setEditedComment((current) => ({ ...current, ...fields }));
  };

  if (!currentPocketbook) {
    return null;
  }

  const resolvedColour = colour ?? currentPocketbook.colour ?? colours.orange;

  const onDone = async () => {
    setNoteToolbarAtom((current) => ({
      ...current,
      isVisible: false,
    }));

    if (editedComment.id) {
      const updated = await updateComment({
        commentId: editedComment.id,
        commentData: {
          content: editedComment.content,
          tint: editedComment.tint,
          isWaypoint: editedComment.isWaypoint,
          notes: editedComment.notes as Note[],
        },
      });
      if (updated) {
        setEditedComment(updated);
      }
      setIsEditing(false);
    } else {
      // New comment — create explicitly now
      const created = await createComment({
        createCommentData: {
          content: editedComment.content!,
          tint: editedComment.tint ?? null,
          notes: (editedComment.notes ?? []) as Note[],
          isWaypoint: editedComment.isWaypoint ?? false,
        },
      });
      if (created) {
        setEditedComment(created);
        onCreated?.();
      }
    }
  };

  const onCancelEdit = () => {
    setNoteToolbarAtom((current) => ({
      ...current,
      isVisible: false,
    }));

    if (!editedComment.id) {
      onCancel?.();
    } else {
      setEditedComment(getInitialComment(comment));
      setIsEditing(false);
    }
  };

  const onDelete = async () => {
    setNoteToolbarAtom((current) => ({
      ...current,
      isVisible: false,
    }));

    if (editedComment.id) {
      await deleteComment({ commentId: editedComment.id });
    } else {
      onCancel?.();
    }
  };

  const dateStr = editedComment.created
    ? showTimeOnly
      ? editedComment.created.format("h:mm a")
      : getRelativeDateTitle(editedComment.created)
    : null;

  return (
    <UpdateTimelineItem
      iconName={
        editedComment.isWaypoint ? "flagBannerFold" : "chatCenteredText"
      }
      iconColour={editedComment.isWaypoint ? tintClasses.colour : colours.grey}
      strongIcon={editedComment.isWaypoint}
      dateText={dateStr}
      showBottomPadding={showBottomPadding}
      hideBottomLine={hideBottomLine}
      headline={
        <p className="text-slate-500">
          {editedComment.notes?.length
            ? "Commented on "
            : "Left a general comment "}

          {showNotes &&
            editedComment.notes &&
            editedComment.notes.map((note, index) => (
              <>
                <Link
                  key={note.id}
                  to="/$pocketbookId/notes"
                  params={{ pocketbookId: pocketbookId ?? "" }}
                  search={{ noteId: note.id }}
                  className="underline text-slate-600 hover:text-slate-800"
                >
                  {note.title ?? "Untitled Note"}
                </Link>

                {index < (editedComment.notes?.length ?? 0) - 2 && ", "}
                {index === (editedComment.notes?.length ?? 0) - 2 && " and "}
              </>
            ))}
        </p>
      }
    >
      <div
        className={cn(
          "rounded-xl p-2 flex flex-col border drop-shadow-xs",
          isEditing
            ? "bg-white border-slate-200 gap-2"
            : cn(tintClasses.card, tintClasses.border),
        )}
      >
        {isEditing && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <NoteSelect
              selectedNotes={(editedComment.notes ?? []) as Note[]}
              colour={resolvedColour}
              onChange={(notes) => onUpdateField({ notes })}
            />

            <div className="flex gap-1.5 items-center">
              <Toggle
                isToggled={editedComment.isWaypoint ?? false}
                onClick={() =>
                  onUpdateField({
                    isWaypoint: !(editedComment.isWaypoint ?? false),
                  })
                }
                size="sm"
                colour={tintClasses.colour}
                iconName="flagBannerFold"
              />

              <button
                onClick={() => onUpdateField({ tint: null })}
                className={cn(
                  "h-5 w-5 rounded-full border-2 bg-slate-200",
                  editedComment.tint === null
                    ? "border-slate-500"
                    : "border-transparent",
                )}
                title="No colour"
              />

              {TINT_OPTIONS.map(({ value, bg }) => (
                <button
                  key={value}
                  onClick={() => onUpdateField({ tint: value })}
                  className={cn(
                    "h-5 w-5 rounded-full border-2",
                    bg,
                    editedComment.tint === value
                      ? "border-slate-600"
                      : "border-transparent",
                  )}
                  title={value}
                />
              ))}
            </div>
          </div>
        )}

        <RichTextEditor
          size="md"
          className={cn(isEditing && "px-2")}
          value={editedComment.content}
          colour={resolvedColour}
          onFocus={() => {
            setIsEditing(true);
            setNoteToolbarAtom((current) => ({
              ...current,
              isVisible: true,
            }));
          }}
          autoFocus={autoFocus}
          onChange={(delta) => onUpdateField({ content: delta })}
          onSelectedFormattingChange={(selectionFormatting) => {
            setNoteToolbarAtom((current) => ({
              ...current,
              toolbarFormatting: selectionFormatting,
            }));
          }}
          onEditorContextReady={(editorContext) => {
            setNoteToolbarAtom((current) => ({
              ...current,
              editorContext,
            }));
          }}
        />

        {isEditing && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Button
              size="sm"
              variant="block"
              colour={colours.red}
              className="text-red-500"
              onClick={onDelete}
            >
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                colour={resolvedColour}
                onClick={onCancelEdit}
              >
                Discard
              </Button>
              <Button
                size="sm"
                variant="block"
                colour={resolvedColour}
                onClick={onDone}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </UpdateTimelineItem>
  );
};
