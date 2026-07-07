import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { CreateTagModal } from "src/tags/components/CreateTagModal/CreateTagModal";
import { EditTagGroupModal } from "src/tags/components/EditTagGroupModal/EditTagGroupModal";
import type { Colour } from "src/colours/Colour.type";
import type { TagGroup } from "src/tags/Tag.type";

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

  return (
    <section
      className="flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row items-center gap-1">
        <h1 className="font-title text-slate-400 text-md">{title}</h1>

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

          <CreateTagModal tagGroupId={tagGroup?.id} />
        </Dialog.Root>
      </div>

      {children}

      {isEmpty && <p className="pl-3 pt-0.5 text-xs text-slate-400">Empty</p>}
    </section>
  );
};
