import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";
import type { Colour } from "src/colours/Colour.type";

type TableOfContentsListItemProps = {
  title: string;
  children?: ReactNode;
  navigationId: string | null;
  onJumpTo: (id: string) => void;
  isActive?: boolean; // not using for now
  colour: Colour;
};

export const TableOfContentsListItem = ({
  title,
  children,
  navigationId,
  onJumpTo,
  colour,
}: TableOfContentsListItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between px-2 py-1 rounded-lg text-sm transition-colors cursor-pointer",
        isHovered && colour.primary.background,
      )}
      key={title}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      onClick={() => {
        if (navigationId) {
          onJumpTo(navigationId);
          navigate({ to: `#${navigationId}` });
        }
      }}
    >
      <p
        className={cn(
          "min-w-0 overflow-x-hidden whitespace-nowrap text-ellipsis",
          isHovered && colour.primary.text,
        )}
      >
        {title}
      </p>

      {children}
    </div>
  );
};
