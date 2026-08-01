import { cn } from "src/common/utils/cn";
import { FloatingToolbar } from "../FloatingToolbar/FloatingToolbar";
import type { ReactNode } from "react";

type PaneWithInspectorLayoutProps = {
  sidebarTopContent?: ReactNode;
  sidebar: ReactNode;
  content: ReactNode;
  showSidebarTopContentDivider?: boolean;
  floatingToolbar?: ReactNode;
};

export const PaneWithInspectorLayout = ({
  sidebarTopContent,
  sidebar,
  content,
  showSidebarTopContentDivider = false,
  floatingToolbar,
}: PaneWithInspectorLayoutProps) => {
  return (
    <div className="flex-1 flex min-h-0 w-full min-w-0 pb-2 pl-2 box-border">
      <div className="bg-white border border-slate-300 rounded-xl drop-shadow-sm h-full w-full min-w-0 flex overflow-hidden">
        <section className="h-full w-full min-h-0 overflow-y-scroll flex justify-center px-5 pt-5">
          {content}
        </section>

        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-10">
          <FloatingToolbar visible={!!floatingToolbar}>
            {floatingToolbar}
          </FloatingToolbar>
        </div>
      </div>

      <aside className="w-64 min-h-0 mr-1 -mb-2 flex flex-col">
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
  );
};
