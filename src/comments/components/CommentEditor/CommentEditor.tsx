import { Link } from "@tanstack/react-router";
import { useState, Fragment } from "react";
import { colours } from "src/colours/colours.constant";
import { CommentToolbar } from "src/comments/components/CommentEditor/CommentToolbar";
import { useCreateComment } from "src/comments/hooks/useCreateComment";
import { useDeleteComment } from "src/comments/hooks/useDeleteComment";
import { useUpdateComment } from "src/comments/hooks/useUpdateComment";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { cn } from "src/common/utils/cn";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateTimelineItem } from "src/updates/components/UpdateTimelineItem/UpdateTimelineItem";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";
import type { Note } from "src/notes/notes.schema";

type CommentEditorProps = {
  comment: Partial<Comment>;
  colour?: Colour;
  thisNoteId?: string;
  autoFocus?: boolean;
  showTimeOnly?: boolean;
  hideBottomLine?: boolean;
  onCancel?: () => void;
  onCreated?: () => void;
};

const getInitialComment = (comment: Partial<Comment>): Partial<Comment> => ({
  id: comment.id ?? "",
  content: comment.content ?? createEmptyLexicalContent(),
  colour: comment.colour ?? null,
  isWaypoint: comment.isWaypoint ?? false,
  notes: comment.notes ?? [],
  created: comment.created,
  updated: comment.updated,
});

export const CommentEditor = ({
  comment,
  colour,
  thisNoteId,
  autoFocus = false,
  hideBottomLine = false,
  showTimeOnly = false,
  onCancel,
  onCreated,
}: CommentEditorProps) => {
  const { pocketbookId, currentPocketbook } = useCurrentPocketbook();

  const { createComment } = useCreateComment();
  const { updateComment } = useUpdateComment();
  const { deleteComment } = useDeleteComment();

  const [draftComment, setDraftComment] = useState<Partial<Comment> | null>(
    () => (comment.id ? null : getInitialComment(comment)),
  );
  const [editorContext, setEditorContext] = useState<LexicalEditor | null>(
    null,
  );
  const [toolbarFormatting, setToolbarFormatting] =
    useState<LexicalToolbarFormatting>();

  const editedComment = draftComment ?? comment;
  const isEditing = draftComment !== null;

  const onUpdateField = (fields: Partial<Comment>) => {
    setDraftComment((current) => ({
      ...(current ?? getInitialComment(comment)),
      ...fields,
    }));
  };

  const onDone = async () => {
    if (editedComment.id) {
      const updated = await updateComment({
        commentId: editedComment.id,
        commentData: {
          content: editedComment.content,
          colour: editedComment.colour,
          isWaypoint: editedComment.isWaypoint,
          notes: editedComment.notes as Note[],
        },
      });
      if (updated) {
        setDraftComment(null);
      }
    } else {
      // New comment — create explicitly now
      const created = await createComment({
        createCommentData: {
          content: editedComment.content!,
          colour: editedComment.colour ?? null,
          notes: (editedComment.notes ?? []) as Note[],
          isWaypoint: editedComment.isWaypoint ?? false,
        },
      });
      if (created) {
        onCreated?.();
      }
    }
  };

  const onDelete = async () => {
    if (editedComment.id) {
      await deleteComment({ commentId: editedComment.id });
    } else {
      onCancel?.();
    }
  };

  if (!currentPocketbook) {
    return null;
  }

  const resolvedColour = colour ?? currentPocketbook.colour ?? colours.orange;
  const commentColour = editedComment.colour ?? null;

  const dateStr = editedComment.created
    ? showTimeOnly
      ? editedComment.created.format("h:mm a")
      : getRelativeDateTitle(editedComment.created)
    : null;

  const notes = editedComment.notes ?? [];
  const hasThisNote = notes.some((n) => n.id === thisNoteId);
  const sortedNotes = hasThisNote
    ? [...notes].sort((a, b) =>
        a.id === thisNoteId ? -1 : b.id === thisNoteId ? 1 : 0,
      )
    : notes;

  const headlinePrefix =
    notes.length === 0 ? "Left a general comment " : "Commented on ";

  const iconName = editedComment.isWaypoint
    ? "flagBannerFold"
    : "chatCenteredText";
  const iconColour =
    editedComment.isWaypoint && commentColour ? commentColour : colours.grey;

  const editorBackground =
    !isEditing && commentColour
      ? cn(commentColour.secondary.background, "p-2")
      : "bg-white";

  return (
    <UpdateTimelineItem
      iconName={iconName}
      iconColour={iconColour}
      strongIcon={editedComment.isWaypoint}
      dateText={dateStr}
      hideBottomLine={hideBottomLine}
      headline={
        <p className="text-slate-500">
          {headlinePrefix}

          {sortedNotes.map((note, index) => (
            <Fragment key={note.id}>
              {note.id === thisNoteId ? (
                <span className="text-slate-500">this note</span>
              ) : (
                <Link
                  to="/$pocketbookId/notes"
                  params={{ pocketbookId: pocketbookId ?? "" }}
                  search={{ noteId: note.id }}
                  className="text-slate-700 font-medium hover:text-slate-800 hover:underline"
                >
                  {note.title ?? "Untitled Note"}
                </Link>
              )}

              {index < sortedNotes.length - 2 && ", "}
              {index === sortedNotes.length - 2 && " and "}
            </Fragment>
          ))}
        </p>
      }
    >
      <div
        className={cn("rounded-xl flex flex-col gap-2 pl-1", editorBackground)}
      >
        <RichTextEditor
          size="md"
          value={editedComment.content}
          colour={resolvedColour}
          readOnly={!isEditing}
          onClick={() => {
            if (!isEditing) {
              setDraftComment(getInitialComment(comment));
            }
          }}
          autoFocus={autoFocus || isEditing}
          onChange={(content) => onUpdateField({ content })}
          onSelectedFormattingChange={setToolbarFormatting}
          onEditorContextReady={setEditorContext}
        />

        {isEditing && (
          <CommentToolbar
            editorContext={editorContext}
            toolbarFormatting={toolbarFormatting}
            colour={resolvedColour}
            comment={editedComment}
            onCommentChange={onUpdateField}
            onDelete={() => void onDelete()}
            onSave={() => void onDone()}
          />
        )}
      </div>
    </UpdateTimelineItem>
  );
};
