import { colours } from "src/colours/colours.constant";
import { cn } from "src/common/utils/cn";
import { getDisplayUrl } from "src/common/utils/getDisplayUrl";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";

type LinkPillProps = {
  link: Link;
  colour?: Colour;
};

export const LinkPill = ({ link, colour = colours.orange }: LinkPillProps) => {
  return (
    <a
      href={link.link}
      target="_blank"
      className={cn(
        "h-fit flex flex-row items-center text-sm rounded-full hover:underline min-w-0",
        colour.text,
      )}
    >
      <span className="truncate">{link.title || getDisplayUrl(link.link)}</span>
      <Icon weight="regular" iconName="arrowUpRight" size="xs" />
    </a>
  );
};
