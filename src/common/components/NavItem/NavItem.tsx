import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";

type NavItemSize = "md" | "sm";

type NavItemProps = {
  iconName?: string;
  colour?: Colour;
  ghost?: boolean;
  title: string;
  preview?: string | number;
  to: string;
  size?: NavItemSize;
  params?: Record<string, string>;
  search?: Record<string, string>;
  activeOptions?: { exact?: boolean; includeSearch?: boolean };
};

const sizeStyles: Record<NavItemSize, { text: string; iconSize: "xs" | "sm" }> =
  {
    md: { text: "text-sm", iconSize: "sm" },
    sm: { text: "text-xs", iconSize: "xs" },
  };

export const NavItem = ({
  iconName,
  colour = colours.orange,
  ghost = false,
  title,
  preview,
  to,
  size = "md",
  params,
  search,
  activeOptions,
}: NavItemProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { text, iconSize } = sizeStyles[size];

  return (
    <Link
      to={to}
      params={params}
      search={search}
      activeOptions={activeOptions}
      onMouseOver={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      activeProps={{
        className: cn(colour.textPill, colour.backgroundPill),
      }}
      className={cn(
        "flex justify-between items-center gap-2 px-2 py-1 rounded-full transition-colors min-w-0",
        text,
        isHovered && colour.textPill,
        isHovered && colour.backgroundPill,
      )}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          <div
            className={cn(
              "flex items-center gap-2 min-w-0",
              (isHovered || isActive) && colour.textPill,
            )}
          >
            {iconName && (
              <Icon
                iconName={iconName}
                className={cn(
                  "flex-shrink-0",
                  isHovered || isActive || (colour && !ghost)
                    ? colour.textPill
                    : "text-slate-500",
                )}
                size={iconSize}
                weight={isHovered || isActive ? "fill" : "regular"}
              />
            )}

            <span className="truncate">{title}</span>
          </div>

          <p
            className={cn(
              "text-xs text-start font-medium mr-1",
              isHovered || isActive ? colour.textPill : "text-slate-400",
            )}
          >
            {preview}
          </p>
        </>
      )}
    </Link>
  );
};
