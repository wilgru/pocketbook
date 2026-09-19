import { cn } from "cn";
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
    <div className="box-border min-h-0 w-full min-w-0 flex-1 px-2 pb-2">
      <div className="flex h-full w-full min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white drop-shadow-sm">
        <aside className="flex h-full min-h-0 w-60 flex-col border-r border-dashed border-slate-300">
          {sidebarTopContent && (
            <div
              className={cn("p-3", showSidebarTopContentDivider && "border-b")}
            >
              {sidebarTopContent}
            </div>
          )}

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-3 overflow-y-scroll px-2 pb-6",
              (!sidebarTopContent || showSidebarTopContentDivider) && "pt-2",
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
