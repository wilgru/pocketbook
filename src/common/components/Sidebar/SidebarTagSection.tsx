import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { EditTagGroupModal } from "src/tags/components/EditTagGroupModal/EditTagGroupModal";
import { EditTagModal } from "src/tags/components/EditTagModal/EditTagModal";
import type { Colour } from "src/colours/Colour.type";
import type { TagGroup } from "src/tags/tags.schema";

export const SidebarTagSection = ({
  title,
  tagGroup,
  colour = colours.orange,
  isEmpty = false,
  children,
}: {
  title: string;
  tagGroup?: TagGroup;
  colour?: Colour;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const storageKey = `sidebarTagGroupExpanded:${tagGroup?.id ?? "default"}`;

  useEffect(() => {
    try {
      setIsExpanded(localStorage.getItem(storageKey) !== "false");
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  const toggleExpanded = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    try {
      localStorage.setItem(storageKey, String(next));
    } catch {
      // localStorage unavailable
    }
  };

  return (
    <section
      className="flex flex-col gap-px"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row items-center gap-1">
        <Button
          className="mb-1"
          variant="ghost-strong"
          size="xs"
          iconName={isExpanded ? "caretDown" : "caretRight"}
          colour={colour}
          onClick={toggleExpanded}
        />
        <h1 className="py-0.5 font-title text-sm text-slate-400">{title}</h1>

        {tagGroup && (
          <Dialog.Root>
            {isHovered && (
              <Dialog.Trigger asChild>
                <Button
                  className="mb-1"
                  variant="ghost-strong"
                  size="xs"
                  iconName="gear"
                  colour={colour}
                />
              </Dialog.Trigger>
            )}

            <EditTagGroupModal tagGroup={tagGroup} />
          </Dialog.Root>
        )}

        <Dialog.Root>
          {isHovered && (
            <Dialog.Trigger asChild>
              <Button
                className="mb-1"
                variant="ghost-strong"
                size="xs"
                iconName="plus"
                colour={colour}
              />
            </Dialog.Trigger>
          )}

          <EditTagModal tagGroupId={tagGroup?.id} />
        </Dialog.Root>
      </div>

      {isExpanded && children}

      {isExpanded && isEmpty && <p className="pt-0.5 text-xs text-slate-400 italic">Empty</p>}
    </section>
  );
};
