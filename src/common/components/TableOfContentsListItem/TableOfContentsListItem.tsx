import { useNavigate } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
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
        "flex w-full cursor-pointer items-center justify-between gap-1 rounded-lg px-2 py-1 text-sm transition-colors",
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
          "min-w-0 overflow-x-hidden text-ellipsis whitespace-nowrap",
          isHovered && colour.primary.text,
        )}
      >
        {title}
      </p>

      {children}
    </div>
  );
};
