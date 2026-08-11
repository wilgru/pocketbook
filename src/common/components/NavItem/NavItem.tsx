import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";
import type { IconName } from "src/icons/Icon.type";

type NavItemSize = "md" | "sm";

type NavItemProps = {
  iconName?: IconName | null;
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
        className: cn(colour.primary.text, colour.primary.background),
      }}
      className={cn(
        "flex min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-1 transition-colors",
        text,
        colour.secondary.textHovered,
        colour.secondary.backgroundHovered,
      )}
    >
      {({ isActive }: { isActive: boolean }) => (
        <>
          <div
            className={cn(
              "flex min-w-0 items-center gap-2",
              isHovered || isActive ? colour.primary.text : "text-slate-500",
            )}
          >
            <Icon
              iconName={iconName ?? null}
              className={cn(
                "shrink-0",
                isHovered || isActive || (colour && !ghost)
                  ? colour.primary.text
                  : "text-slate-500",
              )}
              size={iconSize}
              weight={isHovered || isActive ? "fill" : "regular"}
            />

            <span className="truncate">{title}</span>
          </div>

          {preview !== undefined && (
            <p
              className={cn(
                "mr-1 text-start text-xs",
                isHovered || isActive ? colour.primary.text : "text-slate-300",
              )}
            >
              {preview}
            </p>
          )}
        </>
      )}
    </Link>
  );
};
