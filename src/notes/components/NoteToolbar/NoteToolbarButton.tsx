import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import type { Colour } from "src/colours/Colour.type";

type FormattingToolbarButtonProps = {
  children: React.ReactNode;
  value: string;
  colour?: Colour;
  onClick?: () => void;
};

export const FormattingToolbarButton = ({
  children,
  value,
  colour = colours.orange,
  onClick,
}: FormattingToolbarButtonProps) => {
  return (
    <ToggleGroup.Item
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      className={cn(
        "rounded-md text-slate-400 px-2 py-1",
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
