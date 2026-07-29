import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { customisationIcons } from "src/icons/customisationIcons.constant";
import type { Colour } from "src/colours/Colour.type";
import type { CustomisationIconName } from "src/icons/customisationIcons.constant";

type IconPickerProps = {
  selectedIconName: CustomisationIconName | null;
  allowNoIcon?: boolean;
  colour: Colour;
  onSelectIcon: (iconName: CustomisationIconName | null) => void;
};

export default function IconPicker({
  selectedIconName,
  allowNoIcon = false,
  colour,
  onSelectIcon,
}: IconPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {customisationIcons.map((customisationIcon) => (
        <button
          key={customisationIcon.name}
          onClick={() => onSelectIcon(customisationIcon.name)}
          className={cn(
            "flex justify-center items-center h-8 w-8 p-1 rounded-full",
            selectedIconName === customisationIcon.name &&
              colour.backgroundPill,
          )}
        >
          <Icon
            iconName={customisationIcon.name}
            weight={
              selectedIconName === customisationIcon.name ? "fill" : "regular"
            }
            className={cn(colour.textPill)}
          />
        </button>
      ))}

      {allowNoIcon && (
        <button
          onClick={() => onSelectIcon(null)}
          className={cn(
            "flex justify-center items-center h-8 w-8 p-1 rounded-full",
            selectedIconName === null && "bg-gray-100",
          )}
        >
          <Icon
            iconName="empty"
            weight={selectedIconName === null ? "fill" : "regular"}
            className={
              selectedIconName === null ? "fill-gray-400" : "fill-gray-300"
            }
          />
        </button>
      )}
    </div>
  );
}
