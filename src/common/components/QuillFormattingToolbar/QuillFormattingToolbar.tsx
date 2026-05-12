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
import { QuillFormattingToolbarButton } from "./QuillFormattingToolbarButton";
import type { StringMap } from "quill";
import type { Colour } from "src/colours/Colour.type";

type QuillFormattingToolbarProps = {
  toolbarId: string;
  toolbarFormatting?: StringMap;
  colour: Colour;
};

export const QuillFormattingToolbar = ({
  toolbarId,
  toolbarFormatting,
  colour,
}: QuillFormattingToolbarProps) => {
  return (
    <div
      className="w-full h-fit"
      id={toolbarId}
      onMouseDown={(e) => e.preventDefault()}
    >
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
          ...(toolbarFormatting?.list === "ordered" ? ["ordered"] : []),
          ...(toolbarFormatting?.list === "bullet" ? ["bullet"] : []),
          ...(toolbarFormatting?.blockquote ? ["blockquote"] : []),
          ...(toolbarFormatting?.["code-block"] ? ["code-block"] : []),
          ...(toolbarFormatting?.link ? ["link"] : []),
        ]}
        aria-label="Text formatting"
      >
        <div className="ql-formats flex flex-row gap-1 pr-1 border-r-2 border-slate-100">
          <QuillFormattingToolbarButton value="bold" colour={colour}>
            <TextB size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="italic" colour={colour}>
            <TextItalic size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="underline" colour={colour}>
            <TextUnderline size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="strike" colour={colour}>
            <TextStrikethrough size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="code" colour={colour}>
            <Code size={16} weight="bold" />
          </QuillFormattingToolbarButton>
        </div>

        <div className="flex flex-row gap-1 px-1 pr-1 border-r-2 border-slate-100">
          <QuillFormattingToolbarButton value="ordered" colour={colour}>
            <ListNumbers size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="bullet" colour={colour}>
            <ListBullets size={16} weight="bold" />
          </QuillFormattingToolbarButton>
        </div>

        <div className="flex flex-row gap-1 px-1 pr-1">
          <QuillFormattingToolbarButton value="link" colour={colour}>
            <LinkSimple size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="blockquote" colour={colour}>
            <Quotes size={16} weight="bold" />
          </QuillFormattingToolbarButton>
          <QuillFormattingToolbarButton value="code-block" colour={colour}>
            <CodeBlock size={16} weight="bold" />
          </QuillFormattingToolbarButton>
        </div>
      </ToggleGroup.Root>
    </div>
  );
};
