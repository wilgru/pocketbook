import type { ControlIconName } from "./controlIcons.constant";
import type { CustomisationIconName } from "./customisationIcons.constant";

// called IconType instead of Icon to avoid naming conflicts with the Icon component
export type IconType = {
  name: string;
  component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  // useCase: "control" | "customisation";
  fixedWeight?: "bold" | "fill" | "regular";
};

export type IconName = ControlIconName | CustomisationIconName;
