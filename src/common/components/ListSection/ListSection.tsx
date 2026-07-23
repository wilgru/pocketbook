import type { ReactNode } from "react";

type ListSectionProps = {
  title?: string | null;
  children: ReactNode;
};

export const ListSection = ({ title, children }: ListSectionProps) => {
  return (
    <section className="flex flex-col gap-0.5 items-start">
      {title && (
        <h3 className="text-slate-500 text-xs w-full tracking-wider font-medium px-2 pb-1 pt-2 border-dashed border-b border-slate-200">
          {title}
        </h3>
      )}

      {children}
    </section>
  );
};
