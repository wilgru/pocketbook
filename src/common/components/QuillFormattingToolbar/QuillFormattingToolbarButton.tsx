import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useCallback } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import type { Colour } from "src/colours/Colour.type";

type QuillFormattingToolbarButtonProps = {
  children: React.ReactNode;
  value: string;
  colour?: Colour;
};

const QUILL_FORMAT_CLASS: Record<string, string> = {
  ordered: "ql-list",
  bullet: "ql-list",
};

export const QuillFormattingToolbarButton = ({
  children,
  value,
  colour = colours.orange,
}: QuillFormattingToolbarButtonProps) => {
  const quillClass = QUILL_FORMAT_CLASS[value] ?? `ql-${value}`;

  const refCallback = useCallback(
    (el: HTMLButtonElement | null) => {
      if (el) {
        el.value = value;
      }
    },
    [value],
  );

  return (
    <ToggleGroup.Item
      ref={refCallback}
      className={cn(
        quillClass,
        "rounded-md text-slate-500 px-2 py-1",
        `hover:${colour.backgroundPill}`,
        `hover:${colour.textPill}`,
        `data-[state=on]:${colour.backgroundPill}`,
        `data-[state=on]:${colour.textPill}`,
      )}
      value={value}
    >
      {children}
    </ToggleGroup.Item>
  );
};
