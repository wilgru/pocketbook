import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { icons } from "src/icons/icons.constant";
import type { Colour } from "src/colours/Colour.type";

type IconPickerProps = {
  selectedIconName: string;
  allowNoIcon?: boolean;
  colour: Colour;
  onSelectIcon: (iconName: string) => void;
};

export default function IconPicker({
  selectedIconName,
  allowNoIcon = false,
  colour,
  onSelectIcon,
}: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {icons.map((icon) => (
        <button
          key={icon.name}
          onClick={() => onSelectIcon(icon.name)}
          className={cn(
            "flex justify-center items-center h-8 w-8 p-1 rounded-full",
            selectedIconName === icon.name && colour.backgroundPill,
          )}
        >
          <Icon
            iconName={icon.name}
            weight={selectedIconName === icon.name ? "fill" : "regular"}
            className={cn(colour.textPill)}
          />
        </button>
      ))}

      {allowNoIcon && (
        <button
          onClick={() => onSelectIcon("")}
          className={cn(
            "flex justify-center items-center h-8 w-8 p-1 rounded-full",
            selectedIconName === "" && "bg-gray-100",
          )}
        >
          <Icon
            iconName="empty"
            weight={selectedIconName === "" ? "fill" : "regular"}
            className={
              selectedIconName === "" ? "fill-gray-400" : "fill-gray-300"
            }
          />
        </button>
      )}
    </div>
  );
}
