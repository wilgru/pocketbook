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
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { getColour } from "src/colours/utils/getColour";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { Toggle } from "src/common/components/Toggle/Toggle";
import { cn } from "src/common/utils/cn";
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
import { NoteSelect } from "src/notes/components/NoteSelect/NoteSelect";
import { FormattingToolbarButton } from "src/notes/components/NoteToolbar/NoteToolbarButton";
import type { BaseSelection, LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { Comment } from "src/comments/Comment.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type CommentToolbarProps = {
  editorContext: LexicalEditor | null;
  toolbarFormatting: LexicalToolbarFormatting | undefined;
  colour: Colour;
  comment: Partial<Comment>;
  onCommentChange: (fields: Partial<Comment>) => void;
  onDelete: () => void;
  onSave: () => void;
};

const TINT_OPTIONS = [
  colours.red,
  colours.yellow,
  colours.green,
  colours.blue,
] as const;

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
  const tint = comment.tint ?? null;
  const waypointColour = tint ? getColour(tint) : colours.grey;

  useEffect(() => {
    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });
  }, []);

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

  return (
    <div
      className="flex flex-row flex-wrap items-center gap-1.5 border-t border-slate-200 pt-2 mt-2"
      onMouseDown={(event) => {
        const target = event.target as HTMLElement | null;

        if (
          !target?.closest("input, textarea, select, [contenteditable='true']")
        ) {
          event.preventDefault();
        }
      }}
    >
      <ToggleGroup.Root
        className="flex flex-row flex-wrap gap-1.5 pr-1 border-r-2 border-slate-100"
        type="multiple"
        value={[
          ...(toolbarFormatting?.bold ? ["bold"] : []),
          ...(toolbarFormatting?.italic ? ["italic"] : []),
          ...(toolbarFormatting?.underline ? ["underline"] : []),
          ...(toolbarFormatting?.strike ? ["strike"] : []),
          ...(toolbarFormatting?.code ? ["code"] : []),
          ...(toolbarFormatting?.ordered ? ["ordered"] : []),
          ...(toolbarFormatting?.bullet ? ["bullet"] : []),
          ...(toolbarFormatting?.blockquote ? ["blockquote"] : []),
          ...(toolbarFormatting?.codeBlock ? ["code-block"] : []),
          ...(toolbarFormatting?.link ? ["link"] : []),
        ]}
        aria-label="Text formatting"
      >
        <div className="flex flex-row gap-1 pr-1 border-r-2 border-slate-100">
          <FormattingToolbarButton
            value="bold"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editorContext, "bold")}
          >
            <TextB size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="italic"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editorContext, "italic")}
          >
            <TextItalic size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="underline"
            colour={colour}
            onClick={() =>
              executeLexicalToolbarAction(editorContext, "underline")
            }
          >
            <TextUnderline size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="strike"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editorContext, "strike")}
          >
            <TextStrikethrough size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="code"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editorContext, "code")}
          >
            <Code size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>
        <div className="flex flex-row gap-1 pr-1 border-r-2 border-slate-100">
          <FormattingToolbarButton
            value="ordered"
            colour={colour}
            onClick={() =>
              executeLexicalToolbarAction(editorContext, "ordered")
            }
          >
            <ListNumbers size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="bullet"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editorContext, "bullet")}
          >
            <ListBullets size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>
        <div className="flex flex-row gap-1">
          <ControlPopover
            onOpenChange={handleLinkPopoverOpenChange}
            onOpenAutoFocus={(event) => event.preventDefault()}
            trigger={
              <span onMouseDownCapture={saveSelectionSnapshot}>
                <FormattingToolbarButton value="link" colour={colour}>
                  <LinkSimple size={16} weight="bold" />
                </FormattingToolbarButton>
              </span>
            }
            className="p-3 w-90"
          >
            <div
              className="flex items-center gap-1"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleLinkSave();
                  if (event.key === "Escape")
                    handleLinkPopoverOpenChange(false);
                }}
                placeholder="https://example.com"
                className="flex-1 min-w-0 text-sm px-2 py-1 rounded-md border border-slate-300 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400"
              />
              <button
                type="button"
                className="rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 transition-colors"
                onClick={handleLinkSave}
                aria-label="Save link"
              >
                <Check size={16} weight="bold" />
              </button>
              {toolbarFormatting?.link && (
                <button
                  type="button"
                  className="rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 transition-colors"
                  onClick={handleLinkRemove}
                  aria-label="Remove link"
                >
                  <LinkBreak size={16} weight="bold" />
                </button>
              )}
            </div>
          </ControlPopover>
          <FormattingToolbarButton
            value="blockquote"
            colour={colour}
            onClick={() =>
              executeLexicalToolbarAction(editorContext, "blockquote")
            }
          >
            <Quotes size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="code-block"
            colour={colour}
            onClick={() =>
              executeLexicalToolbarAction(editorContext, "code-block")
            }
          >
            <CodeBlock size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>
      </ToggleGroup.Root>

      <div className="flex flex-row flex-wrap items-center gap-1.5 pr-1 border-r-2 border-slate-100">
        <NoteSelect
          selectedNotes={selectedNotes}
          colour={colour}
          onChange={(notes) => onCommentChange({ notes })}
        />
        <Toggle
          isToggled={isWaypoint}
          onClick={() => onCommentChange({ isWaypoint: !isWaypoint })}
          size="sm"
          colour={waypointColour}
          iconName="flagBannerFold"
        />
        <button
          type="button"
          onClick={() => onCommentChange({ tint: null })}
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
            onClick={() => onCommentChange({ tint: tintOption.name })}
            className={cn(
              "h-5 w-5 rounded-full border-2",
              tintOption.background,
              tint === tintOption.name
                ? "border-slate-600"
                : "border-transparent",
            )}
            title={tintOption.name}
          />
        ))}
      </div>

      <div className="flex flex-row items-center gap-1.5">
        <Button
          iconName="trash"
          size="sm"
          variant="ghost"
          colour={colours.red}
          onClick={onDelete}
        />

        <Button
          iconName="check"
          size="sm"
          variant="ghost"
          colour={colour}
          onClick={onSave}
        />
      </div>
    </div>
  );
};
