import {
  ArrowLeft,
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
import { $getSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
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
};

export const FormattingToolbar = ({
  toolbarFormatting,
  editor,
  colour,
  isEditorFocused,
}: FormattingToolbarProps) => {
  const [isLinkEditing, setIsLinkEditing] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedSelectionRef = useRef<BaseSelection | null>(null);

  // When the editor regains focus, reset the link editor so the
  // normal formatting toolbar is shown (not a stale link editor).
  useEffect(() => {
    if (isEditorFocused) {
      setIsLinkEditing(false);
      setLinkUrl("");
      savedSelectionRef.current = null;
    }
  }, [isEditorFocused]);

  const openLinkEditor = () => {
    editor?.getEditorState().read(() => {
      savedSelectionRef.current = $getSelection()?.clone() ?? null;
    });
    setLinkUrl("");
    setIsLinkEditing(true);
  };

  const closeLinkEditor = () => {
    setIsLinkEditing(false);
    setLinkUrl("");
    savedSelectionRef.current = null;
  };

  const handleLinkClick = () => {
    if (toolbarFormatting?.link) {
      openLinkEditor();
      return;
    }
    openLinkEditor();
  };

  const handleLinkSave = () => {
    executeLexicalToolbarAction(
      editor,
      "link",
      linkUrl,
      savedSelectionRef.current,
    );
    closeLinkEditor();
  };

  const handleLinkRemove = () => {
    executeLexicalToolbarAction(editor, "link");
    closeLinkEditor();
  };

  if (isLinkEditing) {
    return (
      <div className="w-full h-fit" onMouseDown={(e) => e.preventDefault()}>
        <ToggleGroup.Root
          className="font-medium text-sm flex items-center gap-1"
          type="multiple"
          value={[]}
          aria-label="Link editing"
        >
          <FormattingToolbarButton
            value="back"
            colour={colour}
            onClick={closeLinkEditor}
          >
            <ArrowLeft size={16} weight="bold" />
          </FormattingToolbarButton>

          <div
            className="flex flex-row gap-1 px-1 border-l-2 border-slate-100 flex-1"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLinkSave();
                if (e.key === "Escape") closeLinkEditor();
              }}
              placeholder="https://example.com"
              className="flex-1 min-w-0 text-sm px-2 py-1 rounded-md border border-slate-300 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex flex-row gap-1 pl-1">
            <FormattingToolbarButton
              value="save"
              colour={colour}
              onClick={handleLinkSave}
            >
              <Check size={16} weight="bold" />
            </FormattingToolbarButton>

            {toolbarFormatting?.link && (
              <FormattingToolbarButton
                value="remove"
                colour={colour}
                onClick={handleLinkRemove}
              >
                <LinkBreak size={16} weight="bold" />
              </FormattingToolbarButton>
            )}
          </div>
        </ToggleGroup.Root>
      </div>
    );
  }

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
          <FormattingToolbarButton
            value="link"
            colour={colour}
            onClick={handleLinkClick}
          >
            <LinkSimple size={16} weight="bold" />
          </FormattingToolbarButton>
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
