import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "src/common/components/Dropdown/Dropdown";
import { Icon } from "src/icons/components/Icon/Icon";
import type { Pocketbook } from "src/pocketbooks/pocketbooks.schema";

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

  return parts.join(" · ");
};

export const PocketbookSwitcher = ({
  currentPocketbook,
  pocketbooks,
}: PocketbookSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onOpenSettingsModal = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("modal", "pocketbook-settings");
    url.searchParams.set("modalPage", "general");

    window.history.replaceState({}, "", url.toString());
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="relative flex items-center justify-between gap-2 pr-1 pl-1.5">
      <DropdownMenu.Root open={isOpen}>
        <div className="flex items-center justify-center gap-2">
          <DropdownMenu.Trigger onClick={() => setIsOpen(true)}>
            <Icon
              iconName={currentPocketbook.icon}
              className={cn(
                "h-8 w-8 rounded-md p-1.5",
                currentPocketbook.colour.primary.text,
                currentPocketbook.colour.primary.textHovered,
                currentPocketbook.colour.primary.background,
                currentPocketbook.colour.primary.backgroundHovered,
              )}
            />
          </DropdownMenu.Trigger>

          <div className="flex flex-col items-start">
            <h2 className="font-title text-sm font-medium">
              {currentPocketbook.title}
            </h2>

            <p className="text-xs text-slate-400">
              {getPocketbookSummary(currentPocketbook)}
            </p>
          </div>
        </div>

        <Dropdown
          className="w-56 grow"
          sideOffset={4}
          alignOffset={-7}
          onInteractOutside={() => setIsOpen(false)}
          onCloseAutoFocus={() => setIsOpen(false)}
          onEscapeKeyDown={() => setIsOpen(false)}
          align="start"
        >
          <DropdownLabel>Pocketbooks</DropdownLabel>

          {pocketbooks.map((pocketbook) => (
            <DropdownItem key={pocketbook.id}>
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
                  "flex cursor-pointer items-center gap-2 rounded-xl p-2 text-sm leading-none outline-hidden transition-colors",
                  currentPocketbook.id === pocketbook.id
                    ? pocketbook.colour.primary.background
                    : pocketbook.colour.secondary.backgroundHovered,
                )}
              >
                <Icon
                  iconName={pocketbook.icon}
                  className={cn(
                    "h-8 w-8 rounded-md p-1.5",
                    pocketbook.colour.primary.text,
                    pocketbook.colour.primary.background,
                  )}
                />

                <div className="flex flex-col items-start">
                  <h2 className="text-sm">{pocketbook.title}</h2>
                  <p className="text-xs text-slate-400">
                    {getPocketbookSummary(pocketbook)}
                  </p>
                </div>
              </Link>
            </DropdownItem>
          ))}

          <DropdownSeparator />

          <DropdownItem
            colour={colours.orange}
            className="flex items-center gap-2"
          >
            <Link to={"/create-pocketbook"} className="flex items-center gap-2">
              <Icon iconName="plus" size="sm" />
              Create new pocketbook
            </Link>
          </DropdownItem>
        </Dropdown>
      </DropdownMenu.Root>

      <Button
        variant="ghost"
        size="sm"
        iconName="dotsThreeVertical"
        colour={currentPocketbook.colour}
        onClick={onOpenSettingsModal}
      />
    </div>
  );
};
