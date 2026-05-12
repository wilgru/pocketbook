import { useNavigate } from "@tanstack/react-router";
import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import type { ReactNode } from "react";
import type { Colour } from "src/colours/Colour.type";
import type { TableOfContentsItem } from "src/tableOfContents/TableOfContentsItem.type";

type TableOfContentsListItemProps = {
  item: TableOfContentsItem;
  onJumpTo: (id: string) => void;
  isActive?: boolean; // not using for now
  colour: Colour;
};

const TableOfContentsListItem = ({
  item,
  onJumpTo,
  colour,
}: TableOfContentsListItemProps) => {
  const navigate = useNavigate();

  return (
    <li
      key={item.title}
      onClick={() => {
        item.navigationId && onJumpTo(item.navigationId);
        navigate({ to: `#${item.navigationId}` });
      }}
    >
      <h2
        className={cn(
          "text-sm py-1 px-3 cursor-pointer rounded-full transition-colors flex items-center gap-2 max-w-full",
          item.italic && "italic",
          colour.backgroundGlow,
          colour.textPillInverted,
        )}
      >
        <span className="min-w-0 overflow-x-hidden whitespace-nowrap overflow-ellipsis">
          {item.title}
        </span>

        {item.icons && item.icons.length > 0 && (
          <span className="flex items-center gap-1 shrink-0" aria-hidden="true">
            {item.icons.map((icon, index) => (
              <Icon
                key={`${item.title}-${icon.iconName}-${index}`}
                iconName={icon.iconName}
                size="sm"
                className={icon.colour.text}
              />
            ))}
          </span>
        )}
      </h2>
    </li>
  );
};

type TableOfContentsProps = {
  title: string;
  items: TableOfContentsItem[];
  activeItemNavigationId: string;
  onJumpTo: (id: string) => void;
  colour?: Colour;
  children?: ReactNode;
};

export default function TableOfContents({
  title,
  items,
  onJumpTo,
  colour = colours.orange,
  children,
}: TableOfContentsProps) {
  let previousGroup: string | undefined;

  return (
    <nav
      aria-label={`${title} table of contents`}
      className="w-56 m-4 pl-2 pb-2 max-h-[calc(100vh-2rem)] overflow-y-auto opacity-60 hover:opacity-100 transition-opacity"
    >
      <div className="sticky top-0 z-10 bg-white pb-2">
        <h2
          className={cn(
            "font-title text-lg pt-1 px-3 overflow-x-hidden whitespace-nowrap overflow-ellipsis cursor-pointer rounded-full overflow-clip transition-color",
            colour.backgroundGlow,
            colour.textPillInverted,
          )}
        >
          {title}
        </h2>
        {children && <div className="pt-2 px-1">{children}</div>}
      </div>

      <ul>
        {items.map((item, index) => {
          const showGroupTitle = item.group && item.group !== previousGroup;
          if (item.group) previousGroup = item.group;

          return (
            <div key={`${item.navigationId}-${index}`}>
              {showGroupTitle && (
                <li className="pointer-events-none">
                  <h3 className="text-xs px-3 pt-1 text-gray-400 tracking-wide">
                    {item.group}
                  </h3>
                </li>
              )}
              <TableOfContentsListItem
                item={item}
                colour={colour}
                onJumpTo={onJumpTo}
              />
            </div>
          );
        })}
      </ul>
    </nav>
  );
}
