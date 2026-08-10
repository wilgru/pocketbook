import type { ReactNode } from "react";

type BlankLayoutProps = {
  description?: ReactNode;
  content: ReactNode;
};

export const BlankLayout = ({ description, content }: BlankLayoutProps) => {
  return (
    <div className="flex-1 min-h-0 w-full min-w-0 box-border">
      <section className="h-full w-full relative flex-1 min-h-0 overflow-y-scroll px-3 pb-3">
        {description && <div className="min-h-0 flex">{description}</div>}

        {content}
      </section>
    </div>
  );
};
