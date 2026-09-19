import { cn } from "cn";
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
}: PaneWithInspectorLayoutProps) => {
  return (
    <div className="box-border flex min-h-0 w-full min-w-0 flex-1 pb-2 pl-2">
      <div className="flex h-full w-full min-w-0 overflow-hidden rounded-xl border border-slate-300 bg-white drop-shadow-sm">
        <section className="flex h-full min-h-0 w-full justify-center overflow-y-scroll px-5 pt-5">
          {content}
        </section>
      </div>

      <aside className="mr-1 -mb-2 flex min-h-0 w-64 flex-col">
        {sidebarTopContent && (
          <div
            className={cn(
              "p-3",
              showSidebarTopContentDivider && "border-b border-slate-200",
            )}
          >
            {sidebarTopContent}
          </div>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-3 overflow-y-scroll px-3 pb-6",
            (!sidebarTopContent || showSidebarTopContentDivider) && "pt-3",
          )}
        >
          {sidebar}
        </div>
      </aside>
    </div>
  );
};
