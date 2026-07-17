import { cn } from "src/common/utils/cn";
import type { ReactNode } from "react";

type PaneWithInspectorLayoutProps = {
  sidebarTopContent?: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  showSidebarTopContentDivider?: boolean;
};

export const PaneWithInspectorLayout = ({
  sidebarTopContent,
  sidebar,
  content,
  showSidebarTopContentDivider = false,
}: PaneWithInspectorLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 box-border">
      <div className="h-full w-full min-w-0 flex overflow-hidden">
        <section className="relative flex-1 min-h-0 overflow-y-scroll flex justify-center px-8">
          {content}
        </section>

        <aside className="w-56 min-h-0 mb-2 mr-2 flex flex-col bg-white border border-slate-300 rounded-xl drop-shadow ">
          {sidebarTopContent && (
            <div
              className={cn(
                "p-3",
                showSidebarTopContentDivider && "border-b border-slate-100",
              )}
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
      </div>
    </div>
  );
};
