import { cn } from "cn";
import type { Colour } from "src/colours/Colour.type";

type ColourButtonProps = {
  colour: Colour;
  selected: boolean;
  onClick: (colour: Colour) => void;
};

export const ColourPickerColourButton = ({
  colour,
  selected,
  onClick,
}: ColourButtonProps) => {
  return (
    <button
      onClick={() => onClick(colour)}
      className={cn(
        "flex justify-center items-center h-6 w-6 rounded-full",
        colour.background,
      )}
    >
      {selected && <div className="h-2 w-2 rounded-full bg-white" />}
    </button>
  );
};
