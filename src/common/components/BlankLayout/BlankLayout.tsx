import type { ReactNode } from "react";

type BlankLayoutProps = {
  description?: ReactNode;
  content: ReactNode;
};

export const BlankLayout = ({ description, content }: BlankLayoutProps) => {
  return (
    <div className="box-border min-h-0 w-full min-w-0 flex-1">
      <section className="relative h-full min-h-0 w-full flex-1 overflow-y-scroll px-3 pb-3">
        {description && <div className="flex min-h-0">{description}</div>}

        {content}
      </section>
    </div>
  );
};
