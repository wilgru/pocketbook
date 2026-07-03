import { Input } from "src/common/components/Input/Input";
import type { Link } from "src/common/types/Link.type";

type LinkMultiInputProps = {
  links: Link[];
  onChange: (link: Link) => void;
  compact?: boolean;
};

export const LinkMultiInput = ({
  links,
  onChange,
  compact = false,
}: LinkMultiInputProps) => {
  return (
    <div
      className={
        compact
          ? "flex flex-col gap-2"
          : "flex flex-col gap-3 p-2 bg-slate-100 rounded-md"
      }
    >
      {links.map((link) => (
        <div key={link.id} className="flex gap-2">
          <Input
            id={`${link.id}-link`}
            type="url"
            size={compact ? "xs" : "md"}
            value={link.link}
            placeholder="URL"
            required
            onChange={(e) => onChange({ ...link, link: e.target.value })}
          />

          <Input
            id={link.id}
            type="text"
            size={compact ? "xs" : "md"}
            value={link.title || ""}
            placeholder="Display text (optional)"
            onChange={(e) =>
              onChange({ ...link, title: e.target.value || undefined })
            }
          />
        </div>
      ))}

    </div>
  );
};
