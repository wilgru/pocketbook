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
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { Input } from "src/common/components/Input/Input";
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
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

// TODO: merge the shared part of this with the comment editor toolbar and move that part into a general toolbar component
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
      <div className="flex text-sm font-medium">
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

        <div className="flex flex-row gap-1 border-r-2 border-slate-100 px-1 pr-1">
          <Button
            value="ordered"
            colour={colour}
            variant="ghost"
            shape="square"
            size="sm"
            active={toolbarFormatting?.ordered}
            onClick={() =>
              executeLexicalToolbarAction(editorContext, "ordered")
            }
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

        <div className="flex flex-row gap-1 px-1 pr-1">
          <ControlPopover
            onOpenChange={handleLinkPopoverOpenChange}
            onOpenAutoFocus={(event) => event.preventDefault()}
            trigger={
              <span onMouseDownCapture={handleLinkTriggerMouseDown}>
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
      </div>
    </div>
  );
};
