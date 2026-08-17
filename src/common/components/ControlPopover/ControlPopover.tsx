import * as Popover from "@radix-ui/react-popover";
import { cn } from "src/common/utils/cn";

type ControlPopoverProps = {
  children: React.ReactNode;
  trigger: React.ReactElement;
  className?: string;
  clearActionLabel?: string;
  onClearAction?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onOpenAutoFocus?: Popover.PopoverContentProps["onOpenAutoFocus"];
  onCloseAutoFocus?: Popover.PopoverContentProps["onCloseAutoFocus"];
};

export const ControlPopover = ({
  children,
  trigger,
  className,
  clearActionLabel,
  onClearAction,
  open,
  onOpenChange,
  onOpenAutoFocus,
  onCloseAutoFocus,
}: ControlPopoverProps) => {
  const content = (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg focus:outline-hidden">
      <div className={className}>{children}</div>

      {clearActionLabel && onClearAction && (
        <div className="flex flex-col items-center py-3 mx-3 gap-1 border-t border-slate-100">
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClearAction}
          >
            {clearActionLabel}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50"
          sideOffset={6}
          align="center"
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <>
            {content}

            <Popover.Arrow className="fill-white stroke-slate-200 stroke-2" />
          </>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
