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
import { cn } from "cn";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
import { FormattingToolbarButton } from "./NoteToolbarButton";
import type { BaseSelection, LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type NoteToolbarProps = {
  editorContext: LexicalEditor | null;
  toolbarFormatting: LexicalToolbarFormatting | undefined;
  colour: Colour;
  fullWidth?: boolean;
  isToolbarBusy: boolean;
  onToolbarBusyChange: (isBusy: boolean) => void;
};

export const NoteToolbar = ({
  editorContext,
  toolbarFormatting,
  colour,
  fullWidth = true,
  isToolbarBusy,
  onToolbarBusyChange,
}: NoteToolbarProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  useEffect(() => {
    if (isToolbarBusy) {
      return;
    }

    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });
  }, [isToolbarBusy]);

  const saveSelectionSnapshot = () => {
    editorContext?.getEditorState().read(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        return;
      }

      savedSelectionRef.current = selection.clone();
    });
  };

  const handleLinkTriggerMouseDown = () => {
    saveSelectionSnapshot();
  };

  const handleLinkPopoverOpenChange = (open: boolean) => {
    onToolbarBusyChange(open);

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

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;

    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }

    event.preventDefault();
  };

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 mt-auto h-fit border-t border-slate-200 bg-white py-3",
        fullWidth && "w-full",
      )}
      onMouseDown={handleMouseDown}
    >
      <ToggleGroup.Root
        className="flex text-sm font-medium"
        type="multiple"
        defaultValue={[]}
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
        <div className="flex flex-row gap-1 border-r-2 border-slate-100 pr-1">
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

        <div className="flex flex-row gap-1 border-r-2 border-slate-100 px-1 pr-1">
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

        <div className="flex flex-row gap-1 px-1 pr-1">
          <ControlPopover
            onOpenChange={handleLinkPopoverOpenChange}
            onOpenAutoFocus={(event) => event.preventDefault()}
            trigger={
              <span onMouseDownCapture={handleLinkTriggerMouseDown}>
                <FormattingToolbarButton value="link" colour={colour}>
                  <LinkSimple size={16} weight="bold" />
                </FormattingToolbarButton>
              </span>
            }
            className="w-90 p-3"
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
                  if (event.key === "Enter") {
                    handleLinkSave();
                  }
                  if (event.key === "Escape") {
                    handleLinkPopoverOpenChange(false);
                  }
                }}
                placeholder="https://example.com"
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-hidden"
              />

              <button
                type="button"
                className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                onClick={handleLinkSave}
                aria-label="Save link"
              >
                <Check size={16} weight="bold" />
              </button>

              {toolbarFormatting?.link && (
                <button
                  type="button"
                  className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
    </div>
  );
};
