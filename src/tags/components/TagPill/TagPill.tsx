import { cva } from "class-variance-authority";
import { useState } from "react";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Tag } from "src/tags/Tag.type";

type TagPillProps = {
  tag: Tag;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "block" | "ghost" | "link";
  closable?: boolean;
  collapsed?: boolean;
  iconClassName?: string;
  onClick?: (id: string) => void;
};

const tagPillVariants = cva(
  [
    "h-fit",
    "w-fit",
    "flex",
    "items-center",
    "rounded-full",
    "transition-colors",
    "focus-visible:outline-solid",
    "focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-orange-500",
  ],
  {
    variants: {
      variant: {
        block: null,
        ghost: "text-slate-500",
        "ghost-strong": "text-slate-400",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        xs: "text-[0.625rem] font-normal gap-1",
        sm: "text-xs font-normal gap-1.5",
        md: "text-sm font-medium gap-2",
        lg: "text-md font-medium gap-3",
      },
      content: {
        text: null,
        icon: null,
        iconAndText: null,
      },
    },
    compoundVariants: [
      // icons only
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "xs",
        className: "p-0.5",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "sm",
        className: "p-1",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "md",
        className: "p-2",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "icon",
        size: "lg",
        className: "p-3",
      },
      //  icons and text
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "xs",
        className: "py-0.5 pl-1 pr-1.5",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "sm",
        className: "py-1 pl-1.5 pr-2",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "md",
        className: "py-2 pl-2 pr-3",
      },
      {
        variant: ["block", "ghost", "ghost-strong"],
        content: "iconAndText",
        size: "lg",
        className: "py-3 pl-3 pr-4",
      },
    ],
    defaultVariants: {
      variant: "block",
      size: "md",
    },
  },
);

export const TagPill = ({
  tag,
  size = "sm",
  variant = "block",
  closable = false,
  collapsed = false,
  iconClassName,
  onClick,
}: TagPillProps): JSX.Element => {
  const [closeButtonVisible, setCloseButtonVisible] = useState<boolean>(false);
  const iconName = closable && closeButtonVisible ? "x" : tag.icon;
  const isClickable = Boolean(onClick);
  const handleClick = onClick ? () => onClick(tag.id) : undefined;

  return (
    <div
      className="h-fit"
      onMouseOver={() => setCloseButtonVisible(true)}
      onMouseOut={() => setCloseButtonVisible(false)}
    >
      {isClickable ? (
        <Button
          variant={variant}
          colour={tag.colour}
          size={size}
          onClick={handleClick}
          iconName={iconName}
        >
          {!collapsed && (
            <span
              className={cn(
                "inline-block overflow-hidden transition-all duration-300 ease-in-out max-w-40 opacity-100",
              )}
            >
              {tag.name}
            </span>
          )}
        </Button>
      ) : (
        <div
          className={cn(
            tagPillVariants({
              size,
              variant,
              content: collapsed ? "icon" : "iconAndText",
            }),
            variant === "block" && tag.colour.primary.text,
            variant === "block" && tag.colour.primary.background,
            variant === "ghost" && "text-slate-400",
            variant === "link" && "underline-offset-4",
          )}
        >
          <Icon
            iconName={iconName}
            size={size}
            weight="regular"
            className={iconClassName}
          />
          {!collapsed && (
            <span
              className={cn(
                "inline-block overflow-hidden transition-all duration-300 ease-in-out max-w-40 opacity-100",
              )}
            >
              {tag.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
