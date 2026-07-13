import { Link } from "@tanstack/react-router";
import Delta from "quill-delta";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { QuillEditor } from "src/common/components/QuillEditor/QuillEditor";
import { QuillFormattingToolbar } from "src/common/components/QuillFormattingToolbar/QuillFormattingToolbar";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { cn } from "src/common/utils/cn";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { useCurrentPocketbook } from "src/pocketbooks/hooks/useCurrentPocketbook";
import { UpdateTimelineItem } from "src/updates/components/UpdateTimelineItem/UpdateTimelineItem";
import { useCreateUpdate } from "src/updates/hooks/useCreateUpdate";
import { useDeleteUpdate } from "src/updates/hooks/useDeleteUpdate";
import { useUpdateUpdate } from "src/updates/hooks/useUpdateUpdate";
import { getTintClasses } from "src/updates/utils/getTintClasses";
import type { StringMap } from "quill";
import type { Colour } from "src/colours/Colour.type";
import type { Note } from "src/notes/Note.type";
import type { Update, UpdateTint } from "src/updates/Update.type";

type UpdateEditorProps = {
  update: Partial<Update>;
  colour?: Colour;
  showNotes?: boolean;
  autoFocus?: boolean;
  showTimeOnly?: boolean;
  showBottomPadding?: boolean;
  onCancel?: () => void;
  onCreated?: () => void;
};

const TINT_OPTIONS: Array<{ value: UpdateTint; bg: string }> = [
  { value: "red", bg: "bg-red-400" },
  { value: "yellow", bg: "bg-yellow-400" },
  { value: "green", bg: "bg-green-400" },
  { value: "blue", bg: "bg-blue-400" },
];

const getInitialUpdate = (update: Partial<Update>): Partial<Update> => ({
  id: update.id ?? "",
  content: update.content ?? new Delta(),
  tint: update.tint ?? null,
  isWaypoint: update.isWaypoint ?? false,
  notes: update.notes ?? [],
  created: update.created,
  updated: update.updated,
});

export const UpdateEditor = ({
  update,
  colour,
  showNotes = true,
  autoFocus = false,
  showBottomPadding = false,
  showTimeOnly = false,
  onCancel,
  onCreated,
}: UpdateEditorProps) => {
  const { pocketbookId, currentPocketbook } = useCurrentPocketbook();

  const { createUpdate } = useCreateUpdate();
  const { updateUpdate } = useUpdateUpdate();
  const { deleteUpdate } = useDeleteUpdate();

  const [editedUpdate, setEditedUpdate] = useState<Partial<Update>>(
    getInitialUpdate(update),
  );
  const [isEditing, setIsEditing] = useState(!update.id);
  const [toolbarFormatting, setToolbarFormatting] = useState<StringMap>();

  const toolbarId = `update-toolbar-${editedUpdate.id || "new"}`;
  const tintClasses = getTintClasses(editedUpdate.tint);

  const onUpdateField = (fields: Partial<Update>) => {
    setEditedUpdate((current) => ({ ...current, ...fields }));
  };

  if (!currentPocketbook) {
    return null;
  }

  const resolvedColour = colour ?? currentPocketbook.colour ?? colours.blue;

  const onDone = async () => {
    if (editedUpdate.id) {
      const updated = await updateUpdate({
        updateId: editedUpdate.id,
        updateData: {
          content: editedUpdate.content,
          tint: editedUpdate.tint,
          isWaypoint: editedUpdate.isWaypoint,
          notes: editedUpdate.notes as Note[],
        },
      });
      if (updated) {
        setEditedUpdate(updated);
      }
      setIsEditing(false);
    } else {
      // New update — create explicitly now
      const created = await createUpdate({
        createUpdateData: {
          content: editedUpdate.content!,
          tint: editedUpdate.tint ?? null,
          notes: (editedUpdate.notes ?? []) as Note[],
          isWaypoint: editedUpdate.isWaypoint ?? false,
        },
      });
      if (created) {
        setEditedUpdate(created);
        onCreated?.();
      }
    }
  };

  const onCancelEdit = () => {
    if (!editedUpdate.id) {
      onCancel?.();
    } else {
      setEditedUpdate(getInitialUpdate(update));
      setIsEditing(false);
    }
  };

  const onDelete = async () => {
    if (editedUpdate.id) {
      await deleteUpdate({ updateId: editedUpdate.id });
    } else {
      onCancel?.();
    }
  };

  const dateStr = editedUpdate.created
    ? editedUpdate.created.format(
        showTimeOnly ? "h:mm a" : "D MMM YYYY, h:mm a",
      )
    : null;

  return (
    <UpdateTimelineItem
      iconName={editedUpdate.isWaypoint ? "flagBannerFold" : "chatCenteredText"}
      iconColour={editedUpdate.isWaypoint ? tintClasses.colour : colours.grey}
      strongIcon={editedUpdate.isWaypoint}
      dateText={dateStr}
      showBottomPadding={showBottomPadding}
      headline={
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-slate-500">
            {editedUpdate.notes?.length
              ? "Commented on"
              : "Left a general comment"}
          </p>

          {showNotes &&
            (editedUpdate.notes ?? []).map((note) =>
              pocketbookId ? (
                <Link
                  key={note.id}
                  to="/$pocketbookId/notes"
                  params={{ pocketbookId }}
                  search={{ noteId: note.id }}
                  className="underline flex items-center gap-1 text-slate-600 hover:text-slate-800"
                >
                  {note.title ?? "Untitled Note"}
                </Link>
              ) : (
                <span
                  key={note.id}
                  className="underline flex items-center gap-1 text-slate-600"
                >
                  {note.title ?? "Untitled Note"}
                </span>
              ),
            )}
        </div>
      }
    >
      <div
        className={cn(
          "rounded-xl p-2 flex flex-col border drop-shadow-sm",
          isEditing
            ? "bg-white border-slate-200 gap-2"
            : cn(tintClasses.card, tintClasses.border),
        )}
      >
        {isEditing && (
          <div className="flex items-center justify-between flex-wrap gap-2">
            <NoteSelect
              selectedNotes={(editedUpdate.notes ?? []) as Note[]}
              colour={resolvedColour}
              onChange={(notes) => onUpdateField({ notes })}
            />

            <div className="flex gap-1.5 items-center">
              <Toggle
                isToggled={editedUpdate.isWaypoint ?? false}
                onClick={() =>
                  onUpdateField({
                    isWaypoint: !(editedUpdate.isWaypoint ?? false),
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
                  editedUpdate.tint === null
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
                    editedUpdate.tint === value
                      ? "border-slate-600"
                      : "border-transparent",
                  )}
                  title={value}
                />
              ))}
            </div>
          </div>
        )}

        {isEditing && (
          <QuillFormattingToolbar
            toolbarId={toolbarId}
            toolbarFormatting={toolbarFormatting}
            colour={resolvedColour}
          />
        )}

        <QuillEditor
          toolbarId={toolbarId}
          value={editedUpdate.content}
          colour={resolvedColour}
          onFocus={() => setIsEditing(true)}
          autoFocus={autoFocus}
          onChange={(delta) => onUpdateField({ content: delta })}
          onSelectedFormattingChange={(formatting) =>
            setToolbarFormatting(formatting)
          }
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
