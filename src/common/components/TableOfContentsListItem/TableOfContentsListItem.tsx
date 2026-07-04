import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";

type TableOfContentsListItemProps = {
  title: string;
  icons?: { iconName: string; colour: Colour }[];
  navigationId: string | null;
  onJumpTo: (id: string) => void;
  isActive?: boolean; // not using for now
  colour: Colour;
};

export const TableOfContentsListItem = ({
  title,
  icons,
  navigationId,
  onJumpTo,
  colour,
}: TableOfContentsListItemProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
        isHovered && colour.textPill,
        isHovered && colour.backgroundPill,
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
      <h2 className="min-w-0 overflow-x-hidden whitespace-nowrap overflow-ellipsis">
        {title}
      </h2>

      {icons && icons.length > 0 && (
        <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
          {icons.map((icon, index) => (
            <Icon
              key={`${title}-${icon.iconName}-${index}`}
              iconName={icon.iconName}
              size="sm"
              className={icon.colour.text}
            />
          ))}
        </span>
      )}
    </li>
  );
};
