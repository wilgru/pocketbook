import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "src/common/components/Button/Button";
import { cn } from "src/common/utils/cn";
import { Icon } from "src/icons/components/Icon/Icon";
import { PocketbookSettingsModal } from "src/pocketbooks/components/PocketbookSettingsModal/PocketbookSettingsModal";
import type { Pocketbook } from "src/pocketbooks/Pocketbook.type";

type PocketbookSwitcherProps = {
  currentPocketbook: Pocketbook;
  pocketbooks: Pocketbook[];
};

const getPocketbookSummary = (pocketbook: Pocketbook): string => {
  const taskCount = pocketbook.taskCount ?? 0;
  const noteCount = pocketbook.noteCount ?? 0;

  if (taskCount === 0 && noteCount === 0) {
    return "No content";
  }

  const parts: string[] = [];
  if (taskCount > 0) {
    parts.push(`${taskCount} task${taskCount === 1 ? "" : "s"}`);
  }
  if (noteCount > 0) {
    parts.push(`${noteCount} note${noteCount === 1 ? "" : "s"}`);
  }

  return parts.join(", ");
};

export const PocketbookSwitcher = ({
  currentPocketbook,
  pocketbooks,
}: PocketbookSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex gap-2 justify-between border border-slate-300 rounded-2xl p-1.5 relative",
        `hover:${currentPocketbook.colour.backgroundPill}`,
      )}
    >
      <DropdownMenu.Root open={isOpen}>
        <DropdownMenu.Trigger>
          <button
            className="flex items-center gap-2 w-full h-full"
            onClick={() => setIsOpen(true)}
          >
            <Icon
              iconName={currentPocketbook.icon}
              className={cn(
                "w-8 h-8 p-1.5 rounded-lg",
                currentPocketbook.colour.textPill,
                currentPocketbook.colour.backgroundPill,
              )}
            />

            <div className="flex flex-col items-start">
              <h2 className="text-sm">{currentPocketbook.title}</h2>
              <p className="text-xs text-slate-400">
                {getPocketbookSummary(currentPocketbook)}
              </p>
            </div>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            sideOffset={-45}
            alignOffset={-7}
            onInteractOutside={() => setIsOpen(false)}
            onCloseAutoFocus={() => setIsOpen(false)}
            onEscapeKeyDown={() => setIsOpen(false)}
            align="start"
            className="w-56 flex flex-col flex-grow gap-2 bg-white border border-slate-200 rounded-2xl p-2 drop-shadow"
          >
            <DropdownMenu.Label className="pl-2 text-xs text-slate-400">
              Pocketbooks
            </DropdownMenu.Label>

            {pocketbooks.map((pocketbook) => (
              <DropdownMenu.Item key={pocketbook.id}>
                <Link
                  to="/$pocketbookId/notes"
                  params={{
                    pocketbookId: pocketbook.id,
                  }}
                  search={{ noteId: null }}
                  onClick={() => {
                    localStorage.setItem("lastUsedPocketbookId", pocketbook.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 leading-none text-sm p-2 outline-none rounded-xl cursor-pointer transition-colors",
                    currentPocketbook.id === pocketbook.id
                      ? pocketbook.colour.backgroundPill
                      : `hover:${pocketbook.colour.backgroundPill}`,
                  )}
                >
                  <Icon
                    iconName={pocketbook.icon}
                    className={cn(
                      "w-8 h-8 p-1.5 rounded-lg",
                      pocketbook.colour.textPill,
                      pocketbook.colour.backgroundPill,
                    )}
                  />

                  <div className="flex flex-col items-start">
                    <h2 className="text-sm">{pocketbook.title}</h2>
                    <p className="text-xs text-slate-400">
                      {getPocketbookSummary(pocketbook)}
                    </p>
                  </div>
                </Link>
              </DropdownMenu.Item>
            ))}

            <DropdownMenu.Separator className="my-1 border-t border-slate-200" />

            <DropdownMenu.Item className="flex items-center gap-2 leading-none text-sm p-2 outline-none rounded-xl cursor-pointer data-[highlighted]:bg-orange-100 data-[highlighted]:text-orange-500 transition-colors">
              <Link
                to={"/create-pocketbook"}
                className="flex items-center gap-2"
              >
                <Icon iconName="plus" size="sm" />
                Create new pocketbook
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root>
        <Dialog.Trigger asChild>
          <Button
            variant="ghost"
            size="sm"
            iconName="gear"
            colour={currentPocketbook.colour}
          />
        </Dialog.Trigger>

        <PocketbookSettingsModal pocketbook={currentPocketbook} />
      </Dialog.Root>
    </div>
  );
};
