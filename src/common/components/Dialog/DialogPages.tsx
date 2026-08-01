import { cn } from "src/common/utils/cn";

export type DialogPage<TPage extends string> = {
  page: TPage;
  label: string;
};

type DialogPagesProps<TPage extends string> = {
  pages: readonly DialogPage<TPage>[];
  children: React.ReactNode;
  renderPageLink: (props: DialogPage<TPage>) => React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export const DialogPages = <TPage extends string>({
  pages,
  children,
  renderPageLink,
  className,
  contentClassName,
}: DialogPagesProps<TPage>) => {
  return (
    <div className={cn("flex h-full min-h-0", className)}>
      <nav className="w-40 shrink-0 border-r border-slate-200 p-3">
        <ul className="flex flex-col gap-1">
          {pages.map((page) => {
            return <li key={page.page}>{renderPageLink(page)}</li>;
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "h-full min-h-0 min-w-0 flex-1 overflow-y-auto p-3",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
};
