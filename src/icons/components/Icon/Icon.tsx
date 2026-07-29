import { controlIcons } from "src/icons/controlIcons.constant";
import { customisationIcons } from "src/icons/customisationIcons.constant";
import type { IconName, IconType } from "src/icons/Icon.type";

type IconProps = {
  iconName: IconName | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  weight?: "fill" | "regular";
};

enum IconSize {
  xs = 14,
  sm = 18,
  md = 24,
  lg = 32,
  xl = 40,
}

const allIcons = [...controlIcons, ...customisationIcons];

const Icon = ({
  iconName,
  size = "md",
  weight = "fill",
  className,
}: IconProps) => {
  if (!iconName) {
    return <></>;
  }

  const iconSize = IconSize[size];
  const icon = allIcons.find(
    (searchIcon) => searchIcon.name === iconName,
  ) as IconType;

  const iconProps = {
    size: iconSize,
    weight: icon?.fixedWeight ?? weight,
    className,
  };

  return <icon.component {...iconProps} />;
};

export { Icon };
