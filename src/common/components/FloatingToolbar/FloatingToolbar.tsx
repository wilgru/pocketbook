import { cn } from "src/common/utils/cn";

type FloatingToolbarProps = {
  visible: boolean;
  children: React.ReactNode;
};

export const FloatingToolbar = ({ visible, children }: FloatingToolbarProps) => {
  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "bg-white rounded-2xl shadow-lg border border-slate-100 px-3 py-2",
        "transition-all duration-200 ease-out",
        // translate-y-3 (12px) provides a subtle upward slide-in effect
        visible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-3 opacity-0 pointer-events-none",
      )}
    >
      {children}
    </div>
  );
};
