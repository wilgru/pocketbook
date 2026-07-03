import * as Popover from "@radix-ui/react-popover";
import { useEffect, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";
import { LinkMultiInput } from "src/common/components/LinkMultiInput/LinkMultiInput";
import type { Colour } from "src/colours/Colour.type";
import type { Link } from "src/common/types/Link.type";

type TaskLinksPopoverProps = {
  links: Link[];
  colour?: Colour;
  onChange: (links: Link[]) => void;
  onOpenChange?: (open: boolean) => void;
};

const createEmptyLink = (): Link => ({
  id: crypto.randomUUID(),
  title: undefined,
  link: "",
});

const toDraftLinks = (candidateLinks: Link[]): Link[] => [
  ...candidateLinks.filter((link) => link.link.trim() !== ""),
  createEmptyLink(),
];

export const TaskLinksPopover = ({
  links,
  colour = colours.orange,
  onChange,
  onOpenChange,
}: TaskLinksPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftLinks, setDraftLinks] = useState<Link[]>(() => toDraftLinks(links));

  const getPersistedLinks = (candidateLinks: Link[]) =>
    candidateLinks.filter((link) => link.link.trim() !== "");

  useEffect(() => {
    if (!isOpen) {
      setDraftLinks(toDraftLinks(links));
    }
  }, [links, isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDraftLinks(toDraftLinks(links));
    }
    onOpenChange?.(open);
  };

  const onChangeLink = (updatedLink: Link) => {
    setDraftLinks((current) => {
      const updatedLinks = toDraftLinks(
        current.map((link) =>
        link.id === updatedLink.id ? updatedLink : link,
        ),
      );
      onChange(getPersistedLinks(updatedLinks));
      return updatedLinks;
    });
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button colour={colour} variant="ghost" size="sm" iconName="link" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50"
          sideOffset={6}
          align="center"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ControlPopover className="p-3 w-[360px]">
            <LinkMultiInput
              compact
              links={draftLinks}
              onChange={onChangeLink}
            />
          </ControlPopover>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
