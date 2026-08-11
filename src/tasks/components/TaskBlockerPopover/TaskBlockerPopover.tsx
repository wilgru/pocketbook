import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { colours } from "src/colours/colours.constant";
import { Button } from "src/common/components/Button/Button";
import { ControlPopover } from "src/common/components/ControlPopover/ControlPopover";

type TaskBlockerPopoverProps = {
  blockedComment: string | null;
  onChange: (blockedComment: string | null) => void;
  onOpenChange?: (open: boolean) => void;
};

export const TaskBlockerPopover = ({
  blockedComment,
  onChange,
  onOpenChange,
}: TaskBlockerPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftComment, setDraftComment] = useState(blockedComment ?? "");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDraftComment(blockedComment ?? "");
    }
    onOpenChange?.(open);
  };

  const clearBlocker = () => {
    onChange(null);
    handleOpenChange(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          iconName="handPalm"
          colour={colours.orange}
          ariaLabel="Add blocker"
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50"
          sideOffset={6}
          align="center"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ControlPopover
            className="w-72 p-3"
            clearActionLabel={blockedComment ? "Clear blocker" : undefined}
            onClearAction={blockedComment ? clearBlocker : undefined}
          >
            <div className="flex flex-col gap-2">
              <textarea
                rows={3}
                value={draftComment}
                onChange={(event) => {
                  const nextBlockedComment = event.target.value;
                  setDraftComment(nextBlockedComment);
                  onChange(nextBlockedComment || null);
                }}
                placeholder="What is blocking this task?"
                className="w-full resize-none rounded-md border border-slate-200 p-2 text-sm text-slate-700 outline-hidden focus:border-slate-400"
              />
            </div>
          </ControlPopover>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
