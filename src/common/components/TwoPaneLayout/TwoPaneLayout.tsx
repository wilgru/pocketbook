import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";

type TwoPaneLayoutProps = {
  sidebarTopContent?: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  showSidebarTopContentDivider?: boolean;
};

export const TwoPaneLayout = ({
  sidebarTopContent,
  sidebar,
  content,
  showSidebarTopContentDivider = false,
}: TwoPaneLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 flex overflow-hidden">
      <aside className="h-full w-60 min-h-0 flex flex-col border-r border-slate-200">
        {sidebarTopContent && (
          <div
            className={cn("p-3", showSidebarTopContentDivider && "border-b")}
          >
            {sidebarTopContent}
          </div>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 flex flex-col gap-3 px-3 pb-6 overflow-y-scroll",
            (!sidebarTopContent || showSidebarTopContentDivider) && "pt-3",
          )}
        >
          {sidebar}
        </div>
      </aside>

      <section className="relative flex-1 min-h-0 overflow-y-scroll flex justify-center px-8 pt-8">
        {content}
      </section>
    </div>
  );
};
