import {
  Check,
  Code,
  CodeBlock,
  LinkBreak,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Quotes,
  TextB,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { Input } from "src/common/components/Input/Input";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import type { BaseSelection, LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/comments.schema";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type CommentToolbarProps = {
  editorContext: LexicalEditor | null;
  toolbarFormatting: LexicalToolbarFormatting | undefined;
  colour: Colour;
  comment: Pick<Comment, "notes" | "isWaypoint" | "colour">;
  onCommentChange: (
    fields: Partial<Pick<Comment, "notes" | "isWaypoint" | "colour">>,
  ) => void;
  onDelete: () => void;
  onSave: () => void;
};

const TINT_OPTIONS = [
  colours.red,
  colours.yellow,
  colours.green,
  colours.blue,
] as const;

// TODO: merge the shared part of this with the note editor toolbar and move that part into a general toolbar component
export const CommentToolbar = ({
  editorContext,
  toolbarFormatting,
  colour,
  comment,
  onCommentChange,
  onDelete,
  onSave,
}: CommentToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  const selectedNotes = comment.notes ?? [];
  const isWaypoint = comment.isWaypoint ?? false;
  const tint = comment.colour ?? null;
  const waypointColour = tint ?? colours.grey;

  useEffect(() => {
    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;

    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    event.preventDefault();
  };

  const saveSelectionSnapshot = () => {
    editorContext?.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        savedSelectionRef.current = selection.clone();
      }
    });
  };

  const handleLinkPopoverOpenChange = (open: boolean) => {
    if (open) {
      if (!savedSelectionRef.current) {
        saveSelectionSnapshot();
      }
      setLinkUrl("");
      return;
    }

    setLinkUrl("");
    savedSelectionRef.current = null;
    editorContext?.focus();
  };

  const handleLinkSave = () => {
    executeLexicalToolbarAction(
      editorContext,
      "link",
      linkUrl,
      savedSelectionRef.current,
    );
    handleLinkPopoverOpenChange(false);
  };

  const handleLinkRemove = () => {
    executeLexicalToolbarAction(editorContext, "link");
    handleLinkPopoverOpenChange(false);
  };

  const handleRemoveNote = (noteId: string) => {
    const newNotes = selectedNotes.filter((note) => note.id !== noteId);
    onCommentChange({
      ...comment,
      notes: newNotes,
    });
  };

  return (
    <div
      className="flex flex-row flex-wrap items-center gap-1.5 border-t border-slate-200 pt-2"
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-row gap-1 border-r-2 border-slate-100 pr-1">
        <Button
          value="bold"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.bold}
          onClick={() => executeLexicalToolbarAction(editorContext, "bold")}
        >
          <TextB size={16} weight="bold" />
        </Button>

        <Button
          value="italic"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.italic}
          onClick={() => executeLexicalToolbarAction(editorContext, "italic")}
        >
          <TextItalic size={16} weight="bold" />
        </Button>

        <Button
          value="underline"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.underline}
          onClick={() =>
            executeLexicalToolbarAction(editorContext, "underline")
          }
        >
          <TextUnderline size={16} weight="bold" />
        </Button>

        <Button
          value="strike"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.strike}
          onClick={() => executeLexicalToolbarAction(editorContext, "strike")}
        >
          <TextStrikethrough size={16} weight="bold" />
        </Button>

        <Button
          value="code"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.code}
          onClick={() => executeLexicalToolbarAction(editorContext, "code")}
        >
          <Code size={16} weight="bold" />
        </Button>
      </div>

      <div className="flex flex-row gap-1 border-r-2 border-slate-100 pr-1">
        <Button
          value="ordered"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.ordered}
          onClick={() => executeLexicalToolbarAction(editorContext, "ordered")}
        >
          <ListNumbers size={16} weight="bold" />
        </Button>
        <Button
          value="bullet"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.bullet}
          onClick={() => executeLexicalToolbarAction(editorContext, "bullet")}
        >
          <ListBullets size={16} weight="bold" />
        </Button>
      </div>

      <div className="flex flex-row gap-1 border-r-2 border-slate-100 pr-1">
        <ControlPopover
          onOpenChange={handleLinkPopoverOpenChange}
          onOpenAutoFocus={(event) => event.preventDefault()}
          trigger={
            <span onMouseDownCapture={saveSelectionSnapshot}>
              <Button
                value="link"
                colour={colour}
                variant="ghost"
                shape="square"
                size="sm"
                active={toolbarFormatting?.link}
              >
                <LinkSimple size={16} weight="bold" />
              </Button>
            </span>
          }
          className="w-90 p-3"
        >
          <div
            className="flex items-center gap-1"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(event) => setLinkUrl(event.target.value)}
              placeholder="https://example.com"
            />

            <Button
              colour={colour}
              variant="ghost"
              shape="square"
              size="sm"
              onClick={handleLinkSave}
              aria-label="Save link"
            >
              <Check size={16} weight="bold" />
            </Button>

            {toolbarFormatting?.link && (
              <Button
                colour={colour}
                variant="ghost"
                shape="square"
                size="sm"
                onClick={handleLinkRemove}
                aria-label="Remove link"
              >
                <LinkBreak size={16} weight="bold" />
              </Button>
            )}
          </div>
        </ControlPopover>

        <Button
          value="blockquote"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.blockquote}
          onClick={() =>
            executeLexicalToolbarAction(editorContext, "blockquote")
          }
        >
          <Quotes size={16} weight="bold" />
        </Button>

        <Button
          value="code-block"
          colour={colour}
          variant="ghost"
          shape="square"
          size="sm"
          active={toolbarFormatting?.codeBlock}
          onClick={() =>
            executeLexicalToolbarAction(editorContext, "code-block")
          }
        >
          <CodeBlock size={16} weight="bold" />
        </Button>
      </div>

      {selectedNotes.map((note) => (
        <button
          key={note.id}
          onClick={() => handleRemoveNote(note.id)}
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
            colour.primary.background,
            colour.primary.text,
            colour.primary.backgroundHovered,
          )}
        >
          <span className="max-w-30 truncate">
            {note.title ?? "Untitled Note"}
          </span>
          <span className="text-xs leading-none">×</span>
        </button>
      ))}

      <NoteSelect
        selectedNotes={selectedNotes}
        colour={colour}
        size="sm"
        onChange={(notes) => onCommentChange({ notes })}
      />

      <Toggle
        isToggled={isWaypoint}
        onClick={() => onCommentChange({ isWaypoint: !isWaypoint })}
        size="sm"
        shape="square"
        colour={waypointColour}
        iconName="flagBannerFold"
      />

      <div className="flex flex-row gap-1 pr-1">
        <button
          type="button"
          onClick={() => onCommentChange({ colour: null })}
          className={cn(
            "h-5 w-5 rounded-full border-2 bg-slate-200",
            tint === null ? "border-slate-500" : "border-transparent",
          )}
          title="No colour"
        />

        {TINT_OPTIONS.map((tintOption) => (
          <button
            key={tintOption.name}
            type="button"
            onClick={() => onCommentChange({ colour: tintOption })}
            className={cn(
              "h-5 w-5 rounded-full border-2",
              tintOption.background,
              tint?.name === tintOption.name
                ? "border-slate-600"
                : "border-transparent",
            )}
            title={tintOption.name}
          />
        ))}
      </div>

      <Button
        iconName="trash"
        size="sm"
        shape="square"
        variant="ghost"
        colour={colours.red}
        onClick={onDelete}
      />

      <Button
        iconName="check"
        size="sm"
        shape="square"
        variant="ghost"
        colour={colour}
        onClick={onSave}
      />
    </div>
  );
};
