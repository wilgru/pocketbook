import { cn } from "cn";
import { colours } from "src/colours/colours.constant";
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
        "flex h-fit min-w-0 flex-row items-center rounded-full text-sm hover:underline",
        colour.text,
      )}
    >
      <span className="truncate">{link.title || getDisplayUrl(link.link)}</span>
      <Icon weight="regular" iconName="arrowUpRight" size="xs" />
    </a>
  );
};
