import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";

type TwoPaneLayoutProps = {
  sidebarTopContent?: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  floatingToolbar?: ReactNode;
  showSidebarTopContentDivider?: boolean;
};

export const TwoPaneLayout = ({
  sidebarTopContent,
  sidebar,
  content,
  floatingToolbar,
  showSidebarTopContentDivider = false,
}: TwoPaneLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 pb-2 px-2 box-border">
      <div className="bg-white border border-slate-300 rounded-xl drop-shadow h-full w-full min-w-0 flex overflow-hidden">
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

        <div className="relative flex-1 min-h-0">
          <section className="h-full min-h-0 overflow-y-scroll flex justify-center px-8 pt-8">
            {content}
          </section>

          {floatingToolbar && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10">
              {floatingToolbar}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
