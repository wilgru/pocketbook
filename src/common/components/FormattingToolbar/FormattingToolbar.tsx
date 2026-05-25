import {
  Code,
  CodeBlock,
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
import { executeLexicalToolbarAction } from "src/common/utils/lexicalToolbarCommands";
import { FormattingToolbarButton } from "./FormattingToolbarButton";
import type { LexicalEditor } from "lexical";
import type { Colour } from "src/colours/Colour.type";
import type { LexicalToolbarFormatting } from "src/common/utils/lexicalFormatting";

type FormattingToolbarProps = {
  toolbarFormatting?: LexicalToolbarFormatting;
  editor: LexicalEditor | null;
  colour: Colour;
};

export const FormattingToolbar = ({
  toolbarFormatting,
  editor,
  colour,
}: FormattingToolbarProps) => {
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
            onClick={() => executeLexicalToolbarAction(editor, "link")}
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
