import { cn } from "src/common/utils/cn";

type ControlPopoverProps = {
  children: React.ReactNode;
  className?: string;
  clearActionLabel?: string;
  onClearAction?: () => void;
};

export const ControlPopover = ({
  children,
  className,
  clearActionLabel,
  onClearAction,
}: ControlPopoverProps) => {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl shadow-xl focus:outline-none",
        className,
      )}
    >
      {children}

      {clearActionLabel && onClearAction && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <div className="h-px bg-slate-100 w-full" />
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
};
