import { useForm, useSelector } from "@tanstack/react-form-start";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState, Fragment } from "react";
import { colours } from "src/colours/colours.constant";
import { CommentToolbar } from "src/comments/components/CommentEditor/CommentToolbar";
import { useCreateComment } from "src/comments/hooks/useCreateComment";
import { useDeleteComment } from "src/comments/hooks/useDeleteComment";
import { useUpdateComment } from "src/comments/hooks/useUpdateComment";
import { RichTextEditor } from "src/common/components/RichTextEditor/RichTextEditor";
import { getRelativeDateTitle } from "src/common/utils/getRelativeDateString";
import { createEmptyLexicalContent } from "src/common/utils/lexicalContent";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateTimelineItem } from "src/updates/components/UpdateTimelineItem/UpdateTimelineItem";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type CommentEditorProps = {
  ref?: React.Ref<HTMLDivElement>;
  comment: Partial<Comment>;
  colour?: Colour;
  thisNoteId?: string;
  autoFocus?: boolean;
  showTimeOnly?: boolean;
  hideBottomLine?: boolean;
  onCancel?: () => void;
  onCreated?: () => void;
};

type CommentFormValues = Omit<
  Comment,
  "id" | "pocketbookId" | "created" | "updated" | "notes"
>;

export const CommentEditor = ({
  ref,
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
  const [selectedNotes, setSelectedNotes] = useState(comment.notes ?? []);

  const defaultValues: CommentFormValues = {
    content: comment.content ?? createEmptyLexicalContent(),
    colour: comment.colour ?? null,
    isWaypoint: comment.isWaypoint ?? false,
  };
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (comment.id) {
        const updated = await updateComment({
          commentId: comment.id,
          commentData: { ...value, notes: selectedNotes },
        });
        if (updated) {
          setIsEditing(false);
        }
      } else {
        const created = await createComment({
          createCommentData: { ...value, notes: selectedNotes },
        });
        if (created) {
          onCreated?.();
        }
      }
    },
  });
  const formValues = useSelector(form.store, (state) => state.values);
  const [isEditing, setIsEditing] = useState(!comment.id);
  const [editorContext, setEditorContext] = useState<LexicalEditor | null>(
    null,
  );
  const [toolbarFormatting, setToolbarFormatting] =
    useState<LexicalToolbarFormatting>();

  const onDelete = async () => {
    if (comment.id) {
      await deleteComment({ commentId: comment.id });
    } else {
      onCancel?.();
    }
  };

  if (!currentPocketbook) {
    return null;
  }

  const resolvedColour = colour ?? currentPocketbook.colour ?? colours.orange;
  const commentColour = formValues.colour;

  const dateStr = comment.created
    ? showTimeOnly
      ? comment.created.format("h:mm a")
      : getRelativeDateTitle(comment.created)
    : null;

  const notes = selectedNotes;
  const hasThisNote = notes.some((n) => n.id === thisNoteId);
  const sortedNotes = hasThisNote
    ? [...notes].sort((a, b) =>
        a.id === thisNoteId ? -1 : b.id === thisNoteId ? 1 : 0,
      )
    : notes;

  const headlinePrefix =
    notes.length === 0 ? "Left a general comment " : "Commented on ";

  const iconName = formValues.isWaypoint
    ? "flagBannerFold"
    : "chatCenteredText";
  const iconColour =
    formValues.isWaypoint && commentColour ? commentColour : colours.grey;

  const editorBackground =
    !isEditing && commentColour
      ? cn(commentColour.secondary.background, "p-2")
      : "bg-white";

  return (
    <UpdateTimelineItem
      ref={ref}
      iconName={iconName}
      iconColour={iconColour}
      strongIcon={formValues.isWaypoint}
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
                  className="font-medium text-slate-700 hover:text-slate-800 hover:underline"
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
        className={cn("flex flex-col gap-2 rounded-xl pl-1", editorBackground)}
      >
        <form.Field name="content">
          {(field) => (
            <RichTextEditor
              size="md"
              value={field.state.value}
              colour={resolvedColour}
              readOnly={!isEditing}
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true);
                }
              }}
              autoFocus={autoFocus || isEditing}
              onChange={(content) => field.handleChange(content)}
              onSelectedFormattingChange={setToolbarFormatting}
              onEditorContextReady={setEditorContext}
            />
          )}
        </form.Field>

        {isEditing && (
          <CommentToolbar
            editorContext={editorContext}
            toolbarFormatting={toolbarFormatting}
            colour={resolvedColour}
            comment={{ ...formValues, notes: selectedNotes }}
            onCommentChange={(fields) => {
              if (fields.notes !== undefined) {
                setSelectedNotes(fields.notes);
              }
              if (fields.isWaypoint !== undefined) {
                form.setFieldValue("isWaypoint", fields.isWaypoint);
              }
              if (fields.colour !== undefined) {
                form.setFieldValue("colour", fields.colour);
              }
            }}
            onDelete={() => void onDelete()}
            onSave={() => void form.handleSubmit()}
          />
        )}
      </div>
    </UpdateTimelineItem>
  );
};
