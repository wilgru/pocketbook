import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
  const storageKey = `sidebarTagGroupExpanded:${tagGroup?.id ?? "default"}`;
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== "false";
    } catch {
      return true;
    }
  });

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
        {tagGroup ? (
          <Link
            to="/$pocketbookId/tagGroups/$tagGroupId"
            params={{
              pocketbookId: tagGroup.pocketbookId ?? "",
              tagGroupId: tagGroup.id,
            }}
            search={{ noteId: null }}
            className="py-0.5 font-title text-sm text-slate-400 hover:text-slate-600"
          >
            {title}
          </Link>
        ) : (
          <h1 className="py-0.5 font-title text-sm text-slate-400">{title}</h1>
        )}

        {tagGroup && (
          <Dialog.Root>
            {isHovered && (
              <Dialog.Trigger asChild>
                <Button
                  className="mb-1"
                  variant="ghost-strong"
                  size="xs"
                  iconName="slidersHorizontal"
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

        {isHovered && (
          <Button
            className="mb-1 ml-auto"
            variant="ghost-strong"
            size="xs"
            iconName={isExpanded ? "caretDown" : "caretRight"}
            colour={colour}
            onClick={toggleExpanded}
          />
        )}
      </div>

      {isExpanded && children}

      {isExpanded && isEmpty && (
        <p className="pt-0.5 text-xs text-slate-400 italic">Empty</p>
      )}
    </section>
  );
};
