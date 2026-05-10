import {
  Gear,
  Pencil,
  Plus,
  PlusSquare,
  X,
  Bookmark,
  PushPin,
  Trash,
  DotsThree,
  ChatCircle,
  ArrowsDownUp,
  UserCircle,
  House,
  SlidersHorizontal,
  CaretLeft,
  CaretRight,
  CalendarDot,
  CalendarDots,
  ArrowLineLeft,
  ArrowLineRight,
  Circle,
  Link,
  CheckCircle,
  MinusCircle,
  XCircle,
  ListChecks,
  ArrowArcLeft,
  ArrowArcRight,
  Paperclip,
  Info,
  Notebook,
  ArrowCircleRight,
  ExclamationMark,
  WarningCircle,
  CaretUp,
  CaretDown,
  DotsThreeOutline,
} from "@phosphor-icons/react";
import { ChatCenteredText } from "@phosphor-icons/react/dist/ssr";
import { icons } from "src/icons/icons.constant";

type IconProps = {
  iconName: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  weight?: "fill" | "regular";
};

enum IconSize {
  "xs" = 14,
  "sm" = 18,
  "md" = 24,
  "lg" = 32,
  "xl" = 40,
}

const Icon = ({
  iconName,
  size = "md",
  weight = "fill",
  className,
}: IconProps) => {
  const iconSize = IconSize[size];

  const iconProps = { size: iconSize, weight, className };

  const icon = icons.find((icon) => icon.name === iconName);

  if (icon) {
    return <icon.icon {...iconProps} />;
  }

  switch (iconName) {
    case "pushPin":
      return <PushPin {...iconProps} />;
    case "bookmark":
      return <Bookmark {...iconProps} />;
    case "trash":
      return <Trash {...iconProps} />;
    case "pencil":
      return <Pencil {...iconProps} />;
    case "chatCenteredText":
      return <ChatCenteredText {...iconProps} />;
    case "x":
      return <X {...iconProps} weight="bold" />;
    case "gear":
      return <Gear {...iconProps} />;
    case "plus":
      return <Plus {...iconProps} weight="bold" />;
    case "plusSquare":
      return <PlusSquare {...iconProps} />;
    case "dotsThree":
      return <DotsThree {...iconProps} weight="bold" />;
    case "chatCircle":
      return <ChatCircle {...iconProps} />;
    case "arrowsDownUp":
      return <ArrowsDownUp {...iconProps} />;
    case "house":
      return <House {...iconProps} />;
    case "notebook":
      return <Notebook {...iconProps} />;
    case "calendarDot":
      return <CalendarDot {...iconProps} />;
    case "calendarDots":
      return <CalendarDots {...iconProps} />;
    case "user":
      return <UserCircle {...iconProps} />;
    case "slidersHorizontal":
      return <SlidersHorizontal {...iconProps} />;
    case "caretLeft":
      return <CaretLeft {...iconProps} />;
    case "caretRight":
      return <CaretRight {...iconProps} />;
    case "arrowLineRight":
      return <ArrowLineRight {...iconProps} />;
    case "arrowLineLeft":
      return <ArrowLineLeft {...iconProps} />;
    case "circle":
      return <Circle {...iconProps} />;
    case "link":
      return <Link {...iconProps} weight="regular" />;
    case "paperclip":
      return <Paperclip {...iconProps} weight="regular" />;
    case "checkCircle":
      return <CheckCircle {...iconProps} />;
    case "minusCircle":
      return <MinusCircle {...iconProps} />;
    case "xCircle":
      return <XCircle {...iconProps} />;
    case "listChecks":
      return <ListChecks {...iconProps} />;
    case "arrowArcLeft":
      return <ArrowArcLeft {...iconProps} />;
    case "arrowArcRight":
      return <ArrowArcRight {...iconProps} />;
    case "arrowCircleRight":
      return <ArrowCircleRight {...iconProps} />;
    case "info":
      return <Info {...iconProps} />;
    case "exclamationMark":
      return <ExclamationMark {...iconProps} weight="regular" />;
    case "warningCircle":
      return <WarningCircle {...iconProps} />;
    case "caretUp":
      return <CaretUp {...iconProps} />;
    case "caretDown":
      return <CaretDown {...iconProps} />;
    case "dotsThreeOutline":
      return <DotsThreeOutline {...iconProps} weight="fill" />;
    default:
      return <></>;
  }
};

export { Icon };
