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
import * as Popover from "@radix-ui/react-popover";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
import { FormattingToolbarButton } from "./FormattingToolbarButton";
import type { BaseSelection, LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type FormattingToolbarProps = {
  toolbarFormatting?: LexicalToolbarFormatting;
  editor: LexicalEditor | null;
  colour: Colour;
  isEditorFocused?: boolean;
  onLinkPopoverOpenChange?: (open: boolean) => void;
};

export const FormattingToolbar = ({
  toolbarFormatting,
  editor,
  colour,
  isEditorFocused,
  onLinkPopoverOpenChange,
}: FormattingToolbarProps) => {
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  // When the editor regains focus, reset any stale link editing state.
  useEffect(() => {
    if (isEditorFocused) {
      setIsLinkPopoverOpen(false);
      setLinkUrl("");
      savedSelectionRef.current = null;
    }
  }, [isEditorFocused]);

  useEffect(() => {
    if (!isLinkPopoverOpen) {
      return;
    }

    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });
  }, [isLinkPopoverOpen]);

  const saveSelectionSnapshot = () => {
    editor?.getEditorState().read(() => {
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
    setIsLinkPopoverOpen(open);
    onLinkPopoverOpenChange?.(open);

    if (open) {
      if (!savedSelectionRef.current) {
        saveSelectionSnapshot();
      }
      setLinkUrl("");
      return;
    }

    setLinkUrl("");
    savedSelectionRef.current = null;
  };

  const handleLinkSave = () => {
    executeLexicalToolbarAction(
      editor,
      "link",
      linkUrl,
      savedSelectionRef.current,
    );
    handleLinkPopoverOpenChange(false);
  };

  const handleLinkRemove = () => {
    executeLexicalToolbarAction(editor, "link");
    handleLinkPopoverOpenChange(false);
  };

  return (
    <div className="w-full h-fit" onMouseDown={(e) => e.preventDefault()}>
      <ToggleGroup.Root
        className="font-medium text-sm flex"
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
        <div className="flex flex-row gap-1 pr-1 border-r-2 border-slate-100">
          <FormattingToolbarButton
            value="bold"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "bold")}
          >
            <TextB size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="italic"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "italic")}
          >
            <TextItalic size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="underline"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "underline")}
          >
            <TextUnderline size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="strike"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "strike")}
          >
            <TextStrikethrough size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="code"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "code")}
          >
            <Code size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>

        <div className="flex flex-row gap-1 px-1 pr-1 border-r-2 border-slate-100">
          <FormattingToolbarButton
            value="ordered"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "ordered")}
          >
            <ListNumbers size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="bullet"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "bullet")}
          >
            <ListBullets size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>

        <div className="flex flex-row gap-1 px-1 pr-1">
          <Popover.Root
            open={isLinkPopoverOpen}
            onOpenChange={handleLinkPopoverOpenChange}
          >
            <Popover.Trigger asChild>
              <span onMouseDownCapture={handleLinkTriggerMouseDown}>
                <FormattingToolbarButton value="link" colour={colour}>
                  <LinkSimple size={16} weight="bold" />
                </FormattingToolbarButton>
              </span>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="z-50"
                sideOffset={6}
                align="center"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <ControlPopover className="p-3 w-[360px]">
                  <div
                    className="flex items-center gap-1"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <input
                      ref={linkInputRef}
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLinkSave();
                        }
                        if (e.key === "Escape") {
                          handleLinkPopoverOpenChange(false);
                        }
                      }}
                      placeholder="https://example.com"
                      className="flex-1 min-w-0 text-sm px-2 py-1 rounded-md border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
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
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <FormattingToolbarButton
            value="blockquote"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "blockquote")}
          >
            <Quotes size={16} weight="bold" />
          </FormattingToolbarButton>
          <FormattingToolbarButton
            value="code-block"
            colour={colour}
            onClick={() => executeLexicalToolbarAction(editor, "code-block")}
          >
            <CodeBlock size={16} weight="bold" />
          </FormattingToolbarButton>
        </div>
      </ToggleGroup.Root>
    </div>
  );
};
