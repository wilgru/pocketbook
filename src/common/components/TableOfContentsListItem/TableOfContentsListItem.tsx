import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import type { ReactNode } from "react";
import { Tooltip } from "src/common/components/Tooltip/Tooltip";
import type { ComponentProps } from "react";
import type { Colour } from "src/colours/Colour.type";

type TableOfContentsListItemProps = {
  title: string;
  children?: ReactNode;
  navigationId?: string | null;
  onClick?: () => void;
  isActive?: boolean; // not using for now
  colour: Colour;
  tooltipContent?: ReactNode;
  tooltipSide?: ComponentProps<typeof Tooltip>["side"];
};

export const TableOfContentsListItem = ({
  title,
  children,
  navigationId,
  onClick,
  colour,
  tooltipContent,
  tooltipSide,
}: TableOfContentsListItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const item = (
    <div
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-1 rounded-lg px-2 py-1 text-sm transition-colors",
        isHovered && colour.primary.background,
      )}
      key={title}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      onClick={() => {
        onClick?.();
        if (navigationId) {
          navigate({ to: `#${navigationId}` });
        }
      }}
    >
      <p
        className={cn(
          "min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap",
          isHovered && colour.primary.text,
        )}
      >
        {title}
      </p>

      {children}
    </div>
  );

  if (!tooltipContent) return item;

  return (
    <Tooltip content={tooltipContent} side={tooltipSide}>
      {item}
    </Tooltip>
  );
};
