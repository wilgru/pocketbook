import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "src/common/utils/cn";

type DialogProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyScrollable?: boolean;
  hideDividers?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
  "children"
>;

export const Dialog = ({
  title,
  children,
  footer,
  className,
  bodyScrollable = false,
  hideDividers = false,
}: DialogProps) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black opacity-25 data-[state=open]:animate-overlayShow" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-[50%] top-[50%] flex max-h-[85vh] translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl focus:outline-hidden",
          className,
        )}
      >
        <DialogPrimitive.Title
          className={cn(
            "shrink-0 px-4 pt-3 pb-2 font-title text-xl",
            !hideDividers && "border-b border-slate-200",
          )}
        >
          {title}
        </DialogPrimitive.Title>

        <div
          className={cn(
            "min-h-0 flex-1",
            bodyScrollable && "overflow-y-scroll",
          )}
        >
          {children}
        </div>

        {footer && (
          <div
            className={cn(
              "shrink-0 px-4 py-3",
              !hideDividers && "border-t border-slate-200",
            )}
          >
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
};
