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
                "inline-block overflow-hidden transition-all duration-300 ease-in-out max-w-[10rem] opacity-100",
              )}
            >
              {tag.name}
            </span>
          )}
        </Button>
      ) : (
        // TODO: refactor to remove duplicate styling code between this and the Button version
        <div
          className={cn(
            "h-fit w-fit flex items-center gap-2 rounded-full transition-colors",
            size === "xs" && "text-[0.625rem] font-normal py-0.5 pl-0.5 pr-1",
            size === "sm" && "text-xs font-normal py-1 pl-1 pr-2",
            size === "md" && "text-sm font-medium py-2 pl-2 pr-3",
            size === "lg" && "text-md font-medium py-3 pl-3 pr-4",
            variant === "block" && tag.colour.textPill,
            variant === "block" && tag.colour.backgroundPill,
            variant === "block" && tag.colour.textPillInverted,
            variant === "block" && tag.colour.backgroundPillInverted,
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
                "inline-block overflow-hidden transition-all duration-300 ease-in-out max-w-[10rem] opacity-100",
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
