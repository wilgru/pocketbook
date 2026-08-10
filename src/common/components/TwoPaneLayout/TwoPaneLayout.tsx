import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";

type TwoPaneLayoutProps = {
  sidebarTopContent?: ReactNode;
  showSidebarTopContentDivider?: boolean;
  sidebar: ReactNode;
  content: ReactNode;
};

export const TwoPaneLayout = ({
  sidebarTopContent,
  showSidebarTopContentDivider = false,
  sidebar,
  content,
}: TwoPaneLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 pb-2 px-2 box-border">
      <div className="bg-white border border-slate-300 rounded-xl drop-shadow-sm h-full w-full min-w-0 flex overflow-hidden">
        <aside className="h-full w-60 min-h-0 flex flex-col border-r border-dashed border-slate-300">
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

        {content}
      </div>
    </div>
  );
};
