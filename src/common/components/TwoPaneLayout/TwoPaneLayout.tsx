import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";

type TwoPaneLayoutProps = {
  sidebarTopContent?: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  className?: string;
  sidebarClassName?: string;
  sidebarTopContentClassName?: string;
  sidebarScrollClassName?: string;
  contentClassName?: string;
};

export const TwoPaneLayout = ({
  sidebarTopContent,
  sidebar,
  content,
  className,
  sidebarClassName,
  sidebarTopContentClassName,
  sidebarScrollClassName,
  contentClassName,
}: TwoPaneLayoutProps) => {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 w-full min-w-0 flex overflow-hidden",
        className,
      )}
    >
      <aside
        className={cn(
          "h-full w-60 min-h-0 flex flex-col border-r border-slate-200",
          sidebarClassName,
        )}
      >
        {sidebarTopContent && (
          <div className={cn("p-3", sidebarTopContentClassName)}>
            {sidebarTopContent}
          </div>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 flex flex-col gap-3 px-3 pb-6 overflow-y-scroll",
            sidebarScrollClassName,
          )}
        >
          {sidebar}
        </div>
      </aside>

      <section
        className={cn(
          "h-full flex-1 relative flex flex-col min-w-0",
          contentClassName,
        )}
      >
        {content}
      </section>
    </div>
  );
};
