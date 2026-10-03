import type { ReactNode } from "react";

type ListSectionProps = {
  title?: string | null;
  children: ReactNode;
};

export const ListSection = ({ title, children }: ListSectionProps) => {
  return (
    <section className="flex flex-col items-start gap-0.5">
      {title && (
        <h3 className="w-full border-b border-slate-200 px-2 pt-2 pb-1 text-xs font-medium tracking-wider text-slate-500">
          {title}
        </h3>
      )}

      {children}
    </section>
  );
};
